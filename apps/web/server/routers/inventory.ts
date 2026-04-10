import { z } from 'zod';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const inventoryRouter = router({
  items: router({
    list: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z
          .object({
            categoryId: z.string().uuid().optional(),
            search: z.string().optional(),
          })
          .optional(),
      )
      .query(async ({ ctx, input }) => {
        return ctx.prisma.inventoryItem.findMany({
          where: {
            restaurantId: ctx.restaurantId,
            ...(input?.categoryId && { categoryId: input.categoryId }),
            ...(input?.search && {
              name: { contains: input.search, mode: 'insensitive' as const },
            }),
          },
          include: {
            category: { select: { id: true, name: true } },
            supplier: { select: { id: true, name: true } },
          },
          orderBy: { name: 'asc' },
        });
      }),

    create: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          name: z.string().min(1),
          categoryId: z.string().uuid().optional(),
          unit: z.string().default('kg'),
          currentStock: z.number().min(0).default(0),
          minStock: z.number().min(0).default(0),
          costPerUnit: z.number().min(0).default(0),
          supplierId: z.string().uuid().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.inventoryItem.create({
          data: { ...input, restaurantId: ctx.restaurantId },
        });
      }),

    update: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          id: z.string().uuid(),
          name: z.string().min(1).optional(),
          categoryId: z.string().uuid().nullable().optional(),
          unit: z.string().optional(),
          minStock: z.number().min(0).optional(),
          costPerUnit: z.number().min(0).optional(),
          supplierId: z.string().uuid().nullable().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.inventoryItem.update({
          where: { id, restaurantId: ctx.restaurantId },
          data,
        });
      }),
  }),

  stock: router({
    adjust: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          inventoryItemId: z.string().uuid(),
          type: z.enum(['IN', 'OUT', 'WASTE', 'ADJUST']),
          quantity: z.number(),
          reference: z.string().optional(),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Create stock transaction
        const transaction = await ctx.prisma.stockTransaction.create({
          data: {
            restaurantId: ctx.restaurantId,
            inventoryItemId: input.inventoryItemId,
            type: input.type,
            quantity: input.quantity,
            reference: input.reference,
            notes: input.notes,
            userId: ctx.user.id,
          },
        });

        // Update current stock
        const adjustment =
          input.type === 'IN'
            ? input.quantity
            : input.type === 'ADJUST'
              ? input.quantity // ADJUST can be positive or negative
              : -Math.abs(input.quantity);

        await ctx.prisma.inventoryItem.update({
          where: { id: input.inventoryItemId, restaurantId: ctx.restaurantId },
          data: { currentStock: { increment: adjustment } },
        });

        return transaction;
      }),
  }),

  lowStock: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .query(async ({ ctx }) => {
      const items = await ctx.prisma.inventoryItem.findMany({
        where: { restaurantId: ctx.restaurantId },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      });

      return items.filter(
        (item) => Number(item.currentStock) <= Number(item.minStock),
      );
    }),

  purchaseOrder: router({
    create: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          supplierId: z.string().uuid(),
          items: z.array(
            z.object({
              inventoryItemId: z.string().uuid(),
              name: z.string(),
              qty: z.number().positive(),
              unit: z.string(),
              rate: z.number().positive(),
            }),
          ).min(1),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

        const lastPo = await ctx.prisma.purchaseOrder.findFirst({
          where: {
            restaurantId: ctx.restaurantId,
            poNumber: { startsWith: `PO-${dateStr}` },
          },
          orderBy: { poNumber: 'desc' },
        });

        const seq = lastPo
          ? parseInt(lastPo.poNumber.split('-').pop() || '0', 10) + 1
          : 1;
        const poNumber = `PO-${dateStr}-${String(seq).padStart(4, '0')}`;

        const itemsWithAmount = input.items.map((item) => ({
          ...item,
          amount: item.qty * item.rate,
        }));
        const total = itemsWithAmount.reduce((sum, i) => sum + i.amount, 0);

        return ctx.prisma.purchaseOrder.create({
          data: {
            restaurantId: ctx.restaurantId,
            supplierId: input.supplierId,
            poNumber,
            items: itemsWithAmount,
            total,
            notes: input.notes,
          },
          include: { supplier: true },
        });
      }),
  }),
});

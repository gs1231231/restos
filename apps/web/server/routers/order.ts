import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const orderRouter = router({
  create: restaurantProcedure
    .input(
      z.object({
        type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'ONLINE']).default('DINE_IN'),
        platform: z.enum(['POS', 'ZOMATO', 'SWIGGY', 'ONDC', 'OWN_WEBSITE']).default('POS'),
        tableId: z.string().uuid().optional(),
        customerId: z.string().uuid().optional(),
        pax: z.number().int().positive().optional(),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            menuItemId: z.string().uuid(),
            variantId: z.string().uuid().optional(),
            quantity: z.number().int().positive().default(1),
            notes: z.string().optional(),
            modifiers: z
              .array(z.object({ modifierId: z.string().uuid() }))
              .optional(),
          }),
        ).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input;

      // Generate order number
      const settings = await ctx.prisma.restaurantSettings.findUnique({
        where: { restaurantId: ctx.restaurantId },
      });
      const prefix = settings?.orderPrefix ?? 'ORD';
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

      const lastOrder = await ctx.prisma.order.findFirst({
        where: {
          restaurantId: ctx.restaurantId,
          orderNumber: { startsWith: `${prefix}-${dateStr}` },
        },
        orderBy: { orderNumber: 'desc' },
      });

      const seq = lastOrder
        ? parseInt(lastOrder.orderNumber.split('-').pop() || '0', 10) + 1
        : 1;
      const orderNumber = `${prefix}-${dateStr}-${String(seq).padStart(4, '0')}`;

      // Fetch menu item details for pricing
      const menuItemIds = items.map((i) => i.menuItemId);
      const menuItems = await ctx.prisma.menuItem.findMany({
        where: { id: { in: menuItemIds }, restaurantId: ctx.restaurantId },
        include: { variants: true },
      });
      const menuMap = new Map(menuItems.map((m) => [m.id, m]));

      // Fetch modifiers
      const allModifierIds = items.flatMap((i) => i.modifiers?.map((m) => m.modifierId) ?? []);
      const modifiers = allModifierIds.length
        ? await ctx.prisma.menuModifier.findMany({ where: { id: { in: allModifierIds } } })
        : [];
      const modifierMap = new Map(modifiers.map((m) => [m.id, m]));

      // Build order items
      let subtotal = 0;
      let taxAmount = 0;

      const orderItems = items.map((item) => {
        const mi = menuMap.get(item.menuItemId);
        if (!mi) throw new TRPCError({ code: 'BAD_REQUEST', message: `Menu item ${item.menuItemId} not found` });

        const variant = item.variantId ? mi.variants.find((v) => v.id === item.variantId) : null;
        const unitPrice = variant ? Number(variant.price) : Number(mi.price);

        const itemModifiers = (item.modifiers ?? []).map((m) => {
          const mod = modifierMap.get(m.modifierId);
          if (!mod) throw new TRPCError({ code: 'BAD_REQUEST', message: `Modifier ${m.modifierId} not found` });
          return { modifierId: mod.id, modifierName: mod.name, price: Number(mod.price) };
        });

        const modifierTotal = itemModifiers.reduce((sum, m) => sum + m.price, 0);
        const totalPrice = (unitPrice + modifierTotal) * item.quantity;
        const tax = totalPrice * (Number(mi.taxRate) / 100);

        subtotal += totalPrice;
        taxAmount += tax;

        return {
          menuItemId: mi.id,
          menuItemName: mi.name,
          variantId: variant?.id,
          variantName: variant?.name,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          taxRate: Number(mi.taxRate),
          notes: item.notes,
          modifiers: itemModifiers,
        };
      });

      const total = subtotal + taxAmount;

      const order = await ctx.prisma.order.create({
        data: {
          restaurantId: ctx.restaurantId,
          orderNumber,
          type: orderData.type,
          platform: orderData.platform,
          tableId: orderData.tableId,
          customerId: orderData.customerId,
          captainId: ctx.user.id,
          pax: orderData.pax,
          notes: orderData.notes,
          subtotal,
          taxAmount,
          total,
          items: {
            create: orderItems.map((oi) => ({
              menuItemId: oi.menuItemId,
              menuItemName: oi.menuItemName,
              variantId: oi.variantId,
              variantName: oi.variantName,
              quantity: oi.quantity,
              unitPrice: oi.unitPrice,
              totalPrice: oi.totalPrice,
              taxRate: oi.taxRate,
              notes: oi.notes,
              modifiers: {
                create: oi.modifiers.map((m) => ({
                  modifierId: m.modifierId,
                  modifierName: m.modifierName,
                  price: m.price,
                })),
              },
            })),
          },
        },
        include: { items: { include: { modifiers: true } } },
      });

      // Mark table as occupied if dine-in
      if (orderData.tableId && orderData.type === 'DINE_IN') {
        await ctx.prisma.table.update({
          where: { id: orderData.tableId },
          data: { status: 'OCCUPIED' },
        });
      }

      return order;
    }),

  get: restaurantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.order.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
        include: {
          items: { include: { modifiers: true, menuItem: true } },
          table: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, phone: true } },
          captain: { select: { id: true, name: true } },
          kots: { include: { items: true } },
          bill: true,
        },
      });
    }),

  list: restaurantProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'ONLINE']).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
          tableId: z.string().uuid().optional(),
          limit: z.number().int().positive().default(50),
          cursor: z.string().uuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          ...(input?.status && { status: input.status }),
          ...(input?.type && { type: input.type }),
          ...(input?.tableId && { tableId: input.tableId }),
          ...((input?.dateFrom || input?.dateTo) && {
            createdAt: {
              ...(input?.dateFrom && { gte: input.dateFrom }),
              ...(input?.dateTo && { lte: input.dateTo }),
            },
          }),
        },
        include: {
          items: { select: { id: true, menuItemName: true, quantity: true, totalPrice: true, status: true } },
          table: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: (input?.limit ?? 50) + 1,
        ...(input?.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (orders.length > (input?.limit ?? 50)) {
        const next = orders.pop();
        nextCursor = next?.id;
      }

      return { orders, nextCursor };
    }),

  updateStatus: restaurantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'BILLED', 'PAID', 'CANCELLED']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.update({
        where: { id: input.id, restaurantId: ctx.restaurantId },
        data: { status: input.status },
      });

      // If cancelled or paid, free the table
      if (['CANCELLED', 'PAID'].includes(input.status) && order.tableId) {
        await ctx.prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'CLEANING' },
        });
      }

      return order;
    }),

  addItems: restaurantProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        items: z.array(
          z.object({
            menuItemId: z.string().uuid(),
            variantId: z.string().uuid().optional(),
            quantity: z.number().int().positive().default(1),
            notes: z.string().optional(),
          }),
        ).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findFirstOrThrow({
        where: { id: input.orderId, restaurantId: ctx.restaurantId },
      });

      const menuItemIds = input.items.map((i) => i.menuItemId);
      const menuItems = await ctx.prisma.menuItem.findMany({
        where: { id: { in: menuItemIds }, restaurantId: ctx.restaurantId },
        include: { variants: true },
      });
      const menuMap = new Map(menuItems.map((m) => [m.id, m]));

      let addedSubtotal = 0;
      let addedTax = 0;

      const newItems = input.items.map((item) => {
        const mi = menuMap.get(item.menuItemId);
        if (!mi) throw new TRPCError({ code: 'BAD_REQUEST', message: `Menu item ${item.menuItemId} not found` });

        const variant = item.variantId ? mi.variants.find((v) => v.id === item.variantId) : null;
        const unitPrice = variant ? Number(variant.price) : Number(mi.price);
        const totalPrice = unitPrice * item.quantity;
        const tax = totalPrice * (Number(mi.taxRate) / 100);

        addedSubtotal += totalPrice;
        addedTax += tax;

        return {
          orderId: order.id,
          menuItemId: mi.id,
          menuItemName: mi.name,
          variantId: variant?.id,
          variantName: variant?.name,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          taxRate: Number(mi.taxRate),
          notes: item.notes,
        };
      });

      await ctx.prisma.orderItem.createMany({ data: newItems });

      return ctx.prisma.order.update({
        where: { id: order.id },
        data: {
          subtotal: { increment: addedSubtotal },
          taxAmount: { increment: addedTax },
          total: { increment: addedSubtotal + addedTax },
        },
        include: { items: { include: { modifiers: true } } },
      });
    }),

  removeItem: restaurantProcedure
    .input(z.object({ orderItemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.orderItem.findUniqueOrThrow({
        where: { id: input.orderItemId },
        include: { order: true },
      });

      if (item.order.restaurantId !== ctx.restaurantId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Item does not belong to your restaurant' });
      }

      const taxAmount = Number(item.totalPrice) * (Number(item.taxRate) / 100);

      await ctx.prisma.orderItem.delete({ where: { id: input.orderItemId } });

      return ctx.prisma.order.update({
        where: { id: item.orderId },
        data: {
          subtotal: { decrement: Number(item.totalPrice) },
          taxAmount: { decrement: taxAmount },
          total: { decrement: Number(item.totalPrice) + taxAmount },
        },
        include: { items: { include: { modifiers: true } } },
      });
    }),

  transfer: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER', 'CAPTAIN'))
    .input(
      z.object({
        orderId: z.string().uuid(),
        newTableId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findFirstOrThrow({
        where: { id: input.orderId, restaurantId: ctx.restaurantId },
      });

      const oldTableId = order.tableId;

      const updated = await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: { tableId: input.newTableId },
      });

      // Free old table, occupy new table
      if (oldTableId) {
        await ctx.prisma.table.update({
          where: { id: oldTableId },
          data: { status: 'AVAILABLE' },
        });
      }
      await ctx.prisma.table.update({
        where: { id: input.newTableId },
        data: { status: 'OCCUPIED' },
      });

      return updated;
    }),
});

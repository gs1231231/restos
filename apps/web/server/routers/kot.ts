import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, restaurantProcedure } from '../trpc';

export const kotRouter = router({
  generate: restaurantProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        itemIds: z.array(z.string().uuid()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findFirstOrThrow({
        where: { id: input.orderId, restaurantId: ctx.restaurantId },
        include: { items: { where: { id: { in: input.itemIds } }, include: { menuItem: true } } },
      });

      if (order.items.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No matching items found' });
      }

      // Group items by station
      const stationGroups = new Map<string, typeof order.items>();
      for (const item of order.items) {
        const station = item.menuItem.station ?? 'HOT';
        const group = stationGroups.get(station) ?? [];
        group.push(item);
        stationGroups.set(station, group);
      }

      // Generate KOT number base
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

      const lastKot = await ctx.prisma.kOT.findFirst({
        where: {
          restaurantId: ctx.restaurantId,
          kotNumber: { startsWith: `KOT-${dateStr}` },
        },
        orderBy: { kotNumber: 'desc' },
      });

      let seq = lastKot
        ? parseInt(lastKot.kotNumber.split('-').pop() || '0', 10) + 1
        : 1;

      const kots = [];
      for (const [station, items] of stationGroups) {
        const kotNumber = `KOT-${dateStr}-${String(seq++).padStart(4, '0')}`;

        const kot = await ctx.prisma.kOT.create({
          data: {
            restaurantId: ctx.restaurantId,
            orderId: input.orderId,
            kotNumber,
            station,
            items: {
              connect: items.map((i) => ({ id: i.id })),
            },
          },
          include: { items: true },
        });

        // Update item statuses
        await ctx.prisma.orderItem.updateMany({
          where: { id: { in: items.map((i) => i.id) } },
          data: { status: 'PREPARING', kotId: kot.id },
        });

        kots.push(kot);
      }

      return kots;
    }),

  list: restaurantProcedure
    .input(
      z
        .object({
          station: z.string().optional(),
          status: z.enum(['NEW', 'ACKNOWLEDGED', 'PREPARING', 'READY']).optional(),
          orderId: z.string().uuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.kOT.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          ...(input?.station && { station: input.station }),
          ...(input?.status && { status: input.status }),
          ...(input?.orderId && { orderId: input.orderId }),
        },
        include: {
          items: { include: { modifiers: true } },
          order: { select: { orderNumber: true, tableId: true, table: { select: { name: true } } } },
        },
        orderBy: { printedAt: 'desc' },
      });
    }),

  updateItemStatus: restaurantProcedure
    .input(
      z.object({
        kotId: z.string().uuid(),
        itemId: z.string().uuid(),
        status: z.enum(['PREPARING', 'READY', 'SERVED', 'CANCELLED']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify KOT belongs to restaurant
      await ctx.prisma.kOT.findFirstOrThrow({
        where: { id: input.kotId, restaurantId: ctx.restaurantId },
      });

      const updatedItem = await ctx.prisma.orderItem.update({
        where: { id: input.itemId, kotId: input.kotId },
        data: { status: input.status },
      });

      // Check if all items in KOT are READY -> mark KOT as READY
      const allItems = await ctx.prisma.orderItem.findMany({
        where: { kotId: input.kotId },
      });

      const allReady = allItems.every((i) => i.status === 'READY' || i.status === 'SERVED' || i.status === 'CANCELLED');
      if (allReady) {
        await ctx.prisma.kOT.update({
          where: { id: input.kotId },
          data: { status: 'READY' },
        });
      }

      return updatedItem;
    }),

  reprint: restaurantProcedure
    .input(z.object({ kotId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const kot = await ctx.prisma.kOT.findFirstOrThrow({
        where: { id: input.kotId, restaurantId: ctx.restaurantId },
        include: {
          items: { include: { modifiers: true } },
          order: { select: { orderNumber: true, table: { select: { name: true } } } },
        },
      });

      await ctx.prisma.kOT.update({
        where: { id: input.kotId },
        data: { printedAt: new Date() },
      });

      return kot;
    }),
});

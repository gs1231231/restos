import { z } from 'zod';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const reportRouter = router({
  dashboard: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .query(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayOrders, todayRevenue, activeOrders, occupiedTables, totalTables] =
        await Promise.all([
          ctx.prisma.order.count({
            where: {
              restaurantId: ctx.restaurantId,
              createdAt: { gte: today, lt: tomorrow },
              status: { not: 'CANCELLED' },
            },
          }),
          ctx.prisma.order.aggregate({
            where: {
              restaurantId: ctx.restaurantId,
              createdAt: { gte: today, lt: tomorrow },
              status: { in: ['PAID', 'BILLED', 'SERVED'] },
            },
            _sum: { total: true },
          }),
          ctx.prisma.order.count({
            where: {
              restaurantId: ctx.restaurantId,
              status: { in: ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
            },
          }),
          ctx.prisma.table.count({
            where: { restaurantId: ctx.restaurantId, status: 'OCCUPIED', isActive: true },
          }),
          ctx.prisma.table.count({
            where: { restaurantId: ctx.restaurantId, isActive: true },
          }),
        ]);

      // Top 5 items today
      const topItems = await ctx.prisma.orderItem.groupBy({
        by: ['menuItemName'],
        where: {
          order: {
            restaurantId: ctx.restaurantId,
            createdAt: { gte: today, lt: tomorrow },
            status: { not: 'CANCELLED' },
          },
          status: { not: 'CANCELLED' },
        },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      });

      // Payment method breakdown
      const paymentBreakdown = await ctx.prisma.payment.groupBy({
        by: ['method'],
        where: {
          restaurantId: ctx.restaurantId,
          paidAt: { gte: today, lt: tomorrow },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      });

      return {
        todayOrders,
        todayRevenue: Number(todayRevenue._sum.total ?? 0),
        activeOrders,
        occupiedTables,
        totalTables,
        occupancyRate: totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0,
        topItems: topItems.map((i) => ({
          name: i.menuItemName,
          quantity: i._sum.quantity ?? 0,
          revenue: Number(i._sum.totalPrice ?? 0),
        })),
        paymentBreakdown: paymentBreakdown.map((p) => ({
          method: p.method,
          total: Number(p._sum.amount ?? 0),
          count: p._count,
        })),
      };
    }),

  sales: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        groupBy: z.enum(['day', 'week', 'month']).default('day'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          createdAt: { gte: input.from, lte: input.to },
          status: { in: ['PAID', 'BILLED', 'SERVED'] },
        },
        select: {
          total: true,
          subtotal: true,
          taxAmount: true,
          discountAmount: true,
          type: true,
          platform: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Aggregate by date
      const dailyMap = new Map<string, { date: string; revenue: number; orders: number; tax: number; discount: number }>();

      for (const order of orders) {
        let key: string;
        const d = order.createdAt;

        if (input.groupBy === 'day') {
          key = d.toISOString().slice(0, 10);
        } else if (input.groupBy === 'week') {
          const weekStart = new Date(d);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().slice(0, 10);
        } else {
          key = d.toISOString().slice(0, 7);
        }

        const existing = dailyMap.get(key) ?? { date: key, revenue: 0, orders: 0, tax: 0, discount: 0 };
        existing.revenue += Number(order.total);
        existing.orders += 1;
        existing.tax += Number(order.taxAmount);
        existing.discount += Number(order.discountAmount);
        dailyMap.set(key, existing);
      }

      // Type breakdown
      const typeBreakdown = new Map<string, { count: number; revenue: number }>();
      for (const order of orders) {
        const existing = typeBreakdown.get(order.type) ?? { count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += Number(order.total);
        typeBreakdown.set(order.type, existing);
      }

      // Platform breakdown
      const platformBreakdown = new Map<string, { count: number; revenue: number }>();
      for (const order of orders) {
        const existing = platformBreakdown.get(order.platform) ?? { count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += Number(order.total);
        platformBreakdown.set(order.platform, existing);
      }

      return {
        summary: {
          totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
          totalOrders: orders.length,
          totalTax: orders.reduce((sum, o) => sum + Number(o.taxAmount), 0),
          totalDiscount: orders.reduce((sum, o) => sum + Number(o.discountAmount), 0),
          avgOrderValue: orders.length > 0
            ? orders.reduce((sum, o) => sum + Number(o.total), 0) / orders.length
            : 0,
        },
        timeline: Array.from(dailyMap.values()),
        byType: Array.from(typeBreakdown.entries()).map(([type, data]) => ({ type, ...data })),
        byPlatform: Array.from(platformBreakdown.entries()).map(([platform, data]) => ({ platform, ...data })),
      };
    }),

  items: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
          limit: z.number().int().positive().default(20),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const from = input?.from ?? (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
      const to = input?.to ?? new Date();

      const popular = await ctx.prisma.orderItem.groupBy({
        by: ['menuItemId', 'menuItemName'],
        where: {
          order: {
            restaurantId: ctx.restaurantId,
            createdAt: { gte: from, lte: to },
            status: { not: 'CANCELLED' },
          },
          status: { not: 'CANCELLED' },
        },
        _sum: { quantity: true, totalPrice: true },
        _count: true,
        orderBy: { _sum: { quantity: 'desc' } },
        take: input?.limit ?? 20,
      });

      return popular.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.menuItemName,
        totalQuantity: item._sum.quantity ?? 0,
        totalRevenue: Number(item._sum.totalPrice ?? 0),
        orderCount: item._count,
      }));
    }),

  hourly: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z
        .object({
          date: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const date = input?.date ?? new Date();
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const orders = await ctx.prisma.order.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          createdAt: { gte: dayStart, lt: dayEnd },
          status: { not: 'CANCELLED' },
        },
        select: { total: true, createdAt: true },
      });

      // Group by hour (0-23)
      const hourly = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        revenue: 0,
        orders: 0,
      }));

      for (const order of orders) {
        const h = order.createdAt.getHours();
        hourly[h]!.revenue += Number(order.total);
        hourly[h]!.orders += 1;
      }

      return hourly;
    }),
});

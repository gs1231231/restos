import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, restaurantProcedure } from '../trpc';

export const customerRouter = router({
  search: restaurantProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.customer.findMany({
        where: {
          tenantId: ctx.tenantId,
          OR: [
            { phone: { contains: input.query } },
            { name: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          loyaltyPoints: true,
          totalOrders: true,
          totalSpend: true,
          segment: true,
          lastVisit: true,
        },
        take: 20,
        orderBy: { name: 'asc' },
      });
    }),

  get: restaurantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.customer.findFirstOrThrow({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,
              type: true,
            },
          },
          loyaltyTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }),

  list: restaurantProcedure
    .input(
      z
        .object({
          segment: z.string().optional(),
          limit: z.number().int().positive().default(50),
          cursor: z.string().uuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const customers = await ctx.prisma.customer.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(input?.segment && { segment: input.segment }),
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          loyaltyPoints: true,
          totalOrders: true,
          totalSpend: true,
          segment: true,
          lastVisit: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: (input?.limit ?? 50) + 1,
        ...(input?.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (customers.length > (input?.limit ?? 50)) {
        const next = customers.pop();
        nextCursor = next?.id;
      }

      return { customers, nextCursor };
    }),

  loyaltyAdd: restaurantProcedure
    .input(
      z.object({
        customerId: z.string().uuid(),
        points: z.number().int().positive(),
        orderId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify customer belongs to tenant
      await ctx.prisma.customer.findFirstOrThrow({
        where: { id: input.customerId, tenantId: ctx.tenantId },
      });

      await ctx.prisma.loyaltyTransaction.create({
        data: {
          customerId: input.customerId,
          type: 'EARN',
          points: input.points,
          orderId: input.orderId,
        },
      });

      return ctx.prisma.customer.update({
        where: { id: input.customerId },
        data: { loyaltyPoints: { increment: input.points } },
      });
    }),

  loyaltyRedeem: restaurantProcedure
    .input(
      z.object({
        customerId: z.string().uuid(),
        points: z.number().int().positive(),
        orderId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findFirstOrThrow({
        where: { id: input.customerId, tenantId: ctx.tenantId },
      });

      if (customer.loyaltyPoints < input.points) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient loyalty points. Available: ${customer.loyaltyPoints}, Requested: ${input.points}`,
        });
      }

      await ctx.prisma.loyaltyTransaction.create({
        data: {
          customerId: input.customerId,
          type: 'REDEEM',
          points: input.points,
          orderId: input.orderId,
        },
      });

      return ctx.prisma.customer.update({
        where: { id: input.customerId },
        data: { loyaltyPoints: { decrement: input.points } },
      });
    }),
});

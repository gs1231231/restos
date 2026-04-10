import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const paymentRouter = router({
  collect: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER', 'CASHIER'))
    .input(
      z.object({
        billId: z.string().uuid(),
        method: z.enum(['CASH', 'UPI', 'CARD', 'WALLET', 'CREDIT']),
        amount: z.number().positive(),
        reference: z.string().optional(),
        gateway: z.string().optional(),
        gatewayTxnId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.findFirstOrThrow({
        where: { id: input.billId, restaurantId: ctx.restaurantId },
        include: { payments: { where: { status: 'COMPLETED' } } },
      });

      if (bill.cancelledAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot collect payment on a cancelled bill' });
      }

      const totalPaid = bill.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const remaining = Number(bill.total) - totalPaid;

      if (input.amount > remaining + 0.01) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Payment amount (${input.amount}) exceeds remaining balance (${remaining.toFixed(2)})`,
        });
      }

      const payment = await ctx.prisma.payment.create({
        data: {
          restaurantId: ctx.restaurantId,
          billId: input.billId,
          method: input.method,
          amount: input.amount,
          reference: input.reference,
          gateway: input.gateway,
          gatewayTxnId: input.gatewayTxnId,
          status: 'COMPLETED',
        },
      });

      // If fully paid, update order status to PAID
      const newTotalPaid = totalPaid + input.amount;
      if (newTotalPaid >= Number(bill.total) - 0.01) {
        await ctx.prisma.order.update({
          where: { id: bill.orderId },
          data: { status: 'PAID' },
        });

        // Free the table
        const order = await ctx.prisma.order.findUnique({ where: { id: bill.orderId } });
        if (order?.tableId) {
          await ctx.prisma.table.update({
            where: { id: order.tableId },
            data: { status: 'CLEANING' },
          });
        }
      }

      return payment;
    }),

  list: restaurantProcedure
    .input(
      z
        .object({
          billId: z.string().uuid().optional(),
          method: z.enum(['CASH', 'UPI', 'CARD', 'WALLET', 'CREDIT']).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
          limit: z.number().int().positive().default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.payment.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          ...(input?.billId && { billId: input.billId }),
          ...(input?.method && { method: input.method }),
          ...((input?.dateFrom || input?.dateTo) && {
            paidAt: {
              ...(input?.dateFrom && { gte: input.dateFrom }),
              ...(input?.dateTo && { lte: input.dateTo }),
            },
          }),
        },
        include: {
          bill: { select: { billNumber: true, orderId: true } },
        },
        orderBy: { paidAt: 'desc' },
        take: input?.limit ?? 50,
      });
    }),

  refund: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z.object({
        paymentId: z.string().uuid(),
        amount: z.number().positive(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findFirstOrThrow({
        where: { id: input.paymentId, restaurantId: ctx.restaurantId },
        include: { refunds: true },
      });

      const totalRefunded = payment.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
      const refundable = Number(payment.amount) - totalRefunded;

      if (input.amount > refundable + 0.01) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Refund amount (${input.amount}) exceeds refundable balance (${refundable.toFixed(2)})`,
        });
      }

      const refund = await ctx.prisma.refund.create({
        data: {
          paymentId: input.paymentId,
          amount: input.amount,
          reason: input.reason,
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      // If full refund, mark payment as refunded
      if (input.amount >= refundable - 0.01) {
        await ctx.prisma.payment.update({
          where: { id: input.paymentId },
          data: { status: 'REFUNDED' },
        });
      }

      return refund;
    }),
});

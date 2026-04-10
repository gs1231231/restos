import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const billRouter = router({
  generate: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER', 'CASHIER'))
    .input(
      z.object({
        orderId: z.string().uuid(),
        serviceChargeRate: z.number().min(0).default(0),
        packagingCharge: z.number().min(0).default(0),
        deliveryCharge: z.number().min(0).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findFirstOrThrow({
        where: { id: input.orderId, restaurantId: ctx.restaurantId },
        include: { items: true, bill: true },
      });

      if (order.bill) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Bill already generated for this order' });
      }

      // Fetch restaurant settings for tax config
      const settings = await ctx.prisma.restaurantSettings.findUnique({
        where: { restaurantId: ctx.restaurantId },
      });

      const billPrefix = settings?.billPrefix ?? 'INV';
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

      const lastBill = await ctx.prisma.bill.findFirst({
        where: {
          restaurantId: ctx.restaurantId,
          billNumber: { startsWith: `${billPrefix}-${dateStr}` },
        },
        orderBy: { billNumber: 'desc' },
      });

      const seq = lastBill
        ? parseInt(lastBill.billNumber.split('-').pop() || '0', 10) + 1
        : 1;
      const billNumber = `${billPrefix}-${dateStr}-${String(seq).padStart(4, '0')}`;

      // Calculate GST on each item based on its tax rate
      let subtotal = 0;
      let totalCgst = 0;
      let totalSgst = 0;

      for (const item of order.items) {
        if (item.status === 'CANCELLED') continue;
        const itemTotal = Number(item.totalPrice);
        const taxRate = Number(item.taxRate);
        subtotal += itemTotal;
        // Split GST equally into CGST and SGST (intra-state)
        totalCgst += itemTotal * (taxRate / 200);
        totalSgst += itemTotal * (taxRate / 200);
      }

      const serviceCharge = subtotal * (input.serviceChargeRate / 100);
      const grossTotal = subtotal + totalCgst + totalSgst + serviceCharge + input.packagingCharge + input.deliveryCharge;
      const roundOff = Math.round(grossTotal) - grossTotal;
      const total = grossTotal + roundOff;

      const bill = await ctx.prisma.bill.create({
        data: {
          restaurantId: ctx.restaurantId,
          orderId: input.orderId,
          billNumber,
          subtotal,
          cgst: totalCgst,
          sgst: totalSgst,
          igst: 0,
          serviceCharge,
          discount: 0,
          roundOff,
          total,
        },
        include: { order: { include: { items: true, table: true } } },
      });

      // Update order status to BILLED
      await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: 'BILLED',
          serviceCharge,
          packagingCharge: input.packagingCharge,
          deliveryCharge: input.deliveryCharge,
          total,
        },
      });

      return bill;
    }),

  get: restaurantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.bill.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
        include: {
          order: {
            include: {
              items: { include: { modifiers: true } },
              table: true,
              customer: true,
            },
          },
          discounts: true,
          payments: true,
        },
      });
    }),

  print: restaurantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
        include: {
          order: {
            include: {
              items: { where: { status: { not: 'CANCELLED' } }, include: { modifiers: true } },
              table: true,
              customer: true,
            },
          },
          discounts: true,
          payments: true,
        },
      });

      await ctx.prisma.bill.update({
        where: { id: input.id },
        data: { printedAt: new Date() },
      });

      return bill;
    }),

  cancel: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(z.object({ id: z.string().uuid(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
      });

      if (bill.cancelledAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Bill is already cancelled' });
      }

      // Check if payments exist
      const payments = await ctx.prisma.payment.findMany({
        where: { billId: input.id, status: 'COMPLETED' },
      });

      if (payments.length > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot cancel a bill with completed payments. Refund first.' });
      }

      const updated = await ctx.prisma.bill.update({
        where: { id: input.id },
        data: { cancelledAt: new Date() },
      });

      // Revert order status
      await ctx.prisma.order.update({
        where: { id: bill.orderId },
        data: { status: 'SERVED' },
      });

      return updated;
    }),

  applyDiscount: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z.object({
        billId: z.string().uuid(),
        type: z.enum(['PERCENT', 'FLAT', 'COUPON']),
        value: z.number().positive(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.findFirstOrThrow({
        where: { id: input.billId, restaurantId: ctx.restaurantId },
      });

      if (bill.cancelledAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot apply discount to a cancelled bill' });
      }

      const discountAmount =
        input.type === 'PERCENT'
          ? Number(bill.subtotal) * (input.value / 100)
          : input.value;

      await ctx.prisma.billDiscount.create({
        data: {
          billId: input.billId,
          type: input.type,
          value: input.value,
          reason: input.reason,
          approvedBy: ctx.user.id,
        },
      });

      const newDiscount = Number(bill.discount) + discountAmount;
      const newTotal = Number(bill.total) - discountAmount;
      const roundOff = Math.round(newTotal) - newTotal;

      return ctx.prisma.bill.update({
        where: { id: input.billId },
        data: {
          discount: newDiscount,
          total: newTotal + roundOff,
          roundOff,
        },
        include: { discounts: true },
      });
    }),
});

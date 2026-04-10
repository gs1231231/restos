import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, restaurantProcedure } from '../trpc';

export const reservationRouter = router({
  create: restaurantProcedure
    .input(
      z.object({
        guestName: z.string().min(1),
        guestPhone: z.string().min(10),
        guestEmail: z.string().email().optional(),
        pax: z.number().int().positive(),
        date: z.date(),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        tableId: z.string().uuid().optional(),
        occasion: z.string().optional(),
        specialRequest: z.string().optional(),
        depositAmount: z.number().min(0).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check table availability for the given date/time if tableId provided
      if (input.tableId) {
        const existing = await ctx.prisma.reservation.findFirst({
          where: {
            restaurantId: ctx.restaurantId,
            tableId: input.tableId,
            date: input.date,
            time: input.time,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        });
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Table already reserved for this date/time' });
        }
      }

      return ctx.prisma.reservation.create({
        data: {
          restaurantId: ctx.restaurantId,
          ...input,
        },
        include: { table: { select: { id: true, name: true } } },
      });
    }),

  list: restaurantProcedure
    .input(
      z
        .object({
          date: z.date().optional(),
          status: z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW']).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.reservation.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          ...(input?.date && { date: input.date }),
          ...(input?.status && { status: input.status }),
          ...((input?.dateFrom || input?.dateTo) && {
            date: {
              ...(input?.dateFrom && { gte: input.dateFrom }),
              ...(input?.dateTo && { lte: input.dateTo }),
            },
          }),
        },
        include: { table: { select: { id: true, name: true } } },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      });
    }),

  confirm: restaurantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
      });

      if (reservation.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Cannot confirm a reservation with status ${reservation.status}` });
      }

      return ctx.prisma.reservation.update({
        where: { id: input.id },
        data: { status: 'CONFIRMED' },
      });
    }),

  cancel: restaurantProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
      });

      if (['CANCELLED', 'NO_SHOW', 'SEATED'].includes(reservation.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Cannot cancel a reservation with status ${reservation.status}` });
      }

      return ctx.prisma.reservation.update({
        where: { id: input.id },
        data: { status: 'CANCELLED', notes: input.reason ? `${reservation.notes ?? ''}\nCancelled: ${input.reason}`.trim() : reservation.notes },
      });
    }),

  seat: restaurantProcedure
    .input(z.object({ id: z.string().uuid(), tableId: z.string().uuid().optional() }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
      });

      if (!['PENDING', 'CONFIRMED'].includes(reservation.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Cannot seat a reservation with status ${reservation.status}` });
      }

      const tableId = input.tableId ?? reservation.tableId;

      if (tableId) {
        await ctx.prisma.table.update({
          where: { id: tableId, restaurantId: ctx.restaurantId },
          data: { status: 'OCCUPIED' },
        });
      }

      return ctx.prisma.reservation.update({
        where: { id: input.id },
        data: {
          status: 'SEATED',
          ...(input.tableId && { tableId: input.tableId }),
        },
      });
    }),

  noShow: restaurantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findFirstOrThrow({
        where: { id: input.id, restaurantId: ctx.restaurantId },
      });

      if (!['PENDING', 'CONFIRMED'].includes(reservation.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Cannot mark no-show for a reservation with status ${reservation.status}` });
      }

      // Free the reserved table if any
      if (reservation.tableId) {
        await ctx.prisma.table.update({
          where: { id: reservation.tableId },
          data: { status: 'AVAILABLE' },
        });
      }

      return ctx.prisma.reservation.update({
        where: { id: input.id },
        data: { status: 'NO_SHOW' },
      });
    }),
});

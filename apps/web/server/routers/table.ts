import { z } from 'zod';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const tableRouter = router({
  list: restaurantProcedure
    .input(
      z
        .object({
          floorId: z.string().uuid().optional(),
          status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.table.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          isActive: true,
          ...(input?.floorId && { floorId: input.floorId }),
          ...(input?.status && { status: input.status }),
        },
        include: {
          floor: { select: { id: true, name: true } },
          orders: {
            where: { status: { in: ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] } },
            select: { id: true, orderNumber: true, status: true, total: true, pax: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    }),

  create: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z.object({
        name: z.string().min(1),
        floorId: z.string().uuid().optional(),
        seats: z.number().int().positive().default(4),
        shape: z.enum(['SQUARE', 'ROUND', 'RECTANGLE', 'OVAL']).default('SQUARE'),
        posX: z.number().default(0),
        posY: z.number().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.table.create({
        data: { ...input, restaurantId: ctx.restaurantId },
      });
    }),

  update: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        floorId: z.string().uuid().nullable().optional(),
        seats: z.number().int().positive().optional(),
        shape: z.enum(['SQUARE', 'ROUND', 'RECTANGLE', 'OVAL']).optional(),
        posX: z.number().optional(),
        posY: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.table.update({
        where: { id, restaurantId: ctx.restaurantId },
        data,
      });
    }),

  updateStatus: restaurantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.table.update({
        where: { id: input.id, restaurantId: ctx.restaurantId },
        data: { status: input.status },
      });
    }),

  floorPlan: restaurantProcedure.query(async ({ ctx }) => {
    const floors = await ctx.prisma.floor.findMany({
      where: { restaurantId: ctx.restaurantId },
      include: {
        tables: {
          where: { isActive: true },
          include: {
            orders: {
              where: { status: { in: ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] } },
              select: { id: true, orderNumber: true, status: true, total: true, pax: true },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return floors;
  }),
});

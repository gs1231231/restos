import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const staffRouter = router({
  list: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z
        .object({
          role: z.string().optional(),
          isActive: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          restaurantId: ctx.restaurantId,
          tenantId: ctx.tenantId,
          ...(input?.role && { role: input.role }),
          ...(input?.isActive !== undefined && { isActive: input.isActive }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });
    }),

  create: restaurantProcedure
    .use(hasRole('OWNER'))
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().min(10),
        email: z.string().email().optional(),
        password: z.string().min(6),
        role: z.enum(['MANAGER', 'CAPTAIN', 'KITCHEN', 'CASHIER', 'DELIVERY']),
        pin: z.string().length(4).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if phone already exists for this tenant
      const existing = await ctx.prisma.user.findFirst({
        where: { tenantId: ctx.tenantId, phone: input.phone },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'A user with this phone number already exists' });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      return ctx.prisma.user.create({
        data: {
          tenantId: ctx.tenantId,
          restaurantId: ctx.restaurantId,
          name: input.name,
          phone: input.phone,
          email: input.email,
          passwordHash,
          role: input.role,
          pin: input.pin,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
    }),

  update: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(10).optional(),
        role: z.enum(['MANAGER', 'CAPTAIN', 'KITCHEN', 'CASHIER', 'DELIVERY']).optional(),
        isActive: z.boolean().optional(),
        password: z.string().min(6).optional(),
        pin: z.string().length(4).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, password, ...data } = input;

      // Ensure user belongs to this restaurant
      await ctx.prisma.user.findFirstOrThrow({
        where: { id, restaurantId: ctx.restaurantId, tenantId: ctx.tenantId },
      });

      const updateData: Record<string, unknown> = { ...data };
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 12);
      }

      return ctx.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
    }),

  clockIn: restaurantProcedure
    .input(
      z
        .object({
          userId: z.string().uuid().optional(),
          method: z.enum(['MANUAL', 'PIN', 'BIOMETRIC']).default('MANUAL'),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = input?.userId ?? ctx.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check for existing open attendance
      const existing = await ctx.prisma.attendance.findFirst({
        where: {
          restaurantId: ctx.restaurantId,
          userId,
          date: today,
          checkOut: null,
        },
      });

      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already clocked in today. Clock out first.' });
      }

      return ctx.prisma.attendance.create({
        data: {
          restaurantId: ctx.restaurantId,
          userId,
          date: today,
          checkIn: new Date(),
          method: input?.method ?? 'MANUAL',
        },
      });
    }),

  clockOut: restaurantProcedure
    .input(z.object({ userId: z.string().uuid().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const userId = input?.userId ?? ctx.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await ctx.prisma.attendance.findFirst({
        where: {
          restaurantId: ctx.restaurantId,
          userId,
          date: today,
          checkOut: null,
        },
      });

      if (!attendance) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No active clock-in found for today' });
      }

      return ctx.prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOut: new Date() },
      });
    }),
});

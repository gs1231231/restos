import { z } from 'zod';
import { router, restaurantProcedure, protectedProcedure, hasRole } from '../trpc';

export const restaurantRouter = router({
  get: restaurantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.restaurant.findUnique({
      where: { id: ctx.restaurantId },
      include: { settings: true, floors: { include: { tables: true } } },
    });
  }),

  update: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      gstin: z.string().optional(),
      fssaiNo: z.string().optional(),
      logoUrl: z.string().optional(),
      primaryColor: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.restaurant.update({ where: { id: ctx.restaurantId }, data: input });
    }),

  settings: restaurantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.restaurantSettings.findUnique({ where: { restaurantId: ctx.restaurantId } });
  }),

  updateSettings: restaurantProcedure
    .use(hasRole('OWNER', 'MANAGER'))
    .input(z.object({
      taxConfig: z.any().optional(),
      paymentMethods: z.any().optional(),
      printConfig: z.any().optional(),
      notificationConfig: z.any().optional(),
      openingHours: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.restaurantSettings.update({ where: { restaurantId: ctx.restaurantId }, data: input });
    }),

  listBranches: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.restaurant.findMany({ where: { tenantId: ctx.tenantId } });
  }),

  switchBranch: protectedProcedure
    .input(z.object({ restaurantId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.prisma.restaurant.findFirst({
        where: { id: input.restaurantId, tenantId: ctx.tenantId },
      });
      if (!restaurant) throw new Error('Restaurant not found');
      // Update user's restaurantId
      await ctx.prisma.user.update({ where: { id: ctx.user!.id }, data: { restaurantId: input.restaurantId } });
      return restaurant;
    }),
});

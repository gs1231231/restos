import { z } from 'zod';
import { router, restaurantProcedure, hasRole } from '../trpc';

export const menuRouter = router({
  // ─── Categories ───
  categories: router({
    list: restaurantProcedure.query(async ({ ctx }) => {
      return ctx.prisma.menuCategory.findMany({
        where: { restaurantId: ctx.restaurantId },
        include: { items: { where: { isAvailable: true }, select: { id: true } } },
        orderBy: { sortOrder: 'asc' },
      });
    }),

    create: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          icon: z.string().optional(),
          sortOrder: z.number().int().optional(),
          availableFrom: z.string().optional(),
          availableTo: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.menuCategory.create({
          data: { ...input, restaurantId: ctx.restaurantId },
        });
      }),

    update: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          id: z.string().uuid(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          icon: z.string().optional(),
          sortOrder: z.number().int().optional(),
          isActive: z.boolean().optional(),
          availableFrom: z.string().nullable().optional(),
          availableTo: z.string().nullable().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.menuCategory.update({
          where: { id, restaurantId: ctx.restaurantId },
          data,
        });
      }),

    delete: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.menuCategory.delete({
          where: { id: input.id, restaurantId: ctx.restaurantId },
        });
      }),
  }),

  // ─── Items ───
  items: router({
    list: restaurantProcedure
      .input(
        z
          .object({
            categoryId: z.string().uuid().optional(),
            foodType: z.enum(['VEG', 'NONVEG', 'EGG', 'VEGAN']).optional(),
            isAvailable: z.boolean().optional(),
            search: z.string().optional(),
          })
          .optional(),
      )
      .query(async ({ ctx, input }) => {
        return ctx.prisma.menuItem.findMany({
          where: {
            restaurantId: ctx.restaurantId,
            ...(input?.categoryId && { categoryId: input.categoryId }),
            ...(input?.foodType && { foodType: input.foodType }),
            ...(input?.isAvailable !== undefined && { isAvailable: input.isAvailable }),
            ...(input?.search && {
              name: { contains: input.search, mode: 'insensitive' as const },
            }),
          },
          include: {
            category: { select: { id: true, name: true } },
            variants: true,
            modifierGroups: { include: { modifierGroup: { include: { modifiers: true } } } },
          },
          orderBy: { sortOrder: 'asc' },
        });
      }),

    create: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          categoryId: z.string().uuid(),
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.number().positive(),
          mrp: z.number().positive().optional(),
          taxRate: z.number().min(0).max(100).default(5),
          foodType: z.enum(['VEG', 'NONVEG', 'EGG', 'VEGAN']).default('VEG'),
          image: z.string().optional(),
          preparationTime: z.number().int().positive().optional(),
          calories: z.number().int().optional(),
          allergens: z.array(z.string()).optional(),
          station: z.string().optional(),
          sortOrder: z.number().int().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.menuItem.create({
          data: { ...input, restaurantId: ctx.restaurantId },
        });
      }),

    update: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(
        z.object({
          id: z.string().uuid(),
          categoryId: z.string().uuid().optional(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().positive().optional(),
          mrp: z.number().positive().nullable().optional(),
          taxRate: z.number().min(0).max(100).optional(),
          foodType: z.enum(['VEG', 'NONVEG', 'EGG', 'VEGAN']).optional(),
          isAvailable: z.boolean().optional(),
          isPopular: z.boolean().optional(),
          image: z.string().nullable().optional(),
          preparationTime: z.number().int().nullable().optional(),
          calories: z.number().int().nullable().optional(),
          allergens: z.array(z.string()).optional(),
          station: z.string().optional(),
          sortOrder: z.number().int().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.menuItem.update({
          where: { id, restaurantId: ctx.restaurantId },
          data,
        });
      }),

    delete: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER'))
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.menuItem.delete({
          where: { id: input.id, restaurantId: ctx.restaurantId },
        });
      }),

    toggleAvailable: restaurantProcedure
      .use(hasRole('OWNER', 'MANAGER', 'KITCHEN'))
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const item = await ctx.prisma.menuItem.findFirstOrThrow({
          where: { id: input.id, restaurantId: ctx.restaurantId },
        });
        return ctx.prisma.menuItem.update({
          where: { id: input.id },
          data: { isAvailable: !item.isAvailable },
        });
      }),
  }),
});

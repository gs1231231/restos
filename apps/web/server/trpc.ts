import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';
import { prisma } from '@restos/db';
import { auth } from '../lib/auth';
import type { SessionUser } from '../lib/auth';

// ─── Context ───
export async function createContext() {
  const session = await auth();
  return {
    session,
    prisma,
    user: session?.user as SessionUser | undefined,
    restaurantId: (session?.user as any)?.restaurantId as string | undefined,
    tenantId: (session?.user as any)?.tenantId as string | undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// ─── tRPC Init ───
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// ─── Middleware: isAuthenticated ───
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user!,
      tenantId: ctx.tenantId!,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);

// ─── Middleware: hasRole ───
export function hasRole(...roles: string[]) {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: `Required role: ${roles.join(' or ')}` });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user as NonNullable<typeof ctx.user>,
        restaurantId: ctx.restaurantId as string,
        tenantId: ctx.tenantId as string,
      },
    });
  });
}

// ─── Middleware: belongsToRestaurant (auto-injects restaurantId) ───
const belongsToRestaurant = t.middleware(async ({ ctx, next }) => {
  if (!ctx.restaurantId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'No restaurant selected. Please switch to a branch.' });
  }
  return next({
    ctx: {
      ...ctx,
      restaurantId: ctx.restaurantId as string,
      tenantId: ctx.tenantId as string,
      user: ctx.user as NonNullable<typeof ctx.user>,
    },
  });
});

export const restaurantProcedure = protectedProcedure.use(belongsToRestaurant);

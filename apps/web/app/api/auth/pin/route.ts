import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@restos/db';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret');

export async function POST(req: NextRequest) {
  try {
    const { pin, restaurantId } = await req.json();

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { pin, isActive: true, ...(restaurantId ? { restaurantId } : {}) },
      include: { tenant: true, restaurant: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // Generate JWT with 12h expiry
    const token = await new SignJWT({
      id: user.id,
      tenantId: user.tenantId,
      restaurantId: user.restaurantId,
      role: user.role,
      name: user.name,
      phone: user.phone,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h')
      .setIssuedAt()
      .sign(JWT_SECRET);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
        restaurantName: user.restaurant?.name,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

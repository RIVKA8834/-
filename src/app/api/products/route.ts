import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const color = searchParams.get('color') || '';
    const active = searchParams.get('active') === 'true';

    const where: any = {};

    if (active) {
      where.active = true;
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (color) {
      where.color = { contains: color, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        sizes: {
          include: {
            size: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת מוצרים' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'שגיאה בעדכון מוצר' },
      { status: 500 }
    );
  }
}

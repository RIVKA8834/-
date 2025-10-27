import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const color = searchParams.get('color') || ''
    const active = searchParams.get('active')

    const where: any = {}

    if (active === 'true') {
      where.active = true
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (color) {
      where.color = { contains: color, mode: 'insensitive' }
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
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת המוצרים' },
      { status: 500 }
    )
  }
}

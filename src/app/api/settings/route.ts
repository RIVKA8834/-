import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.settings.create({
        data: {
          id: 'singleton',
          vatRate: 0.17,
          businessEmail: 'orders@example.com',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הגדרות' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'אין הרשאה' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: body,
      create: {
        id: 'singleton',
        ...body,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הגדרות' },
      { status: 500 }
    )
  }
}

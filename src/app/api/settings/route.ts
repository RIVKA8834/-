import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { settingsSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.settings.findFirst({
      where: { id: 'default' },
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        vatRate: 0.17,
        minOrderAmount: null,
        businessEmail: '',
        logoUrl: null,
        termsHtml: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת הגדרות' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: validatedData,
      create: {
        id: 'default',
        ...validatedData,
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: error.message || 'שגיאה בעדכון הגדרות' },
      { status: 500 }
    );
  }
}

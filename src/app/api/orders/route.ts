import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateTotals } from '@/lib/utils'
import { z } from 'zod'
import { generateOrderPDF } from '@/lib/pdf-generator'
import { generateOrderCSV } from '@/lib/csv-generator'
import { sendOrderEmail } from '@/lib/email'

const orderSchema = z.object({
  retailerName: z.string().min(2, 'שם החנות חייב להכיל לפחות 2 תווים'),
  vatNumber: z.string().optional(),
  contactName: z.string().min(2, 'שם איש הקשר חייב להכיל לפחות 2 תווים'),
  phone: z.string().min(9, 'מספר טלפון לא תקין'),
  email: z.string().email('כתובת מייל לא תקינה'),
  shippingAddress: z.string().min(5, 'כתובת משלוח חייבת להכיל לפחות 5 תווים'),
  notes: z.string().optional(),
  requestedDate: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      qty34: z.number().min(0),
      qty36: z.number().min(0),
      qty38: z.number().min(0),
      qty40: z.number().min(0),
      qty42: z.number().min(0),
    })
  ).min(1, 'יש להוסיף לפחות פריט אחד להזמנה'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = orderSchema.parse(body)

    // Get settings for VAT rate
    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })

    if (!settings) {
      return NextResponse.json(
        { error: 'הגדרות המערכת לא נמצאו' },
        { status: 500 }
      )
    }

    // Calculate totals
    let orderSubtotal = 0
    let orderVat = 0
    let orderTotal = 0

    const orderItems = []

    for (const item of validatedData.items) {
      const totalQty = item.qty34 + item.qty36 + item.qty38 + item.qty40 + item.qty42

      if (totalQty === 0) continue

      // Get product
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `המוצר ${product?.sku || item.productId} לא זמין` },
          { status: 400 }
        )
      }

      // Calculate line totals
      const lineTotals = calculateTotals(
        product.unitPrice,
        totalQty,
        product.priceIncludesVat,
        settings.vatRate
      )

      orderSubtotal += lineTotals.subtotal
      orderVat += lineTotals.vat
      orderTotal += lineTotals.total

      orderItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        color: product.color,
        unitPrice: product.unitPrice,
        priceIncludesVat: product.priceIncludesVat,
        qty34: item.qty34,
        qty36: item.qty36,
        qty38: item.qty38,
        qty40: item.qty40,
        qty42: item.qty42,
        lineSubtotal: lineTotals.subtotal,
        lineVat: lineTotals.vat,
        lineTotal: lineTotals.total,
      })
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: 'ההזמנה ריקה' },
        { status: 400 }
      )
    }

    // Check minimum order amount
    if (settings.minOrderAmount && orderTotal < settings.minOrderAmount) {
      return NextResponse.json(
        { error: `סכום הזמנה מינימלי: ${settings.minOrderAmount} ₪` },
        { status: 400 }
      )
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        retailerName: validatedData.retailerName,
        vatNumber: validatedData.vatNumber,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        email: validatedData.email,
        shippingAddress: validatedData.shippingAddress,
        notes: validatedData.notes,
        requestedDate: validatedData.requestedDate ? new Date(validatedData.requestedDate) : null,
        subtotal: orderSubtotal,
        vat: orderVat,
        total: orderTotal,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Generate PDF
    const pdfBuffer = await generateOrderPDF(order, settings)
    const pdfPath = `/orders/${order.orderNumber}.pdf`

    // Save PDF to public folder
    const fs = require('fs').promises
    const path = require('path')
    const publicDir = path.join(process.cwd(), 'public', 'orders')
    await fs.mkdir(publicDir, { recursive: true })
    await fs.writeFile(path.join(process.cwd(), 'public', pdfPath), pdfBuffer)

    // Generate CSV
    const csvContent = generateOrderCSV(order)
    const csvPath = `/orders/${order.orderNumber}.csv`
    await fs.writeFile(path.join(process.cwd(), 'public', csvPath), csvContent)

    // Update order with file paths
    await prisma.order.update({
      where: { id: order.id },
      data: {
        pdfPath,
        csvPath,
      },
    })

    // Send email
    try {
      await sendOrderEmail(order, settings, pdfBuffer)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      pdfPath,
      csvPath,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת ההזמנה. אנא נסה שנית.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    const where: any = {}

    if (email) {
      where.email = email
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת ההזמנות' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { orderSchema } from '@/lib/validations';
import { calculateVAT } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { generateOrderPDF } from '@/lib/pdf';
import { generateOrderCSV } from '@/lib/csv';
import { sendEmail, generateOrderEmailHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = orderSchema.parse(body);

    // Get VAT rate from settings
    const settings = await prisma.settings.findFirst({
      where: { id: 'default' },
    });

    const vatRate = settings?.vatRate || 0.17;

    // Calculate totals
    let orderSubtotal = 0;
    let orderVat = 0;
    let orderTotal = 0;

    const orderItems = await Promise.all(
      validatedData.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`מוצר לא נמצא: ${item.productId}`);
        }

        const totalQty =
          item.qty34 + item.qty36 + item.qty38 + item.qty40 + item.qty42;

        const { subtotal, vat, total } = calculateVAT(
          item.unitPrice,
          totalQty,
          item.priceIncludesVat,
          vatRate
        );

        orderSubtotal += subtotal;
        orderVat += vat;
        orderTotal += total;

        return {
          productId: item.productId,
          unitPrice: item.unitPrice,
          priceIncludesVat: item.priceIncludesVat,
          qty34: item.qty34,
          qty36: item.qty36,
          qty38: item.qty38,
          qty40: item.qty40,
          qty42: item.qty42,
          lineSubtotal: subtotal,
          lineVat: vat,
          lineTotal: total,
        };
      })
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        retailerName: validatedData.retailerName,
        vatNumber: validatedData.vatNumber,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        email: validatedData.email,
        shippingAddress: validatedData.shippingAddress,
        notes: validatedData.notes,
        requestedDate: validatedData.requestedDate
          ? new Date(validatedData.requestedDate)
          : null,
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
    });

    // Generate PDF
    const pdfBuffer = await generateOrderPDF(order as any, settings || {});
    const pdfFilename = `order-${order.id}.pdf`;
    const pdfUrl = await storage.saveFile(pdfFilename, pdfBuffer);

    // Generate CSV
    const csvContent = generateOrderCSV(order as any);
    const csvFilename = `order-${order.id}.csv`;
    const csvUrl = await storage.saveFile(csvFilename, csvContent);

    // Update order with file URLs
    await prisma.order.update({
      where: { id: order.id },
      data: {
        pdfUrl,
        csvUrl,
      },
    });

    // Send email
    if (settings?.businessEmail) {
      try {
        await sendEmail({
          to: [settings.businessEmail, validatedData.email],
          subject: `הזמנה חדשה מ-${validatedData.retailerName}`,
          html: generateOrderEmailHtml(order),
          attachments: [
            {
              filename: pdfFilename,
              content: pdfBuffer,
            },
            {
              filename: csvFilename,
              content: Buffer.from(csvContent, 'utf-8'),
            },
          ],
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      pdfUrl,
      csvUrl,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'שגיאה ביצירת הזמנה' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
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
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת הזמנות' },
      { status: 500 }
    );
  }
}

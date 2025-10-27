import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { parseVatField } from '@/lib/utils';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'קובץ חובה' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel/CSV file
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Get all sizes
    const sizes = await prisma.size.findMany();
    const sizeMap = new Map(sizes.map((s) => [s.name, s.id]));

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const row of data as any[]) {
      try {
        // Map columns - support both Hebrew and English column names
        const sku =
          row['דגם'] || row['sku'] || row['SKU'] || row['Sku'] || '';
        const name = row['שם'] || row['name'] || row['Name'] || '';
        const color = row['צבע'] || row['color'] || row['Color'] || '';
        const unitPrice =
          parseFloat(row['מחיר'] || row['unitPrice'] || row['price'] || '0') || 0;
        const priceIncludesVatRaw =
          row['כולל מעמ'] ||
          row['priceIncludesVat'] ||
          row['includes_vat'] ||
          'לא';
        const sizeSet =
          row['מידות'] || row['sizeSet'] || row['sizes'] || '34-42';
        const active =
          row['פעיל'] !== undefined
            ? parseVatField(String(row['פעיל']))
            : row['active'] !== undefined
            ? Boolean(row['active'])
            : true;

        if (!sku || !name || !color || !unitPrice) {
          errors.push(
            `שורה דילגה: חסרים שדות חובה (דגם: ${sku}, שם: ${name})`
          );
          continue;
        }

        const priceIncludesVat = parseVatField(String(priceIncludesVatRaw));

        // Upsert product
        const product = await prisma.product.upsert({
          where: { sku },
          update: {
            name,
            color,
            unitPrice,
            priceIncludesVat,
            sizeSet,
            active,
          },
          create: {
            sku,
            name,
            color,
            unitPrice,
            priceIncludesVat,
            sizeSet,
            active,
          },
        });

        // Link sizes if sizeSet is specified
        if (sizeSet && sizeSet.includes('-')) {
          const [start, end] = sizeSet.split('-').map((s) => parseInt(s.trim()));
          const sizesToLink = sizes.filter((s) => {
            const sizeNum = parseInt(s.name);
            return sizeNum >= start && sizeNum <= end;
          });

          // Delete existing links
          await prisma.productSize.deleteMany({
            where: { productId: product.id },
          });

          // Create new links
          await Promise.all(
            sizesToLink.map((size) =>
              prisma.productSize.create({
                data: {
                  productId: product.id,
                  sizeId: size.id,
                },
              })
            )
          );
        }

        if (row['דגם'] && data.indexOf(row) === 0) {
          imported++;
        } else {
          updated++;
        }
      } catch (error: any) {
        errors.push(`שגיאה בשורה: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: data.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error importing catalog:', error);
    return NextResponse.json(
      { error: error.message || 'שגיאה בייבוא קטלוג' },
      { status: 500 }
    );
  }
}

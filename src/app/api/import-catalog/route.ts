import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { normalizeBoolean } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'אין הרשאה' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const mapping = JSON.parse(formData.get('mapping') as string)

    if (!file) {
      return NextResponse.json(
        { error: 'לא נבחר קובץ' },
        { status: 400 }
      )
    }

    // Read file
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data.length) {
      return NextResponse.json(
        { error: 'הקובץ ריק' },
        { status: 400 }
      )
    }

    // Get all sizes
    const sizes = await prisma.size.findMany()
    const sizeMap = new Map(sizes.map(s => [s.name, s.id]))

    let imported = 0
    let updated = 0
    const errors: string[] = []

    for (const [index, row] of data.entries()) {
      try {
        const rowNum = index + 2 // Excel row number (1-indexed + header)

        // Extract data using mapping
        const sku = row[mapping.sku]?.toString().trim()
        const name = row[mapping.name]?.toString().trim()
        const color = row[mapping.color]?.toString().trim()
        const unitPriceStr = row[mapping.unitPrice]?.toString().trim()
        const priceIncludesVatStr = row[mapping.priceIncludesVat]?.toString().trim()
        const sizeSet = row[mapping.sizeSet]?.toString().trim() || '34-42'

        // Validate required fields
        if (!sku) {
          errors.push(`שורה ${rowNum}: חסר דגם`)
          continue
        }

        if (!name) {
          errors.push(`שורה ${rowNum}: חסר שם`)
          continue
        }

        if (!color) {
          errors.push(`שורה ${rowNum}: חסר צבע`)
          continue
        }

        if (!unitPriceStr) {
          errors.push(`שורה ${rowNum}: חסר מחיר`)
          continue
        }

        // Parse price
        const unitPrice = parseFloat(unitPriceStr.replace(/[^\d.]/g, ''))
        if (isNaN(unitPrice) || unitPrice <= 0) {
          errors.push(`שורה ${rowNum}: מחיר לא תקין`)
          continue
        }

        // Parse price includes VAT
        const priceIncludesVat = normalizeBoolean(priceIncludesVatStr)

        // Upsert product
        const existingProduct = await prisma.product.findUnique({
          where: { sku },
        })

        const product = await prisma.product.upsert({
          where: { sku },
          update: {
            name,
            color,
            unitPrice,
            priceIncludesVat,
            sizeSet,
            active: true,
          },
          create: {
            sku,
            name,
            color,
            unitPrice,
            priceIncludesVat,
            sizeSet,
            active: true,
          },
        })

        if (existingProduct) {
          updated++
        } else {
          imported++
        }

        // Link sizes based on sizeSet
        // Delete existing size links
        await prisma.productSize.deleteMany({
          where: { productId: product.id },
        })

        // Create new size links for all sizes
        const sizesToLink = ['34', '36', '38', '40', '42']
        for (const sizeName of sizesToLink) {
          const sizeId = sizeMap.get(sizeName)
          if (sizeId) {
            await prisma.productSize.create({
              data: {
                productId: product.id,
                sizeId,
              },
            })
          }
        }

      } catch (rowError) {
        errors.push(`שורה ${index + 2}: ${rowError}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      updated,
      errors,
    })

  } catch (error) {
    console.error('Error importing catalog:', error)
    return NextResponse.json(
      { error: 'שגיאה בייבוא הקטלוג' },
      { status: 500 }
    )
  }
}

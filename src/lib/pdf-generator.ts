import { OrderWithItems } from '@/types'
import { Settings } from '@prisma/client'
import { formatPrice, formatDate } from './utils'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export async function generateOrderPDF(
  order: OrderWithItems,
  settings: Settings
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Try to load Hebrew font (fallback to default)
      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansHebrew-Regular.ttf')
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath)
      }

      // Header
      doc.fontSize(20).text('הזמנה סיטונאית', { align: 'right' })
      doc.fontSize(12).text(`מספר הזמנה: ${order.orderNumber}`, { align: 'right' })
      doc.text(`תאריך: ${formatDate(order.createdAt)}`, { align: 'right' })
      doc.moveDown()

      // Customer details
      doc.fontSize(14).text('פרטי החנות:', { align: 'right' })
      doc.fontSize(10)
      doc.text(`שם החנות: ${order.retailerName}`, { align: 'right' })
      if (order.vatNumber) {
        doc.text(`ח.פ/עוסק: ${order.vatNumber}`, { align: 'right' })
      }
      doc.text(`איש קשר: ${order.contactName}`, { align: 'right' })
      doc.text(`טלפון: ${order.phone}`, { align: 'right' })
      doc.text(`מייל: ${order.email}`, { align: 'right' })
      doc.text(`כתובת משלוח: ${order.shippingAddress}`, { align: 'right' })
      if (order.requestedDate) {
        doc.text(`תאריך מבוקש: ${formatDate(order.requestedDate)}`, { align: 'right' })
      }
      if (order.notes) {
        doc.text(`הערות: ${order.notes}`, { align: 'right' })
      }
      doc.moveDown()

      // Items table header
      doc.fontSize(12).text('פריטים:', { align: 'right' })
      doc.moveDown(0.5)

      const tableTop = doc.y
      const col1 = 50  // Total
      const col2 = 120 // Unit Price
      const col3 = 190 // Qty 42
      const col4 = 230 // Qty 40
      const col5 = 270 // Qty 38
      const col6 = 310 // Qty 36
      const col7 = 350 // Qty 34
      const col8 = 390 // Color
      const col9 = 460 // Name
      const col10 = 530 // SKU

      doc.fontSize(9)
      doc.text('סה"כ', col1, tableTop)
      doc.text('מחיר', col2, tableTop)
      doc.text('42', col3, tableTop)
      doc.text('40', col4, tableTop)
      doc.text('38', col5, tableTop)
      doc.text('36', col6, tableTop)
      doc.text('34', col7, tableTop)
      doc.text('צבע', col8, tableTop)
      doc.text('שם', col9, tableTop)
      doc.text('דגם', col10, tableTop)

      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke()
      doc.moveDown()

      // Items
      for (const item of order.items) {
        const y = doc.y

        doc.text(formatPrice(item.lineTotal), col1, y, { width: 60 })
        doc.text(formatPrice(item.unitPrice), col2, y, { width: 60 })
        doc.text(item.qty42 || '-', col3, y)
        doc.text(item.qty40 || '-', col4, y)
        doc.text(item.qty38 || '-', col5, y)
        doc.text(item.qty36 || '-', col6, y)
        doc.text(item.qty34 || '-', col7, y)
        doc.text(item.color, col8, y, { width: 60 })
        doc.text(item.name, col9, y, { width: 60 })
        doc.text(item.sku, col10, y)

        doc.moveDown()
      }

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      doc.moveDown()

      // Totals
      doc.fontSize(11)
      doc.text(`סה"כ לפני מע"מ: ${formatPrice(order.subtotal)}`, { align: 'right' })
      doc.text(`מע"מ (${settings.vatRate * 100}%): ${formatPrice(order.vat)}`, { align: 'right' })
      doc.fontSize(12)
      doc.text(`סה"כ לתשלום: ${formatPrice(order.total)}`, { align: 'right' })

      // Terms
      if (settings.termsHtml) {
        doc.moveDown()
        doc.fontSize(9)
        // Strip HTML tags for PDF
        const termsText = settings.termsHtml.replace(/<[^>]*>/g, '')
        doc.text(termsText, { align: 'right' })
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

import { OrderWithItems } from '@/types'

export function generateOrderCSV(order: OrderWithItems): string {
  const rows = [
    ['דגם', 'שם', 'צבע', 'מחיר יחידה', 'מידה 34', 'מידה 36', 'מידה 38', 'מידה 40', 'מידה 42', 'סה"כ שורה']
  ]

  for (const item of order.items) {
    rows.push([
      item.sku,
      item.name,
      item.color,
      item.unitPrice.toString(),
      item.qty34.toString(),
      item.qty36.toString(),
      item.qty38.toString(),
      item.qty40.toString(),
      item.qty42.toString(),
      item.lineTotal.toString(),
    ])
  }

  // Add totals
  rows.push([])
  rows.push(['', '', '', '', '', '', '', '', 'סה"כ לפני מע"מ:', order.subtotal.toString()])
  rows.push(['', '', '', '', '', '', '', '', 'מע"מ:', order.vat.toString()])
  rows.push(['', '', '', '', '', '', '', '', 'סה"כ:', order.total.toString()])

  // Convert to CSV
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

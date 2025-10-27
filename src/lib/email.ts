import nodemailer from 'nodemailer'
import { OrderWithItems } from '@/types'
import { Settings } from '@prisma/client'
import { formatPrice, formatDate } from './utils'

export async function sendOrderEmail(
  order: OrderWithItems,
  settings: Settings,
  pdfBuffer: Buffer
) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('SMTP not configured, skipping email')
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  const totalItems = order.items.reduce((sum, item) => {
    return sum + item.qty34 + item.qty36 + item.qty38 + item.qty40 + item.qty42
  }, 0)

  const emailHtml = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #e91e63; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f5f5f5; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: right; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; }
    .total { font-weight: bold; font-size: 18px; color: #e91e63; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>הזמנה חדשה התקבלה!</h1>
      <p>מספר הזמנה: ${order.orderNumber}</p>
    </div>

    <div class="content">
      <h2>פרטי החנות:</h2>
      <p><strong>שם החנות:</strong> ${order.retailerName}</p>
      ${order.vatNumber ? `<p><strong>ח.פ/עוסק:</strong> ${order.vatNumber}</p>` : ''}
      <p><strong>איש קשר:</strong> ${order.contactName}</p>
      <p><strong>טלפון:</strong> ${order.phone}</p>
      <p><strong>מייל:</strong> ${order.email}</p>
      <p><strong>כתובת משלוח:</strong> ${order.shippingAddress}</p>
      ${order.requestedDate ? `<p><strong>תאריך מבוקש:</strong> ${formatDate(order.requestedDate)}</p>` : ''}
      ${order.notes ? `<p><strong>הערות:</strong> ${order.notes}</p>` : ''}

      <h2>סיכום ההזמנה:</h2>
      <p><strong>מספר פריטים:</strong> ${totalItems}</p>
      <p><strong>סה"כ לפני מע"מ:</strong> ${formatPrice(order.subtotal)}</p>
      <p><strong>מע"מ:</strong> ${formatPrice(order.vat)}</p>
      <p class="total">סה"כ לתשלום: ${formatPrice(order.total)}</p>

      <p>פרטים מלאים בקובץ המצורף.</p>
    </div>

    <div class="footer">
      <p>הזמנה זו נוצרה ב-${formatDate(order.createdAt)}</p>
    </div>
  </div>
</body>
</html>
  `

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: settings.businessEmail,
    cc: order.email,
    subject: `הזמנה חדשה #${order.orderNumber} - ${order.retailerName}`,
    html: emailHtml,
    attachments: [
      {
        filename: `order-${order.orderNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  }

  await transporter.sendMail(mailOptions)
}

import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });
}

export function generateOrderEmailHtml(order: any): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e91e63; color: white; padding: 20px; text-align: center; }
        .content { background: #f5f5f5; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: right; border-bottom: 1px solid #ddd; }
        th { background: #f0f0f0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>הזמנה חדשה התקבלה</h1>
        </div>
        <div class="content">
          <h2>פרטי ההזמנה</h2>
          <p><strong>חנות:</strong> ${order.retailerName}</p>
          <p><strong>איש קשר:</strong> ${order.contactName}</p>
          <p><strong>טלפון:</strong> ${order.phone}</p>
          <p><strong>אימייל:</strong> ${order.email}</p>
          <p><strong>כתובת משלוח:</strong> ${order.shippingAddress}</p>
          ${order.notes ? `<p><strong>הערות:</strong> ${order.notes}</p>` : ''}

          <h3>סיכום הזמנה</h3>
          <p><strong>סה"כ לפני מע"מ:</strong> ₪${order.subtotal.toFixed(2)}</p>
          <p><strong>מע"מ:</strong> ₪${order.vat.toFixed(2)}</p>
          <p><strong>סה"כ לתשלום:</strong> ₪${order.total.toFixed(2)}</p>

          <p style="margin-top: 20px;">מצורפים PDF ו-CSV של ההזמנה.</p>
        </div>
        <div class="footer">
          <p>תודה על ההזמנה!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

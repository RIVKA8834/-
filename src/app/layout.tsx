import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'מערכת הזמנות סיטונאיות',
  description: 'מערכת הזמנות בגדי נשים - קטלוג סיטונאי',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CartItem } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { formatPrice, getTotalQuantity, SIZES } from '@/lib/utils'
import { ArrowRight, Send, CheckCircle, Download } from 'lucide-react'

const orderFormSchema = z.object({
  retailerName: z.string().min(2, 'שם החנות חייב להכיל לפחות 2 תווים'),
  vatNumber: z.string().optional(),
  contactName: z.string().min(2, 'שם איש הקשר חייב להכיל לפחות 2 תווים'),
  phone: z.string().min(9, 'מספר טלפון לא תקין'),
  email: z.string().email('כתובת מייל לא תקינה'),
  shippingAddress: z.string().min(5, 'כתובת משלוח חייבת להכיל לפחות 5 תווים'),
  notes: z.string().optional(),
  requestedDate: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderFormSchema>

interface OrderFormProps {
  cart: CartItem[]
  subtotal: number
  vat: number
  total: number
  onBack: () => void
}

export default function OrderForm({ cart, subtotal, vat, total, onBack }: OrderFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
  })

  async function onSubmit(data: OrderFormData) {
    setSubmitting(true)

    try {
      const items = cart.map(item => ({
        productId: item.productId,
        qty34: item.quantities['34'],
        qty36: item.quantities['36'],
        qty38: item.quantities['38'],
        qty40: item.quantities['40'],
        qty42: item.quantities['42'],
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'שגיאה בשליחת ההזמנה')
      }

      const result = await response.json()
      setOrderData(result)
      setSuccess(true)

      // Clear cart
      localStorage.removeItem('cart')

    } catch (error: any) {
      alert(error.message || 'שגיאה בשליחת ההזמנה. אנא נסה שנית.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success && orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-2">ההזמנה נשלחה בהצלחה!</h2>
              <p className="text-muted-foreground mb-6">
                מספר הזמנה: <span className="font-bold">{orderData.orderNumber}</span>
              </p>

              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm">
                  קיבלת מייל אישור לכתובת שהזנת.
                  <br />
                  נחזור אליך בהקדם לאישור ההזמנה.
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {orderData.pdfPath && (
                  <Button asChild>
                    <a href={orderData.pdfPath} download>
                      <Download className="ml-2 h-4 w-4" />
                      הורד PDF
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.location.href = '/order'}>
                  הזמנה חדשה
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">פרטי הזמנה</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>פרטי החנות</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="retailerName">שם החנות *</Label>
                      <Input
                        id="retailerName"
                        {...register('retailerName')}
                        placeholder="לדוגמה: בוטיק שרה"
                      />
                      {errors.retailerName && (
                        <p className="text-sm text-destructive mt-1">{errors.retailerName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vatNumber">ח.פ / עוסק מורשה</Label>
                      <Input
                        id="vatNumber"
                        {...register('vatNumber')}
                        placeholder="123456789"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">שם איש קשר *</Label>
                      <Input
                        id="contactName"
                        {...register('contactName')}
                        placeholder="שם מלא"
                      />
                      {errors.contactName && (
                        <p className="text-sm text-destructive mt-1">{errors.contactName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">טלפון *</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="050-1234567"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">מייל *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shippingAddress">כתובת משלוח *</Label>
                    <Input
                      id="shippingAddress"
                      {...register('shippingAddress')}
                      placeholder="רחוב, מספר, עיר, מיקוד"
                    />
                    {errors.shippingAddress && (
                      <p className="text-sm text-destructive mt-1">{errors.shippingAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="requestedDate">תאריך מבוקש (אופציונלי)</Label>
                    <Input
                      id="requestedDate"
                      type="date"
                      {...register('requestedDate')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">הערות (אופציונלי)</Label>
                    <textarea
                      id="notes"
                      {...register('notes')}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="הערות מיוחדות להזמנה..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
                      <ArrowRight className="ml-2 h-4 w-4" />
                      חזור
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? (
                        'שולח הזמנה...'
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          שלח הזמנה
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>סיכום הזמנה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map(item => {
                    const totalQty = getTotalQuantity(item.quantities)
                    return (
                      <div key={item.productId} className="text-sm border-b pb-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground text-xs">{item.sku} - {item.color}</div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xs">
                            {SIZES.filter(size => item.quantities[size] > 0).map(size => (
                              <span key={size} className="mr-2">
                                {size}: {item.quantities[size]}
                              </span>
                            ))}
                          </div>
                          <div className="font-medium">
                            {formatPrice(item.unitPrice * totalQty)}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>סה"כ לפני מע"מ:</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>מע"מ:</span>
                      <span>{formatPrice(vat)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>סה"כ לתשלום:</span>
                      <span className="text-pink-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

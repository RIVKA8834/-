import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Lock } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            מערכת הזמנות סיטונאיות
          </h1>
          <p className="text-xl text-muted-foreground">
            קטלוג בגדי נשים - הזמנות בסיטונאות
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>הזמנה חדשה</CardTitle>
              </div>
              <CardDescription>
                עיינו בקטלוג המוצרים וביצעו הזמנה חדשה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/order">
                  התחל הזמנה
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>ניהול מערכת</CardTitle>
              </div>
              <CardDescription>
                כניסה לממשק ניהול (מנהלים בלבד)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/admin/login">
                  כניסת מנהלים
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>💎 מערכת הזמנות מתקדמת לעסקי אופנה</p>
        </div>
      </div>
    </div>
  )
}

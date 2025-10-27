import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Package, ShoppingCart, Settings as SettingsIcon, Upload } from 'lucide-react'
import prisma from '@/lib/prisma'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/admin/login')
  }

  // Get stats
  const [productsCount, ordersCount, pendingOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
  ])

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">ממשק ניהול</h1>
            <p className="text-muted-foreground">שלום, {session.user.name}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">מוצרים פעילים</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productsCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">סה"כ הזמנות</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">הזמנות ממתינות</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-20 text-base" variant="outline">
            <Link href="/admin/catalog">
              <Package className="ml-2 h-5 w-5" />
              ניהול קטלוג
            </Link>
          </Button>

          <Button asChild className="h-20 text-base" variant="outline">
            <Link href="/admin/orders">
              <ShoppingCart className="ml-2 h-5 w-5" />
              הזמנות
            </Link>
          </Button>

          <Button asChild className="h-20 text-base" variant="outline">
            <Link href="/admin/import">
              <Upload className="ml-2 h-5 w-5" />
              ייבוא קטלוג
            </Link>
          </Button>

          <Button asChild className="h-20 text-base" variant="outline">
            <Link href="/admin/settings">
              <SettingsIcon className="ml-2 h-5 w-5" />
              הגדרות
            </Link>
          </Button>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>הזמנות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">אין הזמנות עדיין</p>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{order.retailerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.orderNumber} • {order.items.length} פריטים
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">₪{order.total.toFixed(2)}</div>
                      <div className={`text-xs ${
                        order.status === 'pending' ? 'text-orange-500' :
                        order.status === 'confirmed' ? 'text-green-500' :
                        'text-red-500'
                      }`}>
                        {order.status === 'pending' ? 'ממתין' :
                         order.status === 'confirmed' ? 'אושר' : 'בוטל'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

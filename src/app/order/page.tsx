'use client'

import { useState, useEffect } from 'react'
import { ProductWithSizes, CartItem } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatPrice, SIZES, getTotalQuantity, calculateTotals } from '@/lib/utils'
import { Search, ShoppingCart, Plus, Minus } from 'lucide-react'
import OrderForm from '@/components/order-form'

export default function OrderPage() {
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [colorFilter, setColorFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [vatRate, setVatRate] = useState(0.17)

  // Load products
  useEffect(() => {
    loadProducts()
    loadSettings()
    loadCart()
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    if (cart.size > 0) {
      localStorage.setItem('cart', JSON.stringify(Array.from(cart.entries())))
    }
  }, [cart])

  async function loadProducts() {
    try {
      const res = await fetch('/api/products?active=true')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setVatRate(data.vatRate || 0.17)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  function loadCart() {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        const entries = JSON.parse(saved)
        setCart(new Map(entries))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }

  function updateQuantity(productId: string, size: string, delta: number) {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const newCart = new Map(cart)
    const existingItem = newCart.get(productId) || {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      color: product.color,
      unitPrice: product.unitPrice,
      priceIncludesVat: product.priceIncludesVat,
      quantities: { '34': 0, '36': 0, '38': 0, '40': 0, '42': 0 },
    }

    const currentQty = existingItem.quantities[size as keyof typeof existingItem.quantities]
    const newQty = Math.max(0, currentQty + delta)

    existingItem.quantities[size as keyof typeof existingItem.quantities] = newQty

    // Remove item if all quantities are 0
    const totalQty = getTotalQuantity(existingItem.quantities)
    if (totalQty === 0) {
      newCart.delete(productId)
    } else {
      newCart.set(productId, existingItem)
    }

    setCart(newCart)
  }

  function getCartItemQuantity(productId: string, size: string): number {
    const item = cart.get(productId)
    if (!item) return 0
    return item.quantities[size as keyof typeof item.quantities]
  }

  // Calculate totals
  const cartArray = Array.from(cart.values())
  let orderSubtotal = 0
  let orderVat = 0
  let orderTotal = 0

  for (const item of cartArray) {
    const totalQty = getTotalQuantity(item.quantities)
    const totals = calculateTotals(item.unitPrice, totalQty, item.priceIncludesVat, vatRate)
    orderSubtotal += totals.subtotal
    orderVat += totals.vat
    orderTotal += totals.total
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesColor = !colorFilter ||
      product.color.toLowerCase().includes(colorFilter.toLowerCase())

    return matchesSearch && matchesColor
  })

  if (showForm) {
    return (
      <OrderForm
        cart={cartArray}
        subtotal={orderSubtotal}
        vat={orderVat}
        total={orderTotal}
        onBack={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">קטלוג הזמנות סיטונאיות</h1>
          <p className="text-center mt-2 opacity-90">בחרו מוצרים והוסיפו כמויות לפי מידות</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש לפי דגם או שם..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Input
                placeholder="סינון לפי צבע..."
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">טוען מוצרים...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            לא נמצאו מוצרים
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProducts.map(product => {
              const itemInCart = cart.get(product.id)
              const totalInCart = itemInCart ? getTotalQuantity(itemInCart.quantities) : 0

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="md:col-span-3">
                        <div className="font-bold text-lg">{product.sku}</div>
                        <div className="text-sm text-muted-foreground">{product.name}</div>
                        <div className="text-sm mt-1">
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {product.color}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-center">
                        <div className="text-2xl font-bold text-pink-600">
                          {formatPrice(product.unitPrice)}
                        </div>
                        {product.priceIncludesVat && (
                          <div className="text-xs text-muted-foreground">כולל מע"מ</div>
                        )}
                      </div>

                      {/* Size Quantities */}
                      <div className="md:col-span-6 grid grid-cols-5 gap-2">
                        {SIZES.map(size => {
                          const qty = getCartItemQuantity(product.id, size)
                          return (
                            <div key={size} className="text-center">
                              <Label className="text-xs block mb-1">מידה {size}</Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(product.id, size, -1)}
                                  disabled={qty === 0}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min="0"
                                  value={qty}
                                  onChange={(e) => {
                                    const newQty = parseInt(e.target.value) || 0
                                    const currentQty = getCartItemQuantity(product.id, size)
                                    updateQuantity(product.id, size, newQty - currentQty)
                                  }}
                                  className="h-8 text-center w-14"
                                />
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(product.id, size, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Total in Cart */}
                      <div className="md:col-span-1 text-center">
                        {totalInCart > 0 && (
                          <div className="bg-pink-100 text-pink-700 px-3 py-2 rounded-lg">
                            <div className="text-xs">בעגלה</div>
                            <div className="font-bold">{totalInCart}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Summary */}
      {cart.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-8">
                <div>
                  <div className="text-sm text-muted-foreground">סה"כ לפני מע"מ</div>
                  <div className="text-xl font-bold">{formatPrice(orderSubtotal)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">מע"מ ({(vatRate * 100).toFixed(0)}%)</div>
                  <div className="text-xl font-bold">{formatPrice(orderVat)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">סה"כ לתשלום</div>
                  <div className="text-2xl font-bold text-pink-600">{formatPrice(orderTotal)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('האם אתה בטוח שברצונך לרוקן את העגלה?')) {
                      setCart(new Map())
                      localStorage.removeItem('cart')
                    }
                  }}
                >
                  רוקן עגלה
                </Button>
                <Button
                  size="lg"
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  המשך להזמנה
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

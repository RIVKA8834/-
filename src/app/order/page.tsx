'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Minus } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  color: string;
  unitPrice: number;
  priceIncludesVat: boolean;
}

interface CartItem {
  productId: string;
  product: Product;
  qty34: number;
  qty36: number;
  qty38: number;
  qty40: number;
  qty42: number;
}

const orderFormSchema = z.object({
  retailerName: z.string().min(2, 'שם חנות חובה'),
  vatNumber: z.string().optional(),
  contactName: z.string().min(2, 'שם איש קשר חובה'),
  phone: z.string().min(9, 'טלפון לא תקין'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  shippingAddress: z.string().min(5, 'כתובת משלוח חובה'),
  notes: z.string().optional(),
  requestedDate: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [search, setSearch] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
  });

  useEffect(() => {
    loadProducts();
    loadSettings();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    saveCartToStorage();
  }, [cart]);

  async function loadProducts() {
    try {
      const res = await fetch('/api/products?active=true');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לטעון את המוצרים',
        variant: 'destructive',
      });
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  function updateQuantity(productId: string, size: string, delta: number) {
    setCart((prev) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return prev;

      const current = prev[productId] || {
        productId,
        product,
        qty34: 0,
        qty36: 0,
        qty38: 0,
        qty40: 0,
        qty42: 0,
      };

      const sizeKey = `qty${size}` as keyof CartItem;
      const currentQty = (current[sizeKey] as number) || 0;
      const newQty = Math.max(0, currentQty + delta);

      const updated = { ...current, [sizeKey]: newQty };

      // Remove from cart if all quantities are 0
      const totalQty =
        updated.qty34 + updated.qty36 + updated.qty38 + updated.qty40 + updated.qty42;
      if (totalQty === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [productId]: updated };
    });
  }

  function calculateLineTotal(item: CartItem): number {
    const vatRate = settings?.vatRate || 0.17;
    const totalQty = item.qty34 + item.qty36 + item.qty38 + item.qty40 + item.qty42;
    const unitPrice = item.product.unitPrice;

    if (item.product.priceIncludesVat) {
      return unitPrice * totalQty;
    } else {
      const subtotal = unitPrice * totalQty;
      return subtotal * (1 + vatRate);
    }
  }

  function calculateTotals() {
    const vatRate = settings?.vatRate || 0.17;
    let subtotal = 0;
    let vat = 0;

    Object.values(cart).forEach((item) => {
      const totalQty = item.qty34 + item.qty36 + item.qty38 + item.qty40 + item.qty42;
      const unitPrice = item.product.unitPrice;

      if (item.product.priceIncludesVat) {
        const total = unitPrice * totalQty;
        const sub = total / (1 + vatRate);
        subtotal += sub;
        vat += total - sub;
      } else {
        const sub = unitPrice * totalQty;
        subtotal += sub;
        vat += sub * vatRate;
      }
    });

    return {
      subtotal,
      vat,
      total: subtotal + vat,
    };
  }

  async function onSubmit(data: OrderFormData) {
    if (Object.keys(cart).length === 0) {
      toast({
        title: 'עגלה ריקה',
        description: 'אנא הוסף מוצרים לעגלה',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const items = Object.values(cart).map((item) => ({
        productId: item.productId,
        unitPrice: item.product.unitPrice,
        priceIncludesVat: item.product.priceIncludesVat,
        qty34: item.qty34,
        qty36: item.qty36,
        qty38: item.qty38,
        qty40: item.qty40,
        qty42: item.qty42,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'שגיאה ביצירת הזמנה');
      }

      toast({
        title: 'הזמנה נשלחה בהצלחה!',
        description: 'תקבל אישור באימייל',
      });

      // Clear cart
      setCart({});
      localStorage.removeItem('cart');
      setShowCheckoutForm(false);

      // Show PDF download link
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.sku.toLowerCase().includes(searchLower) ||
      p.name.toLowerCase().includes(searchLower) ||
      p.color.toLowerCase().includes(searchLower)
    );
  });

  const totals = calculateTotals();
  const hasItems = Object.keys(cart).length > 0;

  if (showCheckoutForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">פרטי החנות</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="retailerName">שם החנות *</Label>
                  <Input id="retailerName" {...register('retailerName')} />
                  {errors.retailerName && (
                    <p className="text-sm text-red-500">{errors.retailerName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vatNumber">ח.פ / עוסק מורשה</Label>
                  <Input id="vatNumber" {...register('vatNumber')} />
                </div>

                <div>
                  <Label htmlFor="contactName">שם איש קשר *</Label>
                  <Input id="contactName" {...register('contactName')} />
                  {errors.contactName && (
                    <p className="text-sm text-red-500">{errors.contactName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">טלפון *</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">אימייל *</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shippingAddress">כתובת משלוח *</Label>
                  <Input id="shippingAddress" {...register('shippingAddress')} />
                  {errors.shippingAddress && (
                    <p className="text-sm text-red-500">
                      {errors.shippingAddress.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="requestedDate">תאריך מבוקש</Label>
                  <Input id="requestedDate" type="date" {...register('requestedDate')} />
                </div>

                <div>
                  <Label htmlFor="notes">הערות</Label>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckoutForm(false)}
                    disabled={loading}
                  >
                    חזור
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'שולח...' : 'שלח הזמנה'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">קטלוג הזמנות סיטונאיות</h1>
          <p className="mt-2 text-pink-100">בחר מוצרים והוסף כמויות</p>
        </div>
      </header>

      {/* Search */}
      <div className="mx-auto max-w-7xl p-4">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="חיפוש לפי דגם, שם או צבע..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-right font-semibold">דגם</th>
                <th className="p-3 text-right font-semibold">שם</th>
                <th className="p-3 text-right font-semibold">צבע</th>
                <th className="p-3 text-right font-semibold">מחיר</th>
                <th className="p-3 text-center font-semibold">34</th>
                <th className="p-3 text-center font-semibold">36</th>
                <th className="p-3 text-center font-semibold">38</th>
                <th className="p-3 text-center font-semibold">40</th>
                <th className="p-3 text-center font-semibold">42</th>
                <th className="p-3 text-right font-semibold">סכום</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const item = cart[product.id];
                const lineTotal = item ? calculateLineTotal(item) : 0;

                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{product.sku}</td>
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.color}</td>
                    <td className="p-3">
                      ₪{product.unitPrice.toFixed(2)}
                      {product.priceIncludesVat && (
                        <span className="mr-1 text-xs text-gray-500">*</span>
                      )}
                    </td>
                    {['34', '36', '38', '40', '42'].map((size) => (
                      <td key={size} className="p-1">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateQuantity(product.id, size, -1)}
                            className="rounded p-1 hover:bg-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item?.[`qty${size}` as keyof CartItem] || 0}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, size, 1)}
                            className="rounded p-1 hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    ))}
                    <td className="p-3 font-semibold">
                      {lineTotal > 0 ? `₪${lineTotal.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="bg-white p-8 text-center text-gray-500 rounded-lg mt-4">
              לא נמצאו מוצרים
            </div>
          )}
        </div>

        <p className="mt-2 text-sm text-gray-500">* מחיר כולל מע״מ</p>
      </div>

      {/* Sticky Summary */}
      {hasItems && (
        <div className="sticky-bottom bg-white border-t shadow-lg">
          <div className="mx-auto max-w-7xl p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex gap-4 text-sm">
                  <span>
                    סה״כ לפני מע״מ: <strong>₪{totals.subtotal.toFixed(2)}</strong>
                  </span>
                  <span>
                    מע״מ: <strong>₪{totals.vat.toFixed(2)}</strong>
                  </span>
                  <span className="text-lg text-pink-600">
                    סה״כ: <strong>₪{totals.total.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
              <Button onClick={() => setShowCheckoutForm(true)} size="lg">
                המשך להזנת פרטי החנות
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

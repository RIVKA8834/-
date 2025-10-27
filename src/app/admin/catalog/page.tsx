'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  color: string;
  unitPrice: number;
  priceIncludesVat: boolean;
  active: boolean;
}

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import-catalog', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'שגיאה בייבוא קטלוג');
      }

      toast({
        title: 'הקטלוג יובא בהצלחה',
        description: `${result.imported} מוצרים יובאו`,
      });

      loadProducts();
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(productId: string, active: boolean) {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, active }),
      });

      if (!res.ok) {
        throw new Error('שגיאה בעדכון מוצר');
      }

      loadProducts();
      toast({
        title: 'המוצר עודכן',
        description: active ? 'המוצר הופעל' : 'המוצר הושבת',
      });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ניהול קטלוג</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-gray-300 p-6 hover:border-pink-500">
                  <Upload className="h-6 w-6" />
                  <div>
                    <p className="font-medium">העלה קובץ Excel/CSV</p>
                    <p className="text-sm text-gray-500">
                      גרור קובץ או לחץ לבחירה
                    </p>
                  </div>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            {uploading && <p className="text-sm text-gray-500">מעלה קובץ...</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>מוצרים ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-right">
                  <th className="p-2">דגם</th>
                  <th className="p-2">שם</th>
                  <th className="p-2">צבע</th>
                  <th className="p-2">מחיר</th>
                  <th className="p-2">כולל מע״מ</th>
                  <th className="p-2">סטטוס</th>
                  <th className="p-2">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="p-2">{product.sku}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.color}</td>
                    <td className="p-2">₪{product.unitPrice.toFixed(2)}</td>
                    <td className="p-2">{product.priceIncludesVat ? 'כן' : 'לא'}</td>
                    <td className="p-2">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.active ? 'פעיל' : 'מושבת'}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        variant={product.active ? 'outline' : 'default'}
                        onClick={() => toggleActive(product.id, !product.active)}
                      >
                        {product.active ? 'השבת' : 'הפעל'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

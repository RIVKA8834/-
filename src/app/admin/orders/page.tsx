'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';

interface Order {
  id: string;
  retailerName: string;
  contactName: string;
  phone: string;
  email: string;
  total: number;
  createdAt: string;
  pdfUrl?: string;
  csvUrl?: string;
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לטעון את ההזמנות',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>הזמנות ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-right">
                  <th className="p-2">מספר</th>
                  <th className="p-2">חנות</th>
                  <th className="p-2">איש קשר</th>
                  <th className="p-2">טלפון</th>
                  <th className="p-2">סכום</th>
                  <th className="p-2">תאריך</th>
                  <th className="p-2">קבצים</th>
                  <th className="p-2">פרטים</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="p-2 font-mono text-sm">
                      {order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-2">{order.retailerName}</td>
                    <td className="p-2">{order.contactName}</td>
                    <td className="p-2 dir-ltr text-right">{order.phone}</td>
                    <td className="p-2 font-semibold">
                      ₪{order.total.toFixed(2)}
                    </td>
                    <td className="p-2">
                      {new Date(order.createdAt).toLocaleDateString('he-IL')}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {order.pdfUrl && (
                          <a
                            href={order.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              <Download className="ml-1 h-4 w-4" />
                              PDF
                            </Button>
                          </a>
                        )}
                        {order.csvUrl && (
                          <a
                            href={order.csvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              <Download className="ml-1 h-4 w-4" />
                              CSV
                            </Button>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        הצג
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>פרטי הזמנה #{selectedOrder.id.slice(-8).toUpperCase()}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                סגור
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">חנות</p>
                <p className="font-medium">{selectedOrder.retailerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">איש קשר</p>
                <p className="font-medium">{selectedOrder.contactName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">טלפון</p>
                <p className="font-medium">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">אימייל</p>
                <p className="font-medium">{selectedOrder.email}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">פריטים</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2 text-right">מוצר</th>
                      <th className="p-2 text-right">34</th>
                      <th className="p-2 text-right">36</th>
                      <th className="p-2 text-right">38</th>
                      <th className="p-2 text-right">40</th>
                      <th className="p-2 text-right">42</th>
                      <th className="p-2 text-right">סכום</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">
                          {item.product.sku} - {item.product.name}
                        </td>
                        <td className="p-2">{item.qty34 || '-'}</td>
                        <td className="p-2">{item.qty36 || '-'}</td>
                        <td className="p-2">{item.qty38 || '-'}</td>
                        <td className="p-2">{item.qty40 || '-'}</td>
                        <td className="p-2">{item.qty42 || '-'}</td>
                        <td className="p-2 font-semibold">
                          ₪{item.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="space-y-1 text-left">
                  <p className="text-sm">
                    סה"כ: <strong>₪{selectedOrder.total.toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

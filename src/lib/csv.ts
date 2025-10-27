interface OrderItem {
  product: {
    sku: string;
    name: string;
    color: string;
  };
  unitPrice: number;
  priceIncludesVat: boolean;
  qty34: number;
  qty36: number;
  qty38: number;
  qty40: number;
  qty42: number;
  lineTotal: number;
}

interface OrderData {
  id: string;
  retailerName: string;
  items: OrderItem[];
}

export function generateOrderCSV(order: OrderData): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel
  const headers = [
    'דגם',
    'שם',
    'צבע',
    'מחיר יחידה',
    'כולל מעמ',
    'מידה 34',
    'מידה 36',
    'מידה 38',
    'מידה 40',
    'מידה 42',
    'סכום שורה',
  ];

  const rows = order.items.map((item) => [
    item.product.sku,
    item.product.name,
    item.product.color,
    item.unitPrice.toFixed(2),
    item.priceIncludesVat ? 'כן' : 'לא',
    item.qty34.toString(),
    item.qty36.toString(),
    item.qty38.toString(),
    item.qty40.toString(),
    item.qty42.toString(),
    item.lineTotal.toFixed(2),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return BOM + csvContent;
}

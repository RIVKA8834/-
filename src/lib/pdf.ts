import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// סגנונות ל-PDF עם תמיכה ב-RTL
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #e91e63',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#e91e63',
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row-reverse',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  value: {
    fontSize: 12,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    borderBottom: '2px solid #333',
    paddingBottom: 5,
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottom: '1px solid #ddd',
    paddingVertical: 5,
  },
  tableCell: {
    fontSize: 10,
    padding: 2,
  },
  col1: { width: '15%' },
  col2: { width: '20%' },
  col3: { width: '15%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '10%' },
  col8: { width: '10%' },
  summary: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  summaryValue: {
    fontSize: 12,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1px solid #ddd',
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
});

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
  lineSubtotal: number;
  lineVat: number;
  lineTotal: number;
}

interface OrderData {
  id: string;
  retailerName: string;
  contactName: string;
  phone: string;
  email: string;
  shippingAddress: string;
  vatNumber?: string;
  notes?: string;
  requestedDate?: Date;
  subtotal: number;
  vat: number;
  total: number;
  createdAt: Date;
  items: OrderItem[];
}

interface Settings {
  logoUrl?: string;
  termsHtml?: string;
}

export async function generateOrderPDF(order: OrderData, settings: Settings): Promise<Buffer> {
  const OrderPDF = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>הזמנת סיטונאות - קטלוג בגדי נשים</Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>מספר הזמנה:</Text>
            <Text style={styles.value}>{order.id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>תאריך:</Text>
            <Text style={styles.value}>{new Date(order.createdAt).toLocaleDateString('he-IL')}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>פרטי חנות</Text>
          <View style={styles.row}>
            <Text style={styles.label}>שם חנות:</Text>
            <Text style={styles.value}>{order.retailerName}</Text>
          </View>
          {order.vatNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>ח.פ / עוסק מורשה:</Text>
              <Text style={styles.value}>{order.vatNumber}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>איש קשר:</Text>
            <Text style={styles.value}>{order.contactName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>טלפון:</Text>
            <Text style={styles.value}>{order.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>אימייל:</Text>
            <Text style={styles.value}>{order.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>כתובת משלוח:</Text>
            <Text style={styles.value}>{order.shippingAddress}</Text>
          </View>
          {order.notes && (
            <View style={styles.row}>
              <Text style={styles.label}>הערות:</Text>
              <Text style={styles.value}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.col1]}>דגם</Text>
            <Text style={[styles.tableCell, styles.col2]}>שם / צבע</Text>
            <Text style={[styles.tableCell, styles.col3]}>מחיר יחידה</Text>
            <Text style={[styles.tableCell, styles.col4]}>34</Text>
            <Text style={[styles.tableCell, styles.col5]}>36</Text>
            <Text style={[styles.tableCell, styles.col6]}>38</Text>
            <Text style={[styles.tableCell, styles.col7]}>40</Text>
            <Text style={[styles.tableCell, styles.col8]}>42</Text>
            <Text style={[styles.tableCell, styles.col1]}>סכום</Text>
          </View>
          {order.items.map((item, index) => {
            const totalQty = item.qty34 + item.qty36 + item.qty38 + item.qty40 + item.qty42;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{item.product.sku}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{item.product.name} / {item.product.color}</Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  ₪{item.unitPrice.toFixed(2)}
                  {item.priceIncludesVat && ' *'}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>{item.qty34 || '-'}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{item.qty36 || '-'}</Text>
                <Text style={[styles.tableCell, styles.col6]}>{item.qty38 || '-'}</Text>
                <Text style={[styles.tableCell, styles.col7]}>{item.qty40 || '-'}</Text>
                <Text style={[styles.tableCell, styles.col8]}>{item.qty42 || '-'}</Text>
                <Text style={[styles.tableCell, styles.col1]}>₪{item.lineTotal.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <Text style={{ fontSize: 8, marginBottom: 10 }}>* מחיר כולל מע"מ</Text>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>סה"כ לפני מע"מ:</Text>
            <Text style={styles.summaryValue}>₪{order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>מע"מ:</Text>
            <Text style={styles.summaryValue}>₪{order.vat.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.total]}>סה"כ לתשלום:</Text>
            <Text style={[styles.summaryValue, styles.total]}>₪{order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>תודה על ההזמנה!</Text>
          {settings.termsHtml && (
            <Text style={{ marginTop: 10 }}>{settings.termsHtml.replace(/<[^>]*>/g, '')}</Text>
          )}
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(OrderPDF);
  return buffer as Buffer;
}

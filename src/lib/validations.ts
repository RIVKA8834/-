import { z } from 'zod';

// סכימת מוצר
export const productSchema = z.object({
  sku: z.string().min(1, 'דגם חובה'),
  name: z.string().min(1, 'שם חובה'),
  color: z.string().min(1, 'צבע חובה'),
  unitPrice: z.number().positive('מחיר חייב להיות חיובי'),
  priceIncludesVat: z.boolean().default(false),
  sizeSet: z.string().optional(),
  active: z.boolean().default(true),
});

// סכימת הזמנה
export const orderSchema = z.object({
  retailerName: z.string().min(2, 'שם חנות חובה'),
  vatNumber: z.string().optional(),
  contactName: z.string().min(2, 'שם איש קשר חובה'),
  phone: z.string().min(9, 'טלפון לא תקין'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  shippingAddress: z.string().min(5, 'כתובת משלוח חובה'),
  notes: z.string().optional(),
  requestedDate: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      unitPrice: z.number(),
      priceIncludesVat: z.boolean(),
      qty34: z.number().min(0).default(0),
      qty36: z.number().min(0).default(0),
      qty38: z.number().min(0).default(0),
      qty40: z.number().min(0).default(0),
      qty42: z.number().min(0).default(0),
    })
  ).min(1, 'חובה לבחור לפחות מוצר אחד'),
});

// סכימת הגדרות
export const settingsSchema = z.object({
  vatRate: z.number().min(0).max(1),
  minOrderAmount: z.number().optional(),
  businessEmail: z.string().email(),
  logoUrl: z.string().optional(),
  termsHtml: z.string().optional(),
});

// סכימת התחברות
export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להיות לפחות 6 תווים'),
});

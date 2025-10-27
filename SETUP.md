# מערכת הזמנות סיטונאיות - קטלוג בגדי נשים

אפליקציית Next.js 14 מלאה לניהול הזמנות סיטונאיות בעברית (RTL) עם תמיכה בקטלוג מוצרים, הזמנות, ייצוא PDF/CSV ושליחת מיילים.

## טכנולוגיות

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS (RTL)
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **אימות**: NextAuth.js
- **ולידציה**: Zod, React Hook Form
- **UI**: Radix UI
- **PDF**: @react-pdf/renderer
- **Email**: Nodemailer
- **ייבוא**: SheetJS (xlsx)

## הוראות התקנה

### 1. דרישות מקדימות

- Node.js 18+
- PostgreSQL 14+
- npm או yarn

### 2. התקנת תלויות

```bash
npm install
```

### 3. הגדרת משתני סביבה

צור קובץ `.env` בתיקיית הפרויקט:

```bash
cp .env.example .env
```

ערוך את הקובץ `.env` והגדר:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wholesale_orders?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# SMTP (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="orders@example.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**הערות חשובות:**
- עבור Gmail, צור [App Password](https://support.google.com/accounts/answer/185833)
- השתמש ב-`openssl rand -base64 32` ליצירת NEXTAUTH_SECRET

### 4. הגדרת בסיס הנתונים

```bash
# צור את הטבלאות
npm run db:push

# או עם migrations
npm run db:migrate

# הרץ seed (מידות ואדמין)
npm run db:seed
```

הסקריפט seed יוצר:
- 5 מידות: 34, 36, 38, 40, 42
- משתמש אדמין: `admin@example.com` / `admin123`
- הגדרות ברירת מחדל

### 5. הרצת השרת

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

האפליקציה תהיה זמינה ב: http://localhost:3000

## מבנה הפרויקט

```
CLOTHES-APP/
├── prisma/
│   ├── schema.prisma          # מודל הנתונים
│   └── seed.ts                # נתוני התחלה
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── products/      # ניהול מוצרים
│   │   │   ├── orders/        # הזמנות
│   │   │   ├── import-catalog/# ייבוא קטלוג
│   │   │   └── settings/      # הגדרות
│   │   ├── admin/             # דפי אדמין
│   │   │   ├── login/
│   │   │   ├── catalog/
│   │   │   ├── orders/
│   │   │   └── settings/
│   │   ├── order/             # דף הזמנה ללקוח
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                # קומפוננטות Radix
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # פונקציות עזר
│   │   ├── validations.ts     # Zod schemas
│   │   ├── email.ts           # שליחת מיילים
│   │   ├── pdf.ts             # יצירת PDF
│   │   ├── csv.ts             # יצירת CSV
│   │   └── storage.ts         # ניהול קבצים
│   └── types/
└── public/
    └── orders/                # PDF/CSV files
```

## שימוש במערכת

### ממשק לקוח - `/order`

1. **חיפוש מוצרים**: חפש לפי דגם, שם או צבע
2. **הוספת כמויות**: לחץ +/- ליד כל מידה
3. **סיכום חי**: ברגע תחתון מציג סה"כ, מע"מ וסך הכל
4. **טופס פרטים**: לחץ "המשך להזנת פרטי החנות"
5. **שליחה**: מקבל PDF ו-CSV באימייל

**תכונות:**
- שמירה אוטומטית ב-localStorage
- חישוב נכון של מע"מ (כולל/לא כולל)
- תמיכה מלאה ב-RTL
- נגישות עם מקלדת

### ממשק אדמין - `/admin`

#### התחברות
- URL: `/admin/login`
- ברירת מחדל: `admin@example.com` / `admin123`

#### ניהול קטלוג - `/admin/catalog`
- העלאת קובץ Excel/CSV
- הפעלה/השבתה של מוצרים
- צפייה בכל המוצרים

#### הזמנות - `/admin/orders`
- רשימת כל ההזמנות
- הורדת PDF/CSV
- צפייה בפרטים מלאים

#### הגדרות - `/admin/settings`
- אחוז מע"מ
- מינימום הזמנה
- אימייל עסקי
- לוגו
- תנאים (מופיעים ב-PDF)

## ייבוא קטלוג

### פורמט הקובץ (Excel/CSV)

העמודות הנתמכות (בעברית או אנגלית):

| עברית | אנגלית | חובה | דוגמה |
|-------|--------|------|-------|
| דגם | sku | ✓ | "SKU-001" |
| שם | name | ✓ | "שמלת ערב" |
| צבע | color | ✓ | "שחור" |
| מחיר | unitPrice | ✓ | 250.00 |
| כולל מעמ | priceIncludesVat | | "כן" או "לא" |
| מידות | sizeSet | | "34-42" |
| פעיל | active | | "כן" |

**דוגמה:**

```csv
דגם,שם,צבע,מחיר,כולל מעמ,מידות,פעיל
DR-001,שמלת ערב אלגנטית,שחור,450,כן,34-42,כן
TP-050,חולצה מעוצבת,לבן,120,לא,36-42,כן
```

### נירמול "כולל מע״מ"

הערכים הבאים מזוהים כ-TRUE:
- כן, Yes, TRUE, 1, כולל, כולל מעמ

כל השאר נחשבים FALSE.

## API Documentation

### GET `/api/products`
קבלת מוצרים

**Query Parameters:**
- `search` - חיפוש חופשי
- `color` - סינון לפי צבע
- `active` - רק פעילים (true/false)

### POST `/api/orders`
יצירת הזמנה חדשה

**Body:**
```json
{
  "retailerName": "חנות הדוגמה",
  "vatNumber": "123456789",
  "contactName": "ישראל ישראלי",
  "phone": "050-1234567",
  "email": "store@example.com",
  "shippingAddress": "רחוב הדוגמה 1, תל אביב",
  "notes": "הערות",
  "requestedDate": "2024-12-31",
  "items": [
    {
      "productId": "...",
      "unitPrice": 100,
      "priceIncludesVat": false,
      "qty34": 2,
      "qty36": 3,
      "qty38": 0,
      "qty40": 1,
      "qty42": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "...",
  "pdfUrl": "/orders/order-xxx.pdf",
  "csvUrl": "/orders/order-xxx.csv"
}
```

### POST `/api/import-catalog`
ייבוא קטלוג (מוגן)

**Body:** FormData עם `file`

## סקריפטים

```bash
# Development
npm run dev              # הרצת שרת dev
npm run db:studio        # Prisma Studio

# Database
npm run db:generate      # יצירת Prisma Client
npm run db:push          # דחיפת schema ל-DB
npm run db:migrate       # הרצת migrations
npm run db:seed          # seed נתונים

# Production
npm run build            # בניית production
npm start                # הרצת production
npm run lint             # בדיקת ESLint
```

## Deployment

### Vercel (מומלץ)

1. Push ל-GitHub
2. חבר ל-Vercel
3. הגדר משתני סביבה
4. Deploy!

### Docker

```bash
# Build
docker build -t wholesale-app .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  wholesale-app
```

## אבטחה

- ✅ NextAuth לאימות אדמין
- ✅ ולידציה כפולה (client + server)
- ✅ Zod schemas
- ✅ SQL injection protected (Prisma)
- ⚠️ הוסף reCAPTCHA בפרודקשן
- ⚠️ הוסף rate limiting

## תמיכה

לשאלות ובעיות, פנה לתמיכה או פתח issue ב-GitHub.

## רישיון

MIT

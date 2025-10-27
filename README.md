# 📦 מערכת הזמנות סיטונאיות - קטלוג בגדי נשים

מערכת מלאה לניהול הזמנות סיטונאיות עם ממשק עברי RTL, בנויה ב-Next.js 14 עם TypeScript.

## ⚡ תכונות עיקריות

### 👗 עבור לקוחות (חנויות)
- **קטלוג מוצרים אינטראקטיבי** - עיון במוצרים עם חיפוש וסינון
- **הזמנה לפי מידות** - בחירת כמויות לכל מידה (34-42) בנפרד
- **עגלת קניות חכמה** - שמירה ב-localStorage, שחזור אוטומטי
- **חישוב מחירים דינמי** - תמיכה במחירים כולל/לא כולל מע"מ
- **סיכום הזמנה בזמן אמת** - תצוגה של סה"כ לפני/אחרי מע"מ
- **טופס הזמנה מאובטח** - ולידציות מלאות עם Zod
- **אישור מיידי** - PDF להורדה + מייל אוטומטי

### 🔧 עבור מנהלים
- **ניהול קטלוג** - הוספה, עריכה, מחיקה של מוצרים
- **ייבוא קטלוג** - העלאת קובץ Excel/CSV עם מיפוי עמודות
- **ניהול הזמנות** - צפייה, אישור/ביטול, ייצוא PDF/CSV
- **דשבורד סטטיסטיקות** - מספרי מפתח והזמנות אחרונות
- **הגדרות מערכת** - שיעור מע"מ, סכום מינימלי, תנאים

## 🛠️ טכנולוגיות

- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- NextAuth authentication
- Tailwind CSS (RTL)
- Radix UI components
- React Hook Form + Zod validation
- PDFKit + NodeMailer + SheetJS

## 🚀 התקנה מהירה

```bash
# 1. התקנת תלויות
npm install

# 2. העתקת .env
cp .env.example .env
# ערוך את .env עם הערכים שלך

# 3. הגדרת DB
npx prisma migrate dev --name init
npm run prisma:seed

# 4. הרצת השרת
npm run dev
```

פתח `http://localhost:3000`

**משתמש ברירת מחדל**: admin@example.com / admin123

## 📖 תיעוד מלא

ראה את התיעוד המפורט בהמשך README זה לפרטים על:
- התקנה מלאה
- הגדרת SMTP ומייל
- ייבוא קטלוג
- מבנה הדאטה
- פריסה לפרודקשן

---

## 📋 התקנה מפורטת

### דרישות מקדימות
- Node.js 18+
- PostgreSQL 14+
- npm/yarn

### שלב 1: שכפול ותלויות

```bash
git clone <repository-url>
cd wholesale-fashion-orders
npm install
```

### שלב 2: משתני סביבה

העתק `.env.example` ל-`.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wholesale_orders"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<32-character-random-string>"

# SMTP (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

### שלב 3: מסד נתונים

```bash
# יצירת טבלאות
npx prisma migrate dev --name init

# טעינת מידות ומשתמש admin
npm run prisma:seed
```

### שלב 4: הרצה

```bash
npm run dev  # Development
# או
npm run build && npm start  # Production
```

## 📧 הגדרת SMTP (Gmail)

1. הפעל 2-Factor Authentication
2. צור App Password: Settings → Security → App passwords
3. העתק לסיסמה ל-.env

## 📊 שימוש במערכת

### לקוחות: `/order`
1. חפש/סנן מוצרים
2. הוסף כמויות לפי מידות
3. המשך להזמנה
4. מלא פרטים
5. קבל PDF + מייל

### מנהלים: `/admin`
1. התחבר: admin@example.com / admin123
2. ניהול קטלוג - הוסף/ערוך/מחק
3. ייבוא Excel/CSV
4. ניהול הזמנות
5. הגדרות מע"מ ותנאים

## 📁 מבנה

```
src/
├── app/           # Pages (Next.js 14)
│   ├── admin/     # Admin dashboard
│   ├── api/       # API routes
│   └── order/     # Customer order page
├── components/    # React components
├── lib/           # Utils, auth, DB
└── types/         # TypeScript types

prisma/
├── schema.prisma  # Database schema
└── seed.ts        # Seed data
```

## 🎯 ייבוא קטלוג

פורמט Excel/CSV מומלץ:

| דגם | שם | צבע | מחיר | כולל מעמ | מידות |
|-----|-----|-----|------|---------|-------|
| 1001 | שמלת ערב | שחור | 450 | כן | 34-42 |
| 1002 | חולצת משי | לבן | 180 | לא | 36-42 |

עמודות חובה: דגם, שם, צבע, מחיר

## 🚀 פריסה

### Vercel
1. העלה ל-GitHub
2. חבר ל-Vercel
3. הגדר ENV variables
4. Deploy

### Railway/Render
1. צור PostgreSQL DB
2. העלה קוד
3. הגדר ENV
4. `npx prisma migrate deploy`

## 🔧 פקודות

```bash
npm run dev              # Development
npm run build            # Build
npm start                # Production
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # DB GUI
npm run prisma:seed      # Seed data
```

## 🐛 פתרון בעיות

**DB לא מתחבר**: בדוק DATABASE_URL, הרץ `npx prisma studio`

**Prisma Client לא נמצא**: `npx prisma generate`

**מיילים לא נשלחים**: בדוק SMTP credentials, App Password

**עגלה לא נשמרת**: בדוק localStorage ב-DevTools

## 🎨 עיצוב RTL

- כל הטקסטים בעברית
- כיווניות RTL מלאה
- פורמט מחירים/תאריכים עברי
- Tailwind RTL config

## 🔒 אבטחה

- NextAuth authentication
- bcrypt password hashing
- Zod validation (client+server)
- Prisma ORM (SQL injection protection)
- reCAPTCHA ready

## 📝 רישיון

MIT - שימוש חופשי

---

**בנוי ב-💜 עם Next.js 14 + TypeScript + Prisma**

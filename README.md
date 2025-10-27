# 🛍️ אפליקציית הזמנות סיטונאיות - קטלוג בגדי נשים

אפליקציית Next.js 14 מלאה לניהול הזמנות סיטונאיות בעברית (RTL) עם תמיכה מלאה בקטלוג מוצרים, מערכת הזמנות, ייצוא PDF/CSV ושליחת מיילים אוטומטיים.

## ✨ תכונות עיקריות

### ממשק לקוח
- 🔍 חיפוש ופילטר מוצרים מתקדם
- 📊 טבלה אינטראקטיבית עם שדות כמות למידות 34-42
- 💰 חישוב סיכום חי (סה"כ, מע"מ, סך הכל)
- 💾 שמירה אוטומטית של עגלה ב-localStorage
- 📝 טופס פרטי חנות עם ולידציה מלאה
- 📧 קבלת אישור הזמנה באימייל
- 📄 הורדת PDF ו-CSV של ההזמנה

### ממשק אדמין
- 📥 ייבוא קטלוג מ-Excel/CSV
- ⚙️ ניהול מוצרים (הפעלה/השבתה)
- 📋 צפייה בכל ההזמנות
- 📊 הורדת PDF/CSV של הזמנות
- 🔧 הגדרות מערכת (מע"מ, מינימום, אימייל, תנאים)

### תכונות טכניות
- 🌐 RTL מלא בעברית
- ♿ נגישות מלאה
- 📱 Responsive Design
- 🔐 אימות מאובטח עם NextAuth
- ✅ ולידציה כפולה (client + server)
- 📧 שליחת מיילים עם Nodemailer
- 🎨 UI מודרני עם Radix UI + Tailwind

## 🚀 התחלה מהירה

### דרישות מקדימות
- Node.js 18+
- PostgreSQL 14+

### התקנה

```bash
# שכפול הפרויקט
git clone <repository-url>
cd CLOTHES-APP

# התקנת תלויות
npm install

# הגדרת משתני סביבה
cp .env.example .env
# ערוך את .env עם הפרטים שלך

# הגדרת בסיס נתונים
npm run db:push
npm run db:seed

# הרצה
npm run dev
```

האפליקציה תהיה זמינה ב: **http://localhost:3000**

### כניסה כאדמין
- URL: http://localhost:3000/admin/login
- אימייל: `admin@example.com`
- סיסמה: `admin123`

## 📖 תיעוד מלא

ראה [SETUP.md](./SETUP.md) להוראות התקנה מפורטות, API documentation ושימוש במערכת.

## 🛠️ סטאק טכנולוגי

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (RTL)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Validation**: Zod + React Hook Form
- **UI Components**: Radix UI
- **PDF Generation**: @react-pdf/renderer
- **Email**: Nodemailer
- **File Parsing**: SheetJS (xlsx)

## 📁 מבנה הפרויקט

```
CLOTHES-APP/
├── prisma/              # Database schema & seed
├── src/
│   ├── app/            # Next.js pages & API routes
│   │   ├── api/        # REST API endpoints
│   │   ├── admin/      # Admin dashboard
│   │   └── order/      # Customer order page
│   ├── components/     # React components
│   ├── lib/            # Utilities & helpers
│   └── types/          # TypeScript types
└── public/             # Static files
```

## 🎯 תכונות מרכזיות

### חישוב מע"מ חכם
- תמיכה במחירים כולל/לא כולל מע"מ
- חישוב אוטומטי נכון לפי סוג המוצר
- הצגה ברורה ב-PDF

### ייבוא קטלוג
- תמיכה ב-Excel ו-CSV
- מיפוי אוטומטי של עמודות בעברית ואנגלית
- קישור אוטומטי למידות
- Upsert חכם (עדכון או יצירה)

### PDF מתקדם
- תבנית RTL מקצועית
- כולל לוגו ותנאים
- טבלת פריטים מפורטת
- סיכום כספי מלא

## 📝 רישיון

MIT License - ראה [LICENSE](./LICENSE) לפרטים

## 👥 תמיכה

לשאלות ובעיות, פתח issue או פנה לתמיכה.

---

<div align="center">
  נבנה עם ❤️ בעברית
</div>

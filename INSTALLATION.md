# 🚀 התקנה מהירה - 5 דקות

## דרישות
- Node.js 18+
- PostgreSQL (או חשבון בענן)

## צעדים

### 1️⃣ התקנת תלויות
```bash
npm install
```

### 2️⃣ העתקת משתני סביבה
```bash
cp .env.example .env
```

ערוך את `.env` - **לפחות** עדכן את:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/wholesale_orders"
NEXTAUTH_SECRET="<any-random-32-char-string>"
```

### 3️⃣ הגדרת DB
```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4️⃣ הרצה
```bash
npm run dev
```

פתח: http://localhost:3000

## 🎯 כניסה

### אדמין
- URL: http://localhost:3000/admin/login
- מייל: `admin@example.com`
- סיסמה: `admin123`

### לקוח (חנות)
- URL: http://localhost:3000/order
- ללא הרשמה - פשוט תתחיל להזמין!

## 📧 מייל (אופציונלי)

אם רוצה לקבל מיילים:

1. Gmail: צור App Password
2. עדכן ב-`.env`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

## 🐘 PostgreSQL

### מקומי (macOS)
```bash
brew install postgresql
brew services start postgresql
createdb wholesale_orders
```

### מקומי (Ubuntu/Debian)
```bash
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb wholesale_orders
```

### בענן (חינם)
- [Supabase](https://supabase.com) - PostgreSQL חינמי
- [Railway](https://railway.app) - PostgreSQL חינמי
- [Neon](https://neon.tech) - PostgreSQL serverless

## ❓ בעיות?

### שגיאת חיבור ל-DB
```bash
# בדוק שהטבלאות נוצרו:
npx prisma studio
```

### Prisma Client לא נמצא
```bash
npx prisma generate
```

### Port 3000 תפוס
```bash
# שנה בהרצה:
PORT=3001 npm run dev
```

## ✅ מוכן!

עכשיו אתה יכול:
1. **להזמין**: http://localhost:3000/order
2. **לנהל**: http://localhost:3000/admin

ראה README.md לתיעוד מלא.

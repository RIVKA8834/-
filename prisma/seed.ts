import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 מתחיל seeding...');

  // יצירת מידות 34-42
  const sizes = ['34', '36', '38', '40', '42'];

  console.log('📏 יוצר מידות...');
  for (const sizeName of sizes) {
    await prisma.size.upsert({
      where: { name: sizeName },
      update: {},
      create: { name: sizeName },
    });
  }
  console.log('✅ נוצרו 5 מידות');

  // יצירת אדמין ברירת מחדל
  const hashedPassword = await bcrypt.hash('admin123', 10);

  console.log('👤 יוצר משתמש אדמין...');
  await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'מנהל ראשי',
    },
  });
  console.log('✅ נוצר משתמש אדמין (admin@example.com / admin123)');

  // יצירת הגדרות ברירת מחדל
  console.log('⚙️ יוצר הגדרות...');
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      vatRate: 0.17,
      minOrderAmount: 500,
      businessEmail: 'orders@example.com',
      termsHtml: '<p>תנאי עסקה יופיעו כאן</p>',
    },
  });
  console.log('✅ נוצרו הגדרות ברירת מחדל');

  console.log('🎉 Seeding הושלם בהצלחה!');
}

main()
  .catch((e) => {
    console.error('❌ שגיאה ב-seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

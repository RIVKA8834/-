import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create sizes [34, 36, 38, 40, 42]
  const sizes = ['34', '36', '38', '40', '42']

  for (const sizeName of sizes) {
    await prisma.size.upsert({
      where: { name: sizeName },
      update: {},
      create: { name: sizeName },
    })
  }
  console.log('✅ Created sizes:', sizes.join(', '))

  // Create default settings
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      vatRate: 0.17,
      minOrderAmount: 1000,
      businessEmail: 'orders@example.com',
      termsHtml: '<p>תנאי עסקה: תשלום תוך 30 יום. משלוח תוך 7-14 ימי עסקים.</p>',
    },
  })
  console.log('✅ Created default settings')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'מנהל מערכת',
      role: 'admin',
    },
  })
  console.log('✅ Created admin user: admin@example.com / admin123')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

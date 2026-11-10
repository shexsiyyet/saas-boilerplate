import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12)

  const demo = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })

  // Create usage records
  await prisma.usage.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, count: 0, limit: 10000 },
  })

  await prisma.usage.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id, count: 5, limit: 100 },
  })

  console.log('✅ Database seeded!')
  console.log('Admin: admin@example.com / admin123')
  console.log('Demo: demo@example.com / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
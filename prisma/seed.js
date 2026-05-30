/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bis_db',
  connectionLimit: 1,
  ssl: { rejectUnauthorized: false }
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  console.log('🗑️ Deleting all existing packages to prevent duplicates...');
  await prisma.package.deleteMany();

  // 1. Seed Packages (الباقات)
  const packages = [
    {
      type: "Free Trial",
      price: 0,
      duration: "forever",
      description: "Limited access to reports, Basic AI chatbot access, Limited consultations",
    },
    {
      type: "Basic",
      price: 99,
      duration: "month",
      description: "Full access to market reports, Budget analysis tools, AI advisory chatbot, Request marketing research template, Email support",
    },
    {
      type: "Premium",
      price: 200,
      duration: "month",
      description: "All Basic features, Private consultant sessions, Financial performance dashboard, One-year follow-up support, Dedicated account manager, 24/7 priority support, Custom financial modeling",
    }
  ];

  console.log('📦 Seeding Packages...');
  for (const pkg of packages) {
    // Check if package already exists by type to avoid duplicates
    const existingPkg = await prisma.package.findFirst({
      where: { type: pkg.type }
    });

    if (!existingPkg) {
      await prisma.package.create({
        data: pkg
      });
      console.log(`✅ Created package: ${pkg.type}`);
    } else {
      console.log(`ℹ️ Package already exists: ${pkg.type} (Skipping)`);
    }
  }

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

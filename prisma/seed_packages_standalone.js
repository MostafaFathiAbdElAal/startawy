
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

const prismaClientSingleton = () => {
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bis_db',
    ssl: {
      rejectUnauthorized: false, 
    },
  });
  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

const prisma = prismaClientSingleton();

async function main() {
  const packages = [
    {
      type: "Free Trial",
      price: 0,
      duration: "forever",
      description: "Limited access to reports, Basic AI chatbot access, Limited consultations, Community support",
    },
    {
      type: "Basic",
      price: 99,
      duration: "month",
      description: "Full access to market reports, Budget analysis tools, AI advisory chatbot, Request marketing research template, Email support, Monthly financial reviews",
    },
    {
      type: "Premium",
      price: 299,
      duration: "month",
      description: "All Basic features, Private consultant sessions, Financial performance dashboard, One-year follow-up support, Dedicated account manager, 24/7 priority support, Quarterly strategy sessions",
    },
  ];

  console.log('Seeding packages...');

  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({
      where: { type: pkg.type }
    });

    if (!existing) {
      await prisma.package.create({ data: pkg });
      console.log(`Created package: ${pkg.type}`);
    } else {
      console.log(`Package ${pkg.type} already exists, skipping.`);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

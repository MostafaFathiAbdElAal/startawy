import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding data...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Create a founder user if it doesn't exist
  const founderUser = await prisma.user.upsert({
    where: { email: 'founder@example.com' },
    update: {},
    create: {
      email: 'founder@example.com',
      name: 'John Founder',
      password: hashedPassword,
      type: 'FOUNDER',
      isEmailVerified: true,
      founder: {
        create: {
          businessName: 'Tech Startup Inc',
          businessSector: 'Fintech',
          foundingDate: new Date(),
        }
      }
    }
  });

  console.log('Seed completed. Created/Updated user:', founderUser.email);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

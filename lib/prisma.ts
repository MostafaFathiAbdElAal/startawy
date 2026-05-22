// Force reload Prisma client
import 'server-only';
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const prismaClientSingleton = () => {
  // Use explicit connection config - same structure as original, now pointing to Aiven cloud
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bis_db',
    connectionLimit: 1, // Enforce single connection for Vercel stability
    ssl: {
      rejectUnauthorized: false, // Required for Aiven cloud SSL
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  return new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Ensuring we don't create multiple instances in dev
const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma
export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

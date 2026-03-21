import 'server-only';
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const prismaClientSingleton = () => {
  // Use explicit connection config to avoid URL parsing issues
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bis_db',
  } as Parameters<typeof PrismaMariaDb>[0])
  return new PrismaClient({
    adapter,
    log: ['query'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma
export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

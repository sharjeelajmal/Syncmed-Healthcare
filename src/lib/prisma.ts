import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

declare global {
  var prisma: undefined | PrismaClient
  var pool: undefined | pg.Pool
}

const getPrismaClient = () => {
  if (!globalThis.pool) {
    globalThis.pool = new pg.Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 20, // Increased for better concurrency
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
    })
    
    globalThis.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }
  
  const adapter = new PrismaPg(globalThis.pool)
  return new PrismaClient({ 
    adapter,
    log: ["error", "warn"]
  })
}

const prisma = globalThis.prisma ?? getPrismaClient()

export default prisma

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

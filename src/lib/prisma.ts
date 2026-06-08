import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

/** Bump when PatientProfile or other queried models change shape (invalidates dev singleton). */
const PRISMA_CLIENT_GENERATION = "patient-diagnoses-field-v1"

declare global {
  var prisma: undefined | PrismaClient
  var pgPool: undefined | pg.Pool
  var prismaClientGeneration: undefined | string
}

function getConnectionString(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }

  // Neon pooler works best with pgbouncer mode for server-side pg.Pool
  if (url.includes("-pooler.") && !url.includes("pgbouncer=")) {
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}pgbouncer=true`
  }

  return url
}

function createPool(): pg.Pool {
  const pool = new pg.Pool({
    connectionString: getConnectionString(),
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 20_000,
    keepAlive: true,
  })

  pool.on("error", (err) => {
    console.error("Unexpected error on idle pg client", err)
    if (process.env.NODE_ENV !== "production") {
      globalThis.pgPool = undefined
      globalThis.prisma = undefined
    }
  })

  void pool.query("SELECT 1").catch((err) => {
    console.warn("DB pool warmup failed:", err.message)
  })

  return pool
}

function getPrismaClient(): PrismaClient {
  if (!globalThis.pgPool) {
    globalThis.pgPool = createPool()
  }

  const adapter = new PrismaPg(globalThis.pgPool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

if (
  process.env.NODE_ENV !== "production" &&
  globalThis.prisma &&
  globalThis.prismaClientGeneration !== PRISMA_CLIENT_GENERATION
) {
  void globalThis.prisma.$disconnect()
  globalThis.prisma = undefined
  globalThis.pgPool = undefined
}

const prisma = globalThis.prisma ?? getPrismaClient()

export default prisma

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
  globalThis.prismaClientGeneration = PRISMA_CLIENT_GENERATION
}

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

/** Bump when PatientProfile or other queried models change shape (invalidates dev singleton). */
const PRISMA_CLIENT_GENERATION = "chart-notes-labs-v2-resilient-pool"

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

function isConnectTimeout(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return /timeout exceeded when trying to connect|connection timeout/i.test(message)
}

/**
 * Opening a TLS connection to Neon can take several seconds on slow networks
 * (measured 5-9s from a dev machine, occasionally >30s). A single slow
 * handshake used to crash the whole page with "timeout exceeded when trying to
 * connect", so a timed-out connect is retried once before giving up.
 */
class ResilientPool extends pg.Pool {
  // pg's own pool.query() uses the callback form, Prisma's adapter the promise form.
  connect(): Promise<pg.PoolClient>
  connect(callback: (err: Error | undefined, client: pg.PoolClient | undefined, done: (release?: unknown) => void) => void): void
  connect(
    callback?: (err: Error | undefined, client: pg.PoolClient | undefined, done: (release?: unknown) => void) => void
  ): Promise<pg.PoolClient> | void {
    const attempt = () => super.connect()
    const connected = attempt().catch((err: unknown) => {
      if (!isConnectTimeout(err)) throw err
      console.warn("DB connect timed out, retrying once")
      return attempt()
    })

    if (!callback) return connected
    connected.then(
      (client) => callback(undefined, client, (release?: unknown) => client.release(release as Error | boolean | undefined)),
      (err: Error) => callback(err, undefined, () => {})
    )
  }
}

function createPool(): pg.Pool {
  const pool = new ResilientPool({
    connectionString: getConnectionString(),
    max: 10,
    connectionTimeoutMillis: 20_000,
    // Keep warm connections around between clicks so each page load doesn't
    // pay for a fresh handshake. Neon drops them itself when compute suspends.
    idleTimeoutMillis: 5 * 60_000,
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

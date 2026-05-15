import { PrismaClient } from "@prisma/client"
import "dotenv/config"

async function main() {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany()
    console.log("Users:", users)
  } catch (e) {
    console.error("Prisma Error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  })
  
  if (user) {
    console.log("ADMIN_ID=" + user.id)
  } else {
    console.log("No admin found")
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  const prisma = new PrismaClient()
  const adminEmail = "admin@healthcare.com"
  const adminPassword = "AdminPassword123"
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  console.log("Seeding database...")

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "ADMIN",
      firstName: "System",
      lastName: "Administrator",
      isActive: true,
    },
  })

  console.log(`Admin user created: ${admin.email}`)
  console.log("Seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // prisma is local now
  })

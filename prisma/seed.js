const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const pg = require("pg")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
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
    await prisma.$disconnect()
  })

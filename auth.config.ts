import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  // CRITICAL FIX 1: Explicit secret with fallback so Edge Runtime never fails
  secret: process.env.AUTH_SECRET || "syncmed-super-secret-key-must-be-at-least-32-chars-long",
  // CRITICAL FIX 2: Prevents silent cookie rejection on localhost vs 127.0.0.1
  trustHost: true, 
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id
        token.role = (user as { role?: string }).role
        token.name = user.name
        token.email = user.email
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name
      }

      // Keep session cookie small (admin profile avatars live in DB only)
      delete token.picture
      delete (token as { image?: string }).image

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        ;(session.user as { role?: string }).role = token.role as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        ;(session.user as { image?: string | null }).image = null
      }
      return session
    },
  },
  providers: [], 
} satisfies NextAuthConfig
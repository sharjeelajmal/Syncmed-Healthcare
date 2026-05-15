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
    async jwt({ token, user }) {
      // user object sirf initial sign-in pe available hota hai
      if (user) {
        token.sub = user.id // 'id' ki bajaye 'sub' (subject) use karein jo JWT standard hai
        token.role = (user as any).role
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string // token.sub ko map back karein session.user.id pe
        ;(session.user as any).role = token.role
        session.user.name = token.name as string
      }
      return session
    },
  },
  providers: [], 
} satisfies NextAuthConfig
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
        const image = (user as { image?: string | null }).image
        // Avoid storing large base64 avatars in the JWT cookie
        if (image && !image.startsWith("data:")) {
          token.picture = image
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name
        const nextImage = (session as { image?: string | null }).image
        if (nextImage && !nextImage.startsWith("data:")) {
          token.picture = nextImage
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string // token.sub ko map back karein session.user.id pe
        ;(session.user as any).role = token.role
        session.user.name = token.name as string
        ;(session.user as { image?: string | null }).image =
          (token.picture as string | null | undefined) ?? null
      }
      return session
    },
  },
  providers: [], 
} satisfies NextAuthConfig
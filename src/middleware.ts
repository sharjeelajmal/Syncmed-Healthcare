import NextAuth from "next-auth"
import { NextResponse } from "next/server"

// Inline config for Edge Runtime — no prisma/bcrypt imports allowed here
// Only session strategy and secret are needed for middleware routing
const { auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "syncmed-super-secret-key-must-be-at-least-32-chars-long",
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [], // providers sirf auth.ts (Node runtime) mein hain
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        ;(session.user as any).role = token.role
      }
      return session
    }
  }
})

export default auth((req) => {
  let isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname

  // STALE SESSION FIX: If session has an invalid UUID (like the fake "1" from bypass), destroy the cookie
  if (isLoggedIn) {
    const userId = (req.auth?.user as any)?.id
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || "")
    if (!isValidUUID) {
      isLoggedIn = false
      
      // BREAK REDIRECT LOOP: If already on login page, don't redirect to it again
      const response = path === "/login" 
        ? NextResponse.next() 
        : NextResponse.redirect(new URL("/login", req.nextUrl))

      response.cookies.delete("authjs.session-token")
      response.cookies.delete("__Secure-authjs.session-token")
      response.cookies.delete("next-auth.session-token")
      response.cookies.delete("__Secure-next-auth.session-token")
      return response
    }
  }

  // 1. Logged-in user /login pe → dashboard redirect
  if (isLoggedIn && path === "/login") {
    const role = (req.auth?.user as any)?.role || "PATIENT"
    const redirectPath =
      role === "ADMIN" ? "/admin/dashboard" :
      role === "PROVIDER" ? "/provider/dashboard" :
      "/patient/dashboard"
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl))
  }

  // 2. Protected routes → kick to /login
  const isProtectedRoute =
    path.startsWith("/admin") ||
    path.startsWith("/provider") ||
    path.startsWith("/patient")

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|manifest\\.json|sw\\.js|icon-192\\.png|icon-512\\.png|logo\\.png|logorightbg\\.png|favicon\\.ico|$).*)",
  ],
}
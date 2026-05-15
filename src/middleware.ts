import NextAuth from "next-auth"
import { authConfig } from "../auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname

  // TERMINAL LOGS: Yeh aapko exact batayega ke session pass ho raha hai ya fail
  console.log(`[Middleware] Path: ${path} | LoggedIn: ${isLoggedIn}`)
  if (!isLoggedIn && path !== "/login") {
    console.log("[Middleware Warning] Auth is NULL. Cookie was rejected or not found!")
  }

  // 1. LOOP BREAKER: Logged-in user trying to hit /login → redirect to dashboard
  if (isLoggedIn && path === "/login") {
    const role = (req.auth?.user as any)?.role || "PATIENT"
    const redirectPath =
      role === "ADMIN" ? "/admin/dashboard" : 
      role === "PROVIDER" ? "/provider/dashboard" : 
      "/patient/dashboard"
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl))
  }

  // 2. PROTECTED ROUTES: Unauthenticated users accessing portals → kick to /login
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
    "/((?!api|_next/static|_next/image|images|logo\\.png|logorightbg\\.png|favicon\\.ico|$).*)",
  ],
}
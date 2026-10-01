import { signOut } from "next-auth/react"

/**
 * Signs out and goes to /login on the *current* origin.
 *
 * `signOut({ callbackUrl })` navigates to an absolute URL built on the server
 * from AUTH_URL / the proxy's Host header — on the live server that resolved
 * to http://localhost. Navigating to a relative path in the browser always
 * stays on the domain the user is actually on (same pattern as the login page).
 */
export async function signOutToLogin(): Promise<void> {
  try {
    await signOut({ redirect: false })
  } finally {
    window.location.assign("/login")
  }
}

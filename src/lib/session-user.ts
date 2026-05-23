import type { Session } from "next-auth"

export type LayoutUser = {
  firstName: string
  lastName: string
  image: string | null
  role: string | null
}

export function layoutUserFromSession(session: Session): LayoutUser {
  const name = session.user?.name?.trim() || "System Administrator"
  const parts = name.split(/\s+/)
  const firstName = parts[0] ?? "System"
  const lastName = parts.slice(1).join(" ") || "Administrator"

  return {
    firstName,
    lastName,
    image: (session.user as { image?: string | null })?.image ?? null,
    role: (session.user as { role?: string })?.role ?? null,
  }
}

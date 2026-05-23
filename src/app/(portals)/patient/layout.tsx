export const dynamic = "force-dynamic"
export const revalidate = 0

import { auth } from "@/../auth"
import { layoutUserFromSession } from "@/lib/session-user"
import { PatientLayoutClient } from "./PatientLayoutClient"

export default async function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <PatientLayoutClient userId={session?.user?.id ?? null}>
      {children}
    </PatientLayoutClient>
  )
}

export const dynamic = "force-dynamic"
export const revalidate = 0

import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient"
import { getAdminLayoutUser } from "@/lib/admin-layout-user"

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    session.user.id
  )
  if (!isValidUUID) {
    redirect("/login")
  }

  const user = await getAdminLayoutUser(session.user.id, session)

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
}

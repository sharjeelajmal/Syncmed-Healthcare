import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient"

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  console.log("Admin Layout Session:", JSON.stringify(session, null, 2))
  if (!session?.user?.id) {
    console.log("Redirecting to login: No session or user ID")
    redirect("/login")
  }

  // Robust UUID Validation: Prevent Prisma crashes if a stale or fake ID (e.g., "1") is stuck in the cookie
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id)
  if (!isValidUUID) {
    console.log("Redirecting to login: Invalid UUID:", session.user.id)
    redirect("/login")
  }


  // Fetch fresh user data from DB to ensure image and name are always current
  // after router.refresh()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      image: true,
      role: true
    }
  })

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  )
}

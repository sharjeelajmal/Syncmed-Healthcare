import { redirect } from "next/navigation"
import { auth } from "@/../auth"
import prisma from "@/lib/prisma"

export async function requireSessionUserId(): Promise<string> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    redirect("/login")
  }
  return userId
}

export async function getProviderProfileForSession() {
  const userId = await requireSessionUserId()
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    include: { user: true, availability: { where: { isActive: true }, orderBy: { day: "asc" } } },
  })
  if (!provider) {
    redirect("/login")
  }
  return provider
}

export async function getPatientProfileForSession() {
  const userId = await requireSessionUserId()
  const patient = await prisma.patientProfile.findUnique({
    where: { userId },
    include: { user: true },
  })
  if (!patient) {
    redirect("/login")
  }
  return patient
}

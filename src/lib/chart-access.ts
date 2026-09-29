import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { isProviderLinkedToPatient } from "@/lib/care-team"

export type ChartActor = {
  userId: string
  role: "ADMIN" | "PROVIDER"
  provider: { id: string; providerType: string } | null
}

/** Admins, or providers whose roster includes the patient, may edit the chart. */
export async function getChartActor(patientProfileId: string): Promise<ChartActor | null> {
  const session = await auth()
  const userId = session?.user?.id
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!userId) return null

  if (role === "ADMIN") {
    return { userId, role: "ADMIN", provider: null }
  }

  if (role !== "PROVIDER") return null

  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true, providerType: true },
  })
  if (!provider) return null
  if (!(await isProviderLinkedToPatient(provider.id, patientProfileId))) return null

  return { userId, role: "PROVIDER", provider }
}

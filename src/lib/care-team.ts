import type { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"

/**
 * Single source of truth for "which patients belong to this provider".
 * A patient is in a provider's roster if the provider is on the patient's
 * care team OR has at least one appointment with them. Every provider-facing
 * list, count and access check must use this so tabs stay in sync.
 */
export function providerPatientScope(providerId: string): Prisma.PatientProfileWhereInput {
  return {
    OR: [
      { careTeam: { some: { providerId } } },
      { appointments: { some: { providerId } } },
    ],
  }
}

export async function isProviderLinkedToPatient(providerId: string, patientProfileId: string) {
  const match = await prisma.patientProfile.findFirst({
    where: { AND: [{ id: patientProfileId }, providerPatientScope(providerId)] },
    select: { id: true },
  })
  return Boolean(match)
}

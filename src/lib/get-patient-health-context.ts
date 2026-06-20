import prisma from "@/lib/prisma"
import { auth } from "@/../auth"
import { buildPatientHealthData } from "@/lib/patient-health-data"
import type { PatientHealthData } from "@/types/patient-health"

export async function getPatientHealthContext(): Promise<{
  healthData: PatientHealthData
} | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const patient = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  })

  if (!patient) return null

  const assessments = await prisma.assessment.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: "desc" },
    include: { medications: true, diagnoses: true },
  })

  return {
    healthData: buildPatientHealthData(
      patient.diagnoses,
      patient.activeMedications,
      patient.allergies,
      assessments
    ),
  }
}

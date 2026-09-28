"use server"

import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import {
  buildClinicalRecord,
  ENCOUNTER_WINDOW_AFTER_MS,
  ENCOUNTER_WINDOW_BEFORE_MS,
  type ClinicalRecordView,
} from "@/lib/clinical-record"

const providerInclude = { include: { user: true } } as const

/**
 * Clinical record for one of the signed-in patient's completed appointments:
 * the assessment documented for that visit plus physician notes around it.
 */
export async function getAppointmentClinicalRecordAction(
  appointmentId: string
): Promise<{ success: true; record: ClinicalRecordView } | { success: false; error: string }> {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: "Please sign in again." }

    const appointment = await prisma.appointment.findFirst({
      // Scoped to the session user so patients can only open their own records.
      where: { id: appointmentId, status: "COMPLETED", patient: { userId } },
      include: { provider: providerInclude, patient: { include: { user: true } } },
    })
    if (!appointment) return { success: false, error: "Clinical record not found." }

    const from = new Date(appointment.scheduledAt.getTime() - ENCOUNTER_WINDOW_BEFORE_MS)
    const to = new Date(appointment.scheduledAt.getTime() + ENCOUNTER_WINDOW_AFTER_MS)
    const patientId = appointment.patientId

    const [assessments, physicianNotes] = await Promise.all([
      prisma.assessment.findMany({
        where: { patientId, createdAt: { gte: from, lte: to } },
        include: { provider: providerInclude, medications: true, diagnoses: true },
      }),
      prisma.physicianNote.findMany({
        where: { patientId, noteDate: { gte: from, lte: to } },
        orderBy: { noteDate: "asc" },
        include: { provider: providerInclude },
      }),
    ])

    // Prefer the appointment's own clinician, then whoever is closest in time.
    const distance = (d: Date) => Math.abs(d.getTime() - appointment.scheduledAt.getTime())
    const assessment =
      [...assessments].sort(
        (a, b) =>
          Number(b.providerId === appointment.providerId) - Number(a.providerId === appointment.providerId) ||
          distance(a.createdAt) - distance(b.createdAt)
      )[0] ?? null

    const [clinicalAssessments, earlierAssessments] = assessment
      ? await Promise.all([
          prisma.clinicalAssessment.findMany({
            where: {
              patientId,
              providerId: assessment.providerId,
              createdAt: {
                gte: new Date(assessment.createdAt.getTime() - 15_000),
                lte: new Date(assessment.createdAt.getTime() + 15_000),
              },
            },
          }),
          prisma.assessment.count({ where: { patientId, createdAt: { lt: assessment.createdAt } } }),
        ])
      : [[], 0]

    const record = buildClinicalRecord({
      id: appointment.id,
      date: appointment.scheduledAt,
      patientName: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
      provider: appointment.provider,
      assessment,
      isInitialAssessment: assessment ? earlierAssessments === 0 : false,
      clinicalAssessments,
      physicianNotes,
    })

    return { success: true, record }
  } catch (error) {
    console.error("[APPOINTMENT_RECORD_ERROR]:", error)
    return { success: false, error: "Unable to load the clinical record." }
  }
}

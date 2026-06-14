"use server"

import type { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/../auth"
import {
  buildRiskScoreMap,
  calculateTotalRiskScore,
  deriveRiskLevel,
  type AssessmentRiskLevel,
  type MedicationDosageUnit,
} from "@/lib/assessment-risk-score"
import { getScoredQuestionsForAssessment } from "@/lib/assessment-questions"

const ASSESSMENT_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 20_000,
} as const

export interface AssessmentMedicationInput {
  name: string
  dosage: string
  frequency: string
  dosageAmount?: string
  dosageUnit?: MedicationDosageUnit
}

export interface AssessmentDiagnosisInput {
  name: string
}

export interface SubmitAssessmentPayload {
  patientId: string
  providerId: string
  totalRiskScore: number
  bmi: number
  bmiCategory: string
  bloodPressure: string
  bloodGlucose: string
  assessmentData: Prisma.InputJsonValue
  medications?: AssessmentMedicationInput[]
  diagnoses?: AssessmentDiagnosisInput[]
  signatureUrl?: string
  weightKg?: number
  heightInches?: number
  soapNotes?: string
  followUpDate?: string | Date | null
  revalidatePathname?: string
}

export type SubmitAssessmentResult =
  | { success: true; assessmentId: string; riskLevel: AssessmentRiskLevel }
  | { success: false; error: string }

function parseOptionalDate(input?: string | Date | null): Date | null {
  if (!input) return null
  const next = input instanceof Date ? input : new Date(input)
  return Number.isNaN(next.getTime()) ? null : next
}

function parseNumberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function sanitizeMedicationEntries(
  payloadMeds: AssessmentMedicationInput[] | undefined,
  dataMeds: unknown
): AssessmentMedicationInput[] {
  const source = Array.isArray(payloadMeds)
    ? payloadMeds
    : Array.isArray(dataMeds)
      ? dataMeds
      : []

  return source
    .map((entry) => {
      const value =
        typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : {}
      const dosageAmount = String(value.dosageAmount ?? "").trim()
      const dosageUnit = String(value.dosageUnit ?? "").trim()
      const combinedDosage =
        String(value.dosage ?? "").trim() ||
        (dosageAmount ? `${dosageAmount}${dosageUnit ? ` ${dosageUnit}` : ""}` : "")

      return {
        name: String(value.name ?? "").trim(),
        dosage: combinedDosage,
        frequency: String(value.frequency ?? "").trim(),
        dosageAmount: dosageAmount || undefined,
        dosageUnit: (dosageUnit || undefined) as MedicationDosageUnit | undefined,
      }
    })
    .filter((entry) => entry.name && entry.dosage && entry.frequency)
}

function resolveAssessmentRiskScore(
  assessmentData: Record<string, unknown>,
  submittedScore: number
): number {
  const responses =
    typeof assessmentData.responses === "object" && assessmentData.responses !== null
      ? (assessmentData.responses as Record<string, string | string[]>)
      : {}
  const bmiVitals =
    typeof assessmentData.bmiVitals === "object" && assessmentData.bmiVitals !== null
      ? (assessmentData.bmiVitals as Record<string, unknown>)
      : {}
  const isFirstTimeAssessment = assessmentData.isFirstTimeAssessment !== false
  const allQuestions = getScoredQuestionsForAssessment(isFirstTimeAssessment)

  const calculatedScore = calculateTotalRiskScore({
    answers: responses,
    riskScoreMap: buildRiskScoreMap(allQuestions),
    vitals: {
      bloodPressure: String(bmiVitals.bloodPressure ?? ""),
      bloodGlucose: String(bmiVitals.bloodGlucose ?? ""),
      temperatureCelsius: String(bmiVitals.temperatureCelsius ?? ""),
      respiration: String(bmiVitals.respiration ?? ""),
      painScale: String(bmiVitals.painScale ?? "0"),
      oxygenSaturation: String(bmiVitals.oxygenSaturation ?? ""),
      calculatedBmi: Number(bmiVitals.calculatedBmi ?? 0),
    },
  })

  if (calculatedScore !== submittedScore) {
    return calculatedScore
  }

  return submittedScore
}

export async function getPatientPreviousAssessmentCount(patientId: string): Promise<number> {
  if (!patientId.trim()) {
    return 0
  }

  return prisma.assessment.count({
    where: { patientId: patientId.trim() },
  })
}

function sanitizeDiagnosisEntries(
  payloadDiagnoses: AssessmentDiagnosisInput[] | undefined,
  dataDiagnoses: unknown
): AssessmentDiagnosisInput[] {
  const source = Array.isArray(payloadDiagnoses)
    ? payloadDiagnoses
    : Array.isArray(dataDiagnoses)
      ? dataDiagnoses
      : []

  return source
    .map((entry) => {
      const value =
        typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : null
      return {
        name: String(value?.name ?? entry ?? "").trim(),
      }
    })
    .filter((entry) => entry.name)
}

function validateSubmitAssessmentPayload(payload: SubmitAssessmentPayload): void {
  if (!payload.patientId.trim()) {
    throw new Error("patientId is required")
  }

  if (!payload.providerId.trim()) {
    throw new Error("providerId is required")
  }

  if (!Number.isInteger(payload.totalRiskScore) || payload.totalRiskScore < 0) {
    throw new Error("totalRiskScore must be a non-negative integer")
  }

  if (!Number.isFinite(payload.bmi) || payload.bmi <= 0) {
    throw new Error("bmi must be a positive number")
  }

  if (!payload.bmiCategory.trim()) {
    throw new Error("bmiCategory is required")
  }

  if (!payload.bloodPressure.trim()) {
    throw new Error("bloodPressure is required")
  }

  if (!payload.bloodGlucose.trim()) {
    throw new Error("bloodGlucose is required")
  }

  if (payload.assessmentData === null || payload.assessmentData === undefined) {
    throw new Error("assessmentData is required")
  }
}

async function assertAssessmentAccess(patientId: string, providerId: string) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const sessionUserId = session?.user?.id

  if (!sessionUserId || !role) {
    throw new Error("Unauthorized")
  }

  if (role === "ADMIN") {
    return
  }

  if (role !== "PROVIDER") {
    throw new Error("Unauthorized")
  }

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: sessionUserId },
    select: { id: true },
  })

  if (!provider || provider.id !== providerId) {
    throw new Error("Forbidden provider access")
  }

  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    select: {
      assignedProviderId: true,
      appointments: {
        where: { providerId: provider.id },
        select: { id: true },
        take: 1,
      },
    },
  })

  const isAssignedProvider = patient?.assignedProviderId === provider.id
  const hasProviderAppointment = Boolean(patient?.appointments?.length)

  if (!patient || (!isAssignedProvider && !hasProviderAppointment)) {
    throw new Error("Provider is not assigned to this patient")
  }
}

export async function submitAssessment(
  payload: SubmitAssessmentPayload
): Promise<SubmitAssessmentResult> {
  try {
    validateSubmitAssessmentPayload(payload)

    const patientId = payload.patientId.trim()
    const providerId = payload.providerId.trim()
    await assertAssessmentAccess(patientId, providerId)

    const assessmentData =
      typeof payload.assessmentData === "object" && payload.assessmentData !== null
        ? (payload.assessmentData as Record<string, unknown>)
        : {}
    const assessmentBmiVitals =
      typeof assessmentData?.bmiVitals === "object" && assessmentData.bmiVitals !== null
        ? (assessmentData.bmiVitals as Record<string, unknown>)
        : {}
    const assessmentSummary =
      typeof assessmentData?.summary === "object" && assessmentData.summary !== null
        ? (assessmentData.summary as Record<string, unknown>)
        : {}
    const assessmentSignatures =
      typeof assessmentData?.signatures === "object" && assessmentData.signatures !== null
        ? (assessmentData.signatures as Record<string, unknown>)
        : {}

    const weightKg =
      parseNumberValue(payload.weightKg) ??
      parseNumberValue(assessmentBmiVitals?.weightKg) ??
      null
    const heightInches =
      parseNumberValue(payload.heightInches) ??
      parseNumberValue(assessmentBmiVitals?.heightInches) ??
      (() => {
        const heightCm = parseNumberValue(assessmentBmiVitals?.heightCm)
        if (!heightCm) return null
        return Number((heightCm / 2.54).toFixed(2))
      })()

    const signatureUrl =
      payload.signatureUrl?.trim() ||
      String(assessmentSignatures?.assessorSignature ?? "").trim() ||
      null
    const soapNotes =
      payload.soapNotes?.trim() ||
      String(assessmentSummary?.q98OverallAssessmentSummary ?? "").trim() ||
      null
    const followUpDate = parseOptionalDate(payload.followUpDate)

    const medications = sanitizeMedicationEntries(payload.medications, assessmentData?.medications)
    const diagnoses = sanitizeDiagnosisEntries(payload.diagnoses, assessmentData?.diagnoses)
    const totalRiskScore = resolveAssessmentRiskScore(assessmentData, payload.totalRiskScore)
    const riskLevel = deriveRiskLevel(totalRiskScore)

    const assessment = await prisma.$transaction(async (tx) => {
      const createdAssessment = await tx.assessment.create({
        data: {
          patientId,
          providerId,
          type: "COMPLEX",
          data: payload.assessmentData,
          patientSignatureUrl: signatureUrl,
          signatureUrl,
          weightKg,
          heightInches,
          soapNotes,
          followUpDate,
        },
      })

      if (medications.length > 0) {
        await tx.medication.createMany({
          data: medications.map((item) => ({
            assessmentId: createdAssessment.id,
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
          })),
        })
      }

      if (diagnoses.length > 0) {
        await tx.diagnosis.createMany({
          data: diagnoses.map((item) => ({
            assessmentId: createdAssessment.id,
            name: item.name,
          })),
        })
      }

      await tx.clinicalAssessment.create({
        data: {
          patientId,
          providerId,
          totalRiskScore,
          riskLevel,
          bmi: payload.bmi,
          bmiCategory: payload.bmiCategory.trim(),
          bloodPressure: payload.bloodPressure.trim(),
          bloodGlucose: payload.bloodGlucose.trim(),
          assessmentData: payload.assessmentData,
        },
      })

      return createdAssessment
    }, ASSESSMENT_TRANSACTION_OPTIONS)

    revalidatePath(payload.revalidatePathname ?? `/provider/patients/${patientId}`)

    return {
      success: true,
      assessmentId: assessment.id,
      riskLevel,
    }
  } catch (error) {
    console.error("[SUBMIT_ASSESSMENT_ERROR]:", error)
    return {
      success: false,
      error: "Unable to submit assessment at this time.",
    }
  }
}

export async function createAssessmentAction(
  patientId: string, 
  providerId: string, 
  data: Prisma.InputJsonValue, 
  signatureBase64?: string,
  additionalCharges: number = 0
) {
  try {
    await assertAssessmentAccess(patientId, providerId)

    const dataObject =
      typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {}

    const medications = sanitizeMedicationEntries(undefined, dataObject?.medications)
    const diagnoses = sanitizeDiagnosisEntries(undefined, dataObject?.diagnoses)
    const bmiVitals =
      typeof dataObject?.bmiVitals === "object" && dataObject.bmiVitals !== null
        ? (dataObject.bmiVitals as Record<string, unknown>)
        : {}
    const summary =
      typeof dataObject?.summary === "object" && dataObject.summary !== null
        ? (dataObject.summary as Record<string, unknown>)
        : {}
    const weightKg = parseNumberValue(dataObject?.weightKg) ?? parseNumberValue(bmiVitals?.weightKg)
    const heightInches =
      parseNumberValue(dataObject?.heightInches) ??
      parseNumberValue(bmiVitals?.heightInches) ??
      (() => {
        const heightCm = parseNumberValue(bmiVitals?.heightCm)
        if (!heightCm) return null
        return Number((heightCm / 2.54).toFixed(2))
      })()
    const soapNotes =
      String(dataObject?.soapNotes ?? "").trim() ||
      String(summary?.q98OverallAssessmentSummary ?? "").trim() ||
      null
    const followUpDate = parseOptionalDate(
      (typeof dataObject?.followUpDate === "string" || dataObject?.followUpDate instanceof Date
        ? dataObject.followUpDate
        : null) as string | Date | null
    )
    const signatureUrl = signatureBase64 || String(dataObject?.signatureUrl ?? "").trim() || null

    // 1. Create the assessment record in Prisma with normalized relations
    await prisma.$transaction(async (tx) => {
      const created = await tx.assessment.create({
        data: {
          patientId,
          providerId,
          type: "COMPLEX",
          data,
          patientSignatureUrl: signatureUrl,
          signatureUrl,
          weightKg,
          heightInches,
          soapNotes,
          followUpDate,
        },
      })

      if (medications.length > 0) {
        await tx.medication.createMany({
          data: medications.map((item) => ({
            assessmentId: created.id,
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
          })),
        })
      }

      if (diagnoses.length > 0) {
        await tx.diagnosis.createMany({
          data: diagnoses.map((item) => ({
            assessmentId: created.id,
            name: item.name,
          })),
        })
      }

      return created
    }, ASSESSMENT_TRANSACTION_OPTIONS)

    // 2. Find the active appointment for this patient/provider to update the billing amount
    // We look for a PENDING or SCHEDULED appointment for today
    const now = new Date()
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    const endOfDay = new Date(now.setHours(23, 59, 59, 999))

    const activeAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        providerId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { in: ["PENDING", "SCHEDULED", "CONFIRMED"] }
      }
    })

    if (activeAppointment) {
      await prisma.appointment.update({
        where: { id: activeAppointment.id },
        data: {
          status: "COMPLETED" // Mark as completed when assessment is done
        }
      })
    }

    // 3. Automate Secondary Invoices: If additionalCharges > 0, create a brand new PaymentInvoice
    if (additionalCharges > 0) {
      await prisma.paymentInvoice.create({
        data: {
          patientId,
          amount: additionalCharges,
          status: "PENDING", // Maps to UNPAID/Outstanding
        }
      })
    }


    // 4. Revalidate paths
    revalidatePath(`/provider/patients/${patientId}`)
    revalidatePath("/provider/dashboard")
    
  } catch (err: unknown) {
    if ((err as { message?: string })?.message === "NEXT_REDIRECT") throw err; // Next.js redirect special error
    console.error("[CRITICAL_CLINICAL_ERROR]:", err)
    return { error: "Failed to finalize assessment. Please check system integrity." }
  }

  // 3. Redirect back to Patient EMR
  redirect(`/provider/patients/${patientId}`)
}

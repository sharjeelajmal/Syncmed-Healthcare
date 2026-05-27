"use server"

import type { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type AssessmentRiskLevel = "LOW" | "MODERATE" | "HIGH"

export interface SubmitAssessmentPayload {
  patientId: string
  providerId: string
  totalRiskScore: number
  bmi: number
  bmiCategory: string
  bloodPressure: string
  bloodGlucose: string
  assessmentData: Prisma.InputJsonValue
  revalidatePathname?: string
}

export type SubmitAssessmentResult =
  | { success: true; assessmentId: string; riskLevel: AssessmentRiskLevel }
  | { success: false; error: string }

function deriveRiskLevel(totalRiskScore: number): AssessmentRiskLevel {
  if (totalRiskScore <= 20) {
    return "LOW"
  }

  if (totalRiskScore <= 45) {
    return "MODERATE"
  }

  return "HIGH"
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

export async function submitAssessment(
  payload: SubmitAssessmentPayload
): Promise<SubmitAssessmentResult> {
  try {
    validateSubmitAssessmentPayload(payload)

    const riskLevel = deriveRiskLevel(payload.totalRiskScore)

    const assessment = await prisma.clinicalAssessment.create({
      data: {
        patientId: payload.patientId.trim(),
        providerId: payload.providerId.trim(),
        totalRiskScore: payload.totalRiskScore,
        riskLevel,
        bmi: payload.bmi,
        bmiCategory: payload.bmiCategory.trim(),
        bloodPressure: payload.bloodPressure.trim(),
        bloodGlucose: payload.bloodGlucose.trim(),
        assessmentData: payload.assessmentData,
      },
    })

    revalidatePath(payload.revalidatePathname ?? `/provider/patients/${payload.patientId}`)

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
  data: any, 
  signatureBase64?: string,
  additionalCharges: number = 0
) {
  try {
    // 1. Create the assessment record in Prisma with signature
    const assessment = await prisma.assessment.create({
      data: {
        patientId,
        providerId,
        type: "COMPLEX", // Standard clinical assessment
        data: data, // Store vitals and notes as JSON
        patientSignatureUrl: signatureBase64 || null,
      }
    })

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


    // 2. Revalidate paths
    revalidatePath(`/provider/patients/${patientId}`)
    revalidatePath("/provider/dashboard")
    
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") throw err; // Next.js redirect special error
    console.error("[CRITICAL_CLINICAL_ERROR]:", err)
    return { error: "Failed to finalize assessment. Please check system integrity." }
  }

  // 3. Redirect back to Patient EMR
  redirect(`/provider/patients/${patientId}`)
}

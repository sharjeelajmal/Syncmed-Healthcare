"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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

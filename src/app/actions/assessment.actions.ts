"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createAssessmentAction(patientId: string, providerId: string, data: any, signatureBase64?: string) {
  try {
    // 1. Create the assessment record in Prisma with signature
    await prisma.assessment.create({
      data: {
        patientId,
        providerId,
        type: "COMPLEX", // Standard clinical assessment
        data: data, // Store vitals and notes as JSON
        patientSignatureUrl: signatureBase64 || null,
      }
    })

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

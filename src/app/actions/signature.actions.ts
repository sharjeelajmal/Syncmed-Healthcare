"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveSignatureAction(assessmentId: string, patientId: string, signatureBase64: string) {
  try {
    // 1. Update the assessment with the signature
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        patientSignatureUrl: signatureBase64,
        // Optional: Update status if you have a status field
      }
    })

    // 2. Revalidate the patient chart
    revalidatePath(`/provider/patients/${patientId}`)
    revalidatePath("/provider/dashboard")

    return { success: true }
  } catch (err: any) {
    console.error("[SIGNATURE_ERROR]:", err)
    return { error: "Failed to process e-signature. Please try again." }
  }
}

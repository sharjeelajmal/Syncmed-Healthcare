"use server"

import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadReceiptAction(appointmentId: string, formData: FormData) {
  try {
    const file = formData.get('file') as File | null
    if (!file) {
      throw new Error("No file provided in form data")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use a Promise to properly wait for the Cloudinary stream upload
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'patient_receipts',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    const secureUrl = (uploadResult as any).secure_url

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        receiptData: secureUrl,
        paymentStatus: "VERIFICATION_PENDING",
      },
    })

    try {
      await pusherServer.trigger("admin-alerts", "new-activity", {
        title: "Payment Received",
        message:
          "A patient has submitted a payment receipt for verification.",
        url: "/admin/appointments",
      })
    } catch (pusherError) {
      console.error("[PUSHER_ADMIN_ALERT]:", pusherError)
    }

    revalidatePath("/patient/billing")
    revalidatePath("/admin/appointments")
    revalidatePath("/patient", "layout")
    return { success: true, url: secureUrl }
  } catch (error: any) {
    console.error("Upload Error:", error)
    return { success: false, error: error.message || "Failed to upload receipt" }
  }
}

export async function verifyReceiptAction(appointmentId: string, status: 'PAID' | 'UNPAID') {
  try {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: status,
        ...(status === 'UNPAID' && { receiptData: null })
      },
    })

    revalidatePath('/admin/appointments')
    revalidatePath('/patient/billing')
    revalidatePath('/patient', 'layout')
    
    return { success: true }
  } catch (error: any) {
    console.error("Verification Error:", error)
    return { success: false, error: error.message || "Failed to verify receipt" }
  }
}

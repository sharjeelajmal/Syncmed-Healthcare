"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import { sendLeadNotificationEmail, sendLeadConfirmationEmail } from "@/lib/mail"
import { revalidatePath } from "next/cache"
import { CAREER_ROLES } from "@/lib/lead-types"

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional().nullable(),
  type: z.enum(["general", "patient_registration"]),
  message: z.string().min(1, "Message is required").max(1000),
})

const StatusSchema = z.enum(["PENDING", "CONVERTED", "DISMISSED"])

export async function submitLeadAction(data: {
  name: string
  email: string
  phone?: string | null
  type: string
  message: string
}) {
  try {
    const validatedData = LeadSchema.parse(data)

    const lead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        type: validatedData.type,
        message: validatedData.message,
        status: "PENDING",
      },
    })

    // Securely trigger email notification to Admin without exposing raw error details to client
    await sendLeadNotificationEmail({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      type: lead.type,
      message: lead.message,
    })

    // Securely send confirmation receipt email to user/prospect
    await sendLeadConfirmationEmail({
      name: lead.name,
      email: lead.email,
      type: lead.type,
    })

    revalidatePath("/admin/leads")
    return { success: true, message: "Your message has been securely sent. Our team will contact you shortly." }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    // Generic clinical error log on server, secure message to client
    console.error("Database lead creation error:", error)
    return { success: false, error: "Unable to process inquiry. Please check your inputs and try again." }
  }
}

const CareerApplicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(5, "Phone number is required").max(20),
  role: z.enum(CAREER_ROLES, { message: "Please select a role" }),
  experience: z.string().trim().min(1, "Experience is required").max(50),
  note: z.string().trim().max(1500).optional(),
})

// Public endpoint: keep uploads small and PDF-only.
const MAX_CV_BYTES = 5 * 1024 * 1024

async function uploadCv(file: File): Promise<string | { error: string }> {
  if (file.size > MAX_CV_BYTES) return { error: "CV must be 5 MB or smaller." }
  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { error: "CV must be a PDF file." }
  }

  const { v2: cloudinary } = await import("cloudinary")
  const { randomUUID } = await import("node:crypto")
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "career_applications", resource_type: "raw", public_id: `${randomUUID()}.pdf` },
      (error, res) => (error || !res ? reject(error ?? new Error("Empty upload result")) : resolve(res))
    )
    stream.end(buffer)
  })
  return result.secure_url
}

/** Careers page submission. Stored as a Lead so it shows in the admin Leads inbox. */
export async function submitCareerApplicationAction(formData: FormData) {
  try {
    // Honeypot: real users never see or fill this field.
    if (String(formData.get("website") ?? "").trim()) {
      return { success: true, message: "Application received." }
    }

    const parsed = CareerApplicationSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      experience: formData.get("experience"),
      note: formData.get("note") || undefined,
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    const cv = formData.get("cv")
    let cvUrl: string | null = null
    if (cv instanceof File && cv.size > 0) {
      const uploaded = await uploadCv(cv)
      if (typeof uploaded !== "string") return { success: false, error: uploaded.error }
      cvUrl = uploaded
    }

    if (!cvUrl && !data.note) {
      return { success: false, error: "Please attach your CV or describe your background." }
    }

    const message = [
      `Role: ${data.role}`,
      `Experience: ${data.experience}`,
      `CV: ${cvUrl ?? "Not attached"}`,
      data.note ? `\n${data.note}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: "career_application",
        message,
        status: "PENDING",
      },
    })

    await sendLeadNotificationEmail({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      type: lead.type,
      message: lead.message,
    })
    await sendLeadConfirmationEmail({ name: lead.name, email: lead.email, type: lead.type })

    revalidatePath("/admin/leads")
    return { success: true, message: "Thank you! Your application has been received. Our team will be in touch." }
  } catch (error) {
    console.error("Career application error:", error)
    return { success: false, error: "Unable to submit your application. Please try again." }
  }
}

export async function getLeadsAction() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return { success: true, data: leads }
  } catch (error) {
    console.error("Fetch leads database error:", error)
    return { success: false, error: "Failed to retrieve inquiries." }
  }
}

export async function updateLeadStatusAction(id: string, status: string) {
  try {
    const validatedStatus = StatusSchema.parse(status)
    
    await prisma.lead.update({
      where: { id },
      data: { status: validatedStatus },
    })

    revalidatePath("/admin/leads")
    return { success: true, message: `Lead status updated to ${status}.` }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid status state transition." }
    }
    console.error("Update lead status database error:", error)
    return { success: false, error: "Failed to update lead status." }
  }
}

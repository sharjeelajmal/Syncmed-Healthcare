"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import { sendLeadNotificationEmail, sendLeadConfirmationEmail } from "@/lib/mail"
import { revalidatePath } from "next/cache"

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

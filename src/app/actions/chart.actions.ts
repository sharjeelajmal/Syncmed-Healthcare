"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { isProviderLinkedToPatient } from "@/lib/care-team"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Server actions accept up to 10mb (next.config); leave room for the other fields.
const MAX_LAB_FILE_BYTES = 9 * 1024 * 1024

type ActionResult = { success: true } | { success: false; error: string }

type ChartActor = {
  userId: string
  role: "ADMIN" | "PROVIDER"
  provider: { id: string; providerType: string } | null
}

/** Admins, or providers whose roster includes the patient, may edit the chart. */
async function getChartActor(patientProfileId: string): Promise<ChartActor | null> {
  const session = await auth()
  const userId = session?.user?.id
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!userId) return null

  if (role === "ADMIN") {
    return { userId, role: "ADMIN", provider: null }
  }

  if (role !== "PROVIDER") return null

  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true, providerType: true },
  })
  if (!provider) return null
  if (!(await isProviderLinkedToPatient(provider.id, patientProfileId))) return null

  return { userId, role: "PROVIDER", provider }
}

function revalidateChart(patientProfileId: string) {
  revalidatePath(`/provider/patients/${patientProfileId}`)
}

function parseDateTime(value: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export interface PhysicianNoteInput {
  patientId: string
  /** ISO timestamp of the encounter (date + time). */
  noteDate: string
  chiefComplaint?: string
  assessment: string
  plan?: string
}

export async function createPhysicianNoteAction(input: PhysicianNoteInput): Promise<ActionResult> {
  try {
    const actor = await getChartActor(input.patientId)
    if (!actor?.provider) {
      return { success: false, error: "You do not have access to this patient." }
    }
    if (actor.provider.providerType !== "MEDICAL_DOCTOR") {
      return { success: false, error: "Only physicians can write physician notes." }
    }

    const assessment = input.assessment.trim()
    if (!assessment) {
      return { success: false, error: "Note / impression is required." }
    }

    const noteDate = parseDateTime(input.noteDate)
    if (!noteDate) {
      return { success: false, error: "Please enter a valid encounter date and time." }
    }

    await prisma.physicianNote.create({
      data: {
        patientId: input.patientId,
        providerId: actor.provider.id,
        noteDate,
        chiefComplaint: input.chiefComplaint?.trim() || null,
        assessment,
        plan: input.plan?.trim() || null,
      },
    })

    revalidateChart(input.patientId)
    return { success: true }
  } catch (error) {
    console.error("[CREATE_PHYSICIAN_NOTE_ERROR]:", error)
    return { success: false, error: "Unable to save the physician note." }
  }
}

export async function addDiagnosisAction(patientId: string, diagnosis: string): Promise<ActionResult> {
  try {
    const actor = await getChartActor(patientId)
    if (!actor) {
      return { success: false, error: "You do not have access to this patient." }
    }

    const name = diagnosis.trim()
    if (!name) {
      return { success: false, error: "Diagnosis is required." }
    }
    if (name.length > 200) {
      return { success: false, error: "Diagnosis must be 200 characters or fewer." }
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      select: { diagnoses: true },
    })
    if (!patient) {
      return { success: false, error: "Patient not found." }
    }

    if (patient.diagnoses.some((d) => d.toLowerCase() === name.toLowerCase())) {
      return { success: false, error: "This diagnosis is already on the chart." }
    }

    await prisma.patientProfile.update({
      where: { id: patientId },
      data: { diagnoses: { push: name } },
    })

    revalidateChart(patientId)
    return { success: true }
  } catch (error) {
    console.error("[ADD_DIAGNOSIS_ERROR]:", error)
    return { success: false, error: "Unable to add the diagnosis." }
  }
}

export async function uploadLabResultAction(formData: FormData): Promise<ActionResult> {
  try {
    const patientId = String(formData.get("patientId") ?? "")
    const title = String(formData.get("title") ?? "").trim()
    const notes = String(formData.get("notes") ?? "").trim()
    const file = formData.get("file")

    const actor = await getChartActor(patientId)
    if (!actor) {
      return { success: false, error: "You do not have access to this patient." }
    }
    if (!title) {
      return { success: false, error: "Title is required." }
    }
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Please choose a PDF file." }
    }
    if (file.size > MAX_LAB_FILE_BYTES) {
      return { success: false, error: "PDF must be 9 MB or smaller." }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // Check the file signature, not just the extension/MIME the browser reports.
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return { success: false, error: "Only PDF files can be uploaded." }
    }

    // "raw" keeps the PDF as-is; Cloudinary's image pipeline blocks PDF delivery on many plans.
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "lab_results",
          resource_type: "raw",
          // Raw public IDs keep their extension, so the URL opens as a PDF.
          public_id: `${randomUUID()}.pdf`,
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Empty upload result"))
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    await prisma.labResult.create({
      data: {
        patientId,
        uploadedById: actor.userId,
        title,
        fileUrl: uploadResult.secure_url,
        notes: notes || null,
      },
    })

    revalidateChart(patientId)
    return { success: true }
  } catch (error) {
    console.error("[UPLOAD_LAB_RESULT_ERROR]:", error)
    return { success: false, error: "Unable to upload the lab result." }
  }
}

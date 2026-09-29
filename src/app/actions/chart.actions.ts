"use server"

import { refresh, revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getChartActor } from "@/lib/chart-access"
import { deleteRawFile, rawPublicIdFromUrl } from "@/lib/cloudinary-files"

type ActionResult = { success: true } | { success: false; error: string }

function revalidateChart(patientProfileId: string) {
  revalidatePath(`/provider/patients/${patientProfileId}`)
  revalidatePath("/patient/records")
  // Re-render whatever chart URL the clinician is on (profile or user id).
  refresh()
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

/**
 * Deletes a lab result and its PDF. Allowed for admins and for the clinician
 * who uploaded it, so one provider can't remove another's clinical record.
 */
export async function deleteLabResultAction(labResultId: string): Promise<ActionResult> {
  try {
    const lab = await prisma.labResult.findUnique({
      where: { id: labResultId },
      select: { id: true, patientId: true, uploadedById: true, fileUrl: true },
    })
    if (!lab) {
      return { success: false, error: "This lab result no longer exists." }
    }

    const actor = await getChartActor(lab.patientId)
    if (!actor) {
      return { success: false, error: "You do not have access to this patient." }
    }
    if (actor.role !== "ADMIN" && lab.uploadedById !== actor.userId) {
      return { success: false, error: "Only the clinician who uploaded this file or an admin can delete it." }
    }

    await prisma.labResult.delete({ where: { id: lab.id } })

    // The record is already gone for users; a leftover file is only logged.
    const publicId = rawPublicIdFromUrl(lab.fileUrl, "lab_results")
    if (publicId && !(await deleteRawFile(publicId))) {
      console.warn(`[DELETE_LAB_RESULT] Cloudinary file not removed: ${publicId}`)
    }

    revalidateChart(lab.patientId)
    return { success: true }
  } catch (error) {
    console.error("[DELETE_LAB_RESULT_ERROR]:", error)
    return { success: false, error: "Unable to delete the lab result." }
  }
}

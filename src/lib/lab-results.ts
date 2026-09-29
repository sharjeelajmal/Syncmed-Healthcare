// Server-side only (Prisma + Cloudinary secrets).
import prisma from "@/lib/prisma"
import type { ChartActor } from "@/lib/chart-access"
import { uploadRawPdf } from "@/lib/cloudinary-files"
import { formatProviderDisplayName } from "@/lib/format-provider-name"

/** Kept under the 10 MB request limit so the other form fields still fit. */
export const MAX_LAB_FILE_BYTES = 9 * 1024 * 1024

export interface LabResultView {
  id: string
  title: string
  /** Access-checked route; raw Cloudinary PDF links are blocked. */
  fileUrl: string
  notes: string | null
  createdAt: string
  uploadedByName: string
  /** The uploader or an admin (enforced again in deleteLabResultAction). */
  canDelete: boolean
}

export type LabUploadResult =
  | { success: true; lab: LabResultView }
  | { success: false; error: string; status: number }

/** Validates, stores the PDF on Cloudinary and records it on the patient's chart. */
export async function createLabResult(
  actor: ChartActor,
  input: { patientId: string; title: string; notes: string; file: FormDataEntryValue | null }
): Promise<LabUploadResult> {
  const title = input.title.trim()
  if (!title) return { success: false, error: "Title is required.", status: 400 }
  if (title.length > 200) return { success: false, error: "Title must be 200 characters or fewer.", status: 400 }

  const { file } = input
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please choose a PDF file.", status: 400 }
  }
  if (file.size > MAX_LAB_FILE_BYTES) {
    return { success: false, error: "PDF must be 9 MB or smaller.", status: 413 }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  // Check the file signature, not just the extension/MIME the browser reports.
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { success: false, error: "Only PDF files can be uploaded.", status: 415 }
  }

  const fileUrl = await uploadRawPdf(buffer, "lab_results")

  const lab = await prisma.labResult.create({
    data: {
      patientId: input.patientId,
      uploadedById: actor.userId,
      title,
      fileUrl,
      notes: input.notes.trim() || null,
    },
    include: {
      uploadedBy: { select: { firstName: true, lastName: true, providerProfile: { select: { providerType: true } } } },
    },
  })

  return {
    success: true,
    lab: {
      id: lab.id,
      title: lab.title,
      fileUrl: `/api/lab-results/${lab.id}`,
      notes: lab.notes,
      createdAt: lab.createdAt.toISOString(),
      uploadedByName: lab.uploadedBy.providerProfile
        ? formatProviderDisplayName({ providerType: lab.uploadedBy.providerProfile.providerType, user: lab.uploadedBy })
        : `${lab.uploadedBy.firstName} ${lab.uploadedBy.lastName}`,
      canDelete: true,
    },
  }
}

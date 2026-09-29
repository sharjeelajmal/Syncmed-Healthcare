import { NextResponse, type NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { getChartActor } from "@/lib/chart-access"
import { createLabResult, MAX_LAB_FILE_BYTES } from "@/lib/lab-results"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "private, no-store" }
// File plus the text fields and multipart overhead.
const MAX_BODY_BYTES = MAX_LAB_FILE_BYTES + 256 * 1024

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE })
}

/**
 * Lab result upload. A route handler (not a server action) so the browser can
 * report real upload progress via XMLHttpRequest.
 */
export async function POST(request: NextRequest) {
  // Server actions check Origin automatically; route handlers must do it themselves.
  const origin = request.headers.get("origin")
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  if (!origin || !host || new URL(origin).host !== host) {
    return fail("Invalid request origin.", 403)
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return fail("PDF must be 9 MB or smaller.", 413)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    // Also reached when the user cancels mid-upload.
    return fail("The upload was interrupted. Please try again.", 400)
  }

  const patientId = String(formData.get("patientId") ?? "")
  const actor = patientId ? await getChartActor(patientId) : null
  if (!actor) {
    return fail("You do not have access to this patient.", 403)
  }

  try {
    const result = await createLabResult(actor, {
      patientId,
      title: String(formData.get("title") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      file: formData.get("file"),
    })
    if (!result.success) return fail(result.error, result.status)

    revalidatePath(`/provider/patients/${patientId}`)
    revalidatePath("/patient/records")
    return NextResponse.json({ success: true, lab: result.lab }, { status: 201, headers: NO_STORE })
  } catch (error) {
    console.error("[UPLOAD_LAB_RESULT_ERROR]:", error)
    return fail("Unable to upload the lab result. Please try again.", 500)
  }
}

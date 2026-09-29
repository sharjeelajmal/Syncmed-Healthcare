import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { isProviderLinkedToPatient } from "@/lib/care-team"
import { rawPublicIdFromUrl, signedRawFileUrl } from "@/lib/cloudinary-files"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "private, no-store" }

/**
 * Opens a lab result PDF. Only the patient, an admin, or a provider with
 * access to the patient may open it; they are redirected to a short-lived
 * signed Cloudinary link, so the file itself is never publicly reachable.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/lab-results/[id]">) {
  const { id } = await ctx.params
  const session = await auth()
  const userId = session?.user?.id
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!userId || !role) {
    return NextResponse.json({ error: "Please sign in to view this file." }, { status: 401, headers: NO_STORE })
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const lab = isUuid
    ? await prisma.labResult.findUnique({
        where: { id },
        select: { fileUrl: true, patientId: true, patient: { select: { userId: true } } },
      })
    : null
  if (!lab) {
    return NextResponse.json({ error: "Lab result not found." }, { status: 404, headers: NO_STORE })
  }

  let allowed = role === "ADMIN" || lab.patient.userId === userId
  if (!allowed && role === "PROVIDER") {
    const provider = await prisma.providerProfile.findUnique({ where: { userId }, select: { id: true } })
    allowed = Boolean(provider && (await isProviderLinkedToPatient(provider.id, lab.patientId)))
  }
  if (!allowed) {
    // Same response as "not found" so IDs can't be probed.
    return NextResponse.json({ error: "Lab result not found." }, { status: 404, headers: NO_STORE })
  }

  const publicId = rawPublicIdFromUrl(lab.fileUrl, "lab_results")
  if (!publicId) {
    return NextResponse.json({ error: "This file is unavailable." }, { status: 404, headers: NO_STORE })
  }

  return NextResponse.redirect(signedRawFileUrl(publicId), { status: 302, headers: NO_STORE })
}

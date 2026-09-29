import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { rawPublicIdFromUrl, signedRawFileUrl } from "@/lib/cloudinary-files"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "private, no-store" }

/** Admin-only: opens the CV attached to a career application lead. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/leads/[id]/cv">) {
  const { id } = await ctx.params
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: NO_STORE })
  }

  const lead = await prisma.lead.findUnique({ where: { id }, select: { type: true, message: true } })
  const cvUrl = lead?.type === "career_application" ? lead.message.match(/^CV: (https:\/\/\S+)$/m)?.[1] : undefined
  const publicId = cvUrl ? rawPublicIdFromUrl(cvUrl, "career_applications") : null
  if (!publicId) {
    return NextResponse.json({ error: "CV not found." }, { status: 404, headers: NO_STORE })
  }

  return NextResponse.redirect(signedRawFileUrl(publicId), { status: 302, headers: NO_STORE })
}

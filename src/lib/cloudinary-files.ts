// Server-side only: reads CLOUDINARY_API_SECRET. Never import from a client component.
import { randomUUID } from "node:crypto"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/** How long a signed file link stays valid after an authorised request. */
const SIGNED_URL_TTL_SECONDS = 5 * 60

/**
 * Extracts the public ID from one of our Cloudinary "raw" delivery URLs, e.g.
 * https://res.cloudinary.com/<cloud>/raw/upload/v123/lab_results/<uuid>.pdf
 * → "lab_results/<uuid>.pdf". Returns null for anything else so callers never
 * sign a URL for a file outside the expected folder.
 */
export function rawPublicIdFromUrl(fileUrl: string, folder: string): string | null {
  let url: URL
  try {
    url = new URL(fileUrl)
  } catch {
    return null
  }
  if (url.hostname !== "res.cloudinary.com") return null

  const match = url.pathname.match(/^\/([^/]+)\/raw\/upload\/(?:v\d+\/)?(.+)$/)
  if (!match || match[1] !== process.env.CLOUDINARY_CLOUD_NAME) return null

  const publicId = decodeURIComponent(match[2])
  if (!publicId.startsWith(`${folder}/`) || publicId.includes("..")) return null
  return publicId
}

/**
 * Uploads a PDF as a "raw" asset (kept byte-for-byte). Raw public IDs keep
 * their extension, so the stored URL ends in .pdf. Returns the delivery URL.
 */
export async function uploadRawPdf(buffer: Buffer, folder: string): Promise<string> {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw", public_id: `${randomUUID()}.pdf` },
      (error, res) => (error || !res ? reject(error ?? new Error("Empty upload result")) : resolve(res))
    )
    stream.end(buffer)
  })
  return result.secure_url
}

/** Permanently removes a raw file from Cloudinary. Resolves false if it failed. */
export async function deleteRawFile(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "raw", invalidate: true })
    return result?.result === "ok" || result?.result === "not found"
  } catch (error) {
    console.error("[CLOUDINARY_DELETE_ERROR]:", error)
    return false
  }
}

/**
 * Short-lived, API-signed link to a raw file. Plain delivery URLs for PDFs are
 * blocked on this Cloudinary account (401 "deny or ACL failure"); the signed
 * download endpoint serves them inline with Content-Type application/pdf.
 */
export function signedRawFileUrl(publicId: string): string {
  return cloudinary.utils.private_download_url(publicId, "", {
    resource_type: "raw",
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
  })
}

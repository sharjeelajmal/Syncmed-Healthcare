"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { auth } from "@/../auth"

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return { ok: false as const, error: "Unauthorized access." }
  }
  return { ok: true as const, session }
}

export async function createProviderAction(formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const specialty = formData.get("specialty") as string
    const licenseNumber = formData.get("licenseNumber") as string
    const consultationFee = parseFloat(formData.get("consultationFee") as string || "150")

    if (!firstName || !lastName || !email || !password || !specialty || !licenseNumber) {
      return { error: "All fields are required." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: hashedPassword,
          role: "PROVIDER",
        }
      })

      await tx.providerProfile.create({
        data: {
          userId: user.id,
          specialty,
          licenseNumber,
          consultationFee,
        }
      })
    })

    revalidatePath("/admin/providers")
    return { success: true }
  } catch (err: any) {
    console.error("[CREATE_PROVIDER_ERROR]:", err)
    if (err.code === "P2002") {
      return { error: "Email already registered." }
    }
    return { error: "Failed to register provider." }
  }
}

export async function updateProviderAction(userId: string, formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const specialty = formData.get("specialty") as string
    const licenseNumber = formData.get("licenseNumber") as string
    const consultationFee = parseFloat(formData.get("consultationFee") as string || "150")

    if (!firstName || !lastName || !specialty || !licenseNumber) {
      return { error: "Required fields are missing." }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { firstName, lastName }
      })

      await tx.providerProfile.update({
        where: { userId: userId },
        data: { specialty, licenseNumber, consultationFee }
      })
    })

    revalidatePath("/admin/providers")
    revalidatePath(`/admin/providers/${userId}/edit`)
    return { success: true }
  } catch (err: any) {
    console.error("[UPDATE_PROVIDER_ERROR]:", err)
    return { error: "Failed to update provider records." }
  }
}

export async function toggleProviderStatusAction(userId: string, currentStatus: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus }
    })
    revalidatePath("/admin/providers")
    return { success: true }
  } catch (err: any) {
    console.error("[TOGGLE_PROVIDER_ERROR]:", err)
    return { error: "Failed to update provider status." }
  }
}

export async function updateProviderAccessAction(
  userId: string,
  data: { isActive: boolean }
) {
  const admin = await assertAdmin()
  if (!admin.ok) return { success: false, error: admin.error }

  try {
    const provider = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "PROVIDER",
      },
      select: { id: true },
    })

    if (!provider) {
      return { success: false, error: "Provider account not found." }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: data.isActive },
      select: {
        id: true,
        isActive: true,
        mfaEnabled: true,
        lastActive: true,
        updatedAt: true,
      },
    })

    revalidatePath(`/admin/providers/${userId}/access`)
    revalidatePath(`/admin/providers/${userId}`)
    revalidatePath("/admin/providers")

    return {
      success: true,
      data: {
        isActive: updated.isActive,
        mfaEnabled: updated.mfaEnabled,
        lastActive: updated.lastActive.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    }
  } catch (err: unknown) {
    console.error("[UPDATE_ACCESS_ERROR]:", err)
    return { success: false, error: "Failed to update account access." }
  }
}

export async function resetProviderMfaAction(userId: string) {
  const admin = await assertAdmin()
  if (!admin.ok) return { success: false, error: admin.error }

  try {
    const provider = await prisma.user.findFirst({
      where: { id: userId, role: "PROVIDER" },
      select: { id: true },
    })
    if (!provider) {
      return { success: false, error: "Provider account not found." }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null },
      select: {
        id: true,
        isActive: true,
        mfaEnabled: true,
        lastActive: true,
        updatedAt: true,
      },
    })

    revalidatePath(`/admin/providers/${userId}/access`)
    revalidatePath(`/admin/providers/${userId}`)

    return {
      success: true,
      message: "Multi-factor authentication has been reset.",
      data: {
        isActive: updated.isActive,
        mfaEnabled: updated.mfaEnabled,
        lastActive: updated.lastActive.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    }
  } catch (err: unknown) {
    console.error("[RESET_MFA_ERROR]:", err)
    return { success: false, error: "Failed to reset MFA." }
  }
}

/** Suspend active login by deactivating until admin re-enables (JWT may persist until expiry). */
export async function revokeProviderSessionsAction(userId: string) {
  const admin = await assertAdmin()
  if (!admin.ok) return { success: false, error: admin.error }

  try {
    const provider = await prisma.user.findFirst({
      where: { id: userId, role: "PROVIDER" },
      select: { id: true, isActive: true },
    })
    if (!provider) {
      return { success: false, error: "Provider account not found." }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        resetToken: null,
        resetTokenExpiry: null,
        isActive: false,
      },
      select: {
        id: true,
        isActive: true,
        mfaEnabled: true,
        lastActive: true,
        updatedAt: true,
      },
    })

    revalidatePath(`/admin/providers/${userId}/access`)
    revalidatePath(`/admin/providers/${userId}`)
    revalidatePath("/admin/providers")

    return {
      success: true,
      message:
        "All sessions revoked: account restricted and MFA cleared. Re-activate when the provider may sign in again.",
      data: {
        isActive: updated.isActive,
        mfaEnabled: updated.mfaEnabled,
        lastActive: updated.lastActive.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    }
  } catch (err: unknown) {
    console.error("[REVOKE_SESSIONS_ERROR]:", err)
    return { success: false, error: "Failed to revoke sessions." }
  }
}

export async function updateProviderProfileAction(userId: string, data: any) {
  try {
    // 1. Update User Details
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        // email: data.email, // Email change usually requires separate verification flow
      }
    })

    // 2. Update Provider Profile if needed (e.g., bio, phone - assuming phone is in user for now)
    // For this task, we mainly update User names. Professional info is read-only.

    revalidatePath("/provider/profile")
    return { success: true }
  } catch (err: any) {
    console.error("[PROFILE_UPDATE_ERROR]:", err)
    return { error: "Failed to update profile details." }
  }
}

export async function updateProviderAvailability(availabilityData: Array<{ day: string, startTime: string, endTime: string, isActive: boolean }>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized access." }
    }

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!provider) {
      return { success: false, error: "Provider profile not found." }
    }

    // Atomic sync: Delete all and recreate for simplicity
    await prisma.$transaction([
      prisma.availability.deleteMany({
        where: { providerId: provider.id }
      }),
      prisma.availability.createMany({
        data: availabilityData.map(item => ({
          providerId: provider.id,
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          isActive: item.isActive
        }))
      })
    ])

    revalidatePath("/provider/schedule")
    return { success: true, message: "Schedule updated successfully." }
  } catch (err: any) {
    console.error("[AVAILABILITY_SYNC_ERROR]:", err)
    return { success: false, error: "Failed to synchronize availability." }
  }
}

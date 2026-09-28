"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { auth } from "@/../auth"
import { sendAccountWelcomeEmail, sendProviderPasswordResetEmail, sendProviderSecurityWarningEmail } from "@/lib/mail"

function getPortalBaseUrl(): string {
  return (
    process.env.PORTAL_LOGIN_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  )
}

async function getProviderAccount(userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, role: "PROVIDER" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  })
}

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return { ok: false as const, error: "Unauthorized access." }
  }
  return { ok: true as const, session }
}

export async function createProviderAction(formData: FormData) {
  const admin = await assertAdmin()
  if (!admin.ok) return { error: admin.error }

  try {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const specialty = formData.get("specialty") as string
    const licenseNumber = formData.get("licenseNumber") as string
    const providerTypeValue = formData.get("providerType")
    const providerType =
      providerTypeValue === "REGISTERED_NURSE" ? "REGISTERED_NURSE" : "MEDICAL_DOCTOR"
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
          providerType,
          specialty,
          licenseNumber,
          consultationFee,
        }
      })
    })

    await sendAccountWelcomeEmail({
      to: email,
      fullName: `${firstName} ${lastName}`,
      roleLabel: "Provider",
      loginEmail: email,
      temporaryPassword: password,
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
  const admin = await assertAdmin()
  if (!admin.ok) return { success: false, error: admin.error }

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

export async function updateProviderUniversalAccessAction(
  userId: string,
  hasUniversalAccess: boolean
) {
  const admin = await assertAdmin()
  if (!admin.ok) return { success: false, error: admin.error }

  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!profile) {
      return { success: false, error: "Provider account not found." }
    }

    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { hasUniversalAccess },
    })

    revalidatePath(`/admin/providers/${userId}/access`)
    revalidatePath(`/admin/providers/${userId}`)
    revalidatePath("/provider", "layout")

    return { success: true, hasUniversalAccess }
  } catch (err: unknown) {
    console.error("[UPDATE_UNIVERSAL_ACCESS_ERROR]:", err)
    return { success: false, error: "Failed to update chart access." }
  }
}

/**
 * Permanently deletes a provider account (meant for dummy/test accounts).
 * Refuses while the provider still has clinical or billing history on any
 * patient, since deleting it would silently remove that patient's records;
 * delete the dummy patients first, or suspend the provider instead.
 */
export async function deleteProviderAction(userId: string) {
  const admin = await assertAdmin()
  if (!admin.ok) return { success: false, error: admin.error }

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, role: "PROVIDER" },
      select: { id: true, providerProfile: { select: { id: true } } },
    })
    if (!user) {
      return { success: false, error: "Provider account not found." }
    }

    const providerId = user.providerProfile?.id

    if (providerId) {
      const [appointments, assessments, clinicalAssessments, physicianNotes, labUploads] =
        await Promise.all([
          prisma.appointment.count({ where: { providerId } }),
          prisma.assessment.count({ where: { providerId } }),
          prisma.clinicalAssessment.count({ where: { providerId } }),
          prisma.physicianNote.count({ where: { providerId } }),
          prisma.labResult.count({ where: { uploadedById: userId } }),
        ])

      const blockers = [
        [appointments, "appointment"],
        [assessments + clinicalAssessments, "assessment"],
        [physicianNotes, "physician note"],
        [labUploads, "lab upload"],
      ]
        .filter(([count]) => (count as number) > 0)
        .map(([count, label]) => `${count} ${label}${count === 1 ? "" : "s"}`)

      if (blockers.length > 0) {
        return {
          success: false,
          error: `This provider still has ${blockers.join(", ")} on patient records. Delete those patients first, or suspend the provider instead.`,
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      if (providerId) {
        await tx.availability.deleteMany({ where: { providerId } })
        // Care team memberships cascade with the profile.
        await tx.providerProfile.delete({ where: { id: providerId } })
      }
      await tx.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } })
      await tx.aiChatMessage.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    }, { maxWait: 10_000, timeout: 20_000 })

    revalidatePath("/admin/providers")
    revalidatePath("/admin/patients", "layout")
    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (err: unknown) {
    console.error("[DELETE_PROVIDER_ERROR]:", err)
    return { success: false, error: "Failed to delete provider." }
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

export async function sendProviderPasswordResetAction(userId: string) {
  const admin = await assertAdmin()
  if (!admin.ok) return { error: admin.error }

  try {
    const provider = await getProviderAccount(userId)
    if (!provider) {
      return { error: "Provider account not found." }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date(Date.now() + 15 * 60 * 1000)
    const resetUrl = `${getPortalBaseUrl()}/forgot-password`

    await prisma.user.update({
      where: { id: provider.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiry,
      },
    })

    await sendProviderPasswordResetEmail({
      to: provider.email,
      fullName: `${provider.firstName} ${provider.lastName}`,
      otp,
      resetUrl,
    })

    return { success: true }
  } catch (err: unknown) {
    console.error("[SEND_PROVIDER_PASSWORD_RESET]:", err)
    return { error: "Failed to send password reset email." }
  }
}

export async function sendProviderSecurityWarningAction(userId: string) {
  const admin = await assertAdmin()
  if (!admin.ok) return { error: admin.error }

  try {
    const provider = await getProviderAccount(userId)
    if (!provider) {
      return { error: "Provider account not found." }
    }

    const loginUrl = `${getPortalBaseUrl()}/login`

    await sendProviderSecurityWarningEmail({
      to: provider.email,
      fullName: `${provider.firstName} ${provider.lastName}`,
      loginUrl,
    })

    return { success: true }
  } catch (err: unknown) {
    console.error("[SEND_PROVIDER_SECURITY_WARNING]:", err)
    return { error: "Failed to send security warning email." }
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

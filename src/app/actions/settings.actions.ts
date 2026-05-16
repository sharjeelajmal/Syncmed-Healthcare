"use server"

import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { firstName: string; lastName: string; email: string; image?: string }) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, message: "Unauthorized" }

  try {
    // Check if email is taken by someone else
    if (data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })
      if (existingUser) {
        return { success: false, message: "Email is already in use by another account." }
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        image: data.image
      }
    })

    revalidatePath("/admin/settings")
    revalidatePath("/")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    return { success: false, message: "Failed to update profile", error: String(error) }
  }
}

export async function updatePassword(data: { currentPassword: string; newPassword: string }) {
  const session = await auth()
  
  // GUARD: Session must exist with a valid user ID
  if (!session?.user?.id) {
    return { success: false, message: "Session expired. Please log in again." }
  }

  // GUARD: Password must not be empty
  if (!data.currentPassword || !data.newPassword) {
    return { success: false, message: "Both passwords are required." }
  }

  try {
    // Fetch user from DB using session ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true }
    })
    
    if (!user) {
      // Fallback: try fetching by email in case ID mapping is stale
      const userByEmail = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true, passwordHash: true }
      })
      if (!userByEmail) return { success: false, message: "User account not found." }
      
      // Verify current password against email-found user
      const isCorrect = await bcrypt.compare(data.currentPassword, userByEmail.passwordHash)
      if (!isCorrect) return { success: false, message: "Current password is incorrect." }

      const cleanNewPassword = data.newPassword.trim()
      const newHash = await bcrypt.hash(cleanNewPassword, 10)
      await prisma.user.update({
        where: { id: userByEmail.id },
        data: { passwordHash: newHash }
      })
      return { success: true, message: "Password updated successfully" }
    }

    // Verify current password
    const isCorrect = await bcrypt.compare(data.currentPassword, user.passwordHash)
    if (!isCorrect) return { success: false, message: "Current password is incorrect." }

    // Hash new password with optimized logic
    const cleanNewPassword = data.newPassword.trim()
    const newHash = await bcrypt.hash(cleanNewPassword, 10)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    })

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    return { success: false, message: "Failed to update password. Please try again." }
  }
}

export async function updatePreferences(prefs: { newPatients: boolean; appointments: boolean; systemUpdates: boolean }) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, message: "Unauthorized" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { notificationPreferences: prefs }
    })

    revalidatePath("/admin/settings")
    return { success: true, message: "Preferences updated successfully" }
  } catch (error) {
    return { success: false, message: "Failed to update preferences", error: String(error) }
  }
}

"use server"

import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { PatientSchema } from "@/lib/validations"

export async function createPatientAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  
  // 1. Safe Extraction & Fallbacks
  const firstName = (formData.get('firstName')?.toString() || formData.get('name')?.toString()?.split(' ')[0] || '').trim();
  const lastName = (formData.get('lastName')?.toString() || formData.get('name')?.toString()?.split(' ').slice(1).join(' ') || '').trim();
  const email = formData.get('email')?.toString()?.toLowerCase() || '';
  const password = formData.get('password')?.toString() || '';
  const phone = formData.get('phone')?.toString() || '';
  const dob = formData.get('dob')?.toString() || '';

  // 2. Strict Zod Validation
  const validatedFields = PatientSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
    phone,
    dob
  })

  if (!validatedFields.success) {
    const errorMsg = validatedFields.error.issues[0]?.message || "Validation failed";
    return { 
      success: false,
      error: `CLINICAL_VALIDATION_ERROR: ${errorMsg}` 
    }
  }

  const { firstName: fName, lastName: lName, email: eMail, password: pWord, phone: pPhone, dob: validatedDob } = validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(pWord, 10)
    const parsedDob = new Date(validatedDob);

    // Sequential execution without $transaction for better stability on Neon/PgBouncer
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "A patient with this email already exists." }
    }

    const user = await prisma.user.create({
      data: {
        email: eMail,
        passwordHash: hashedPassword,
        role: "PATIENT",
        firstName: fName,
        lastName: lName,
        isActive: true,
      },
    })

    // Extract clinical data arrays
    const activeMedications = formData.get('activeMedications')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []
    const allergies = formData.get('allergies')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []
    const chronicConditions = formData.get('chronicConditions')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []

    await prisma.patientProfile.create({
      data: {
        userId: user.id,
        phone: pPhone,
        dateOfBirth: parsedDob,
        address: "", 
        emergencyContact: "", 
        activeMedications,
        allergies,
        chronicConditions,
      },
    })

    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/patients")
    return { success: true }
  } catch (error: any) {
    console.error("PRISMA_WRITE_FAILURE:", error);
    return { 
      success: false, 
      error: error?.message || String(error) 
    };
  }
}

export async function deletePatientAction(userId: string) {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId }
    })

    if (patientProfile) {
      // Clear dependent clinical records first
      await prisma.appointment.deleteMany({
        where: { patientId: patientProfile.id }
      })
      await prisma.assessment.deleteMany({
        where: { patientId: patientProfile.id }
      })
      // Purge the profile
      await prisma.patientProfile.delete({
        where: { id: patientProfile.id }
      })
    }
    
    // Delete the user record
    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/admin/patients")
    return { success: true }
  } catch (err: any) {
    console.error("[CRITICAL_BACKEND_ERROR]:", err)
    return { error: `Failed to delete record: ${err.message}` }
  }
}

export async function assignProviderAction(patientProfileId: string, providerId: string) {
  try {
    const patient = await prisma.patientProfile.update({
      where: { id: patientProfileId },
      data: { assignedProviderId: providerId },
      include: { user: true }
    })

    revalidatePath(`/admin/patients/${patient.userId}`)
    revalidatePath("/admin/patients")
    return { success: true }
  } catch (err: any) {
    console.error("[ASSIGNMENT_ERROR]:", err)
    return { error: `Failed to assign doctor: ${err.message}` }
  }
}

export async function updatePatientDetailsAction(patientProfileId: string, formData: FormData) {
  try {
    const firstName = formData.get("firstName")?.toString()
    const lastName = formData.get("lastName")?.toString()
    const email = formData.get("email")?.toString()?.toLowerCase()
    const phone = formData.get("phone")?.toString()
    const dob = formData.get("dob")?.toString()
    const address = formData.get("address")?.toString()

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
      include: { user: true }
    })

    if (!patient) throw new Error("Patient not found.")

    // Update User model
    await prisma.user.update({
      where: { id: patient.userId },
      data: {
        firstName,
        lastName,
        email,
      }
    })

    // Extract clinical data arrays
    const activeMedications = formData.get('activeMedications')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []
    const allergies = formData.get('allergies')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []
    const chronicConditions = formData.get('chronicConditions')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []

    // Update PatientProfile model
    await prisma.patientProfile.update({
      where: { id: patientProfileId },
      data: {
        phone,
        dateOfBirth: dob ? new Date(dob) : undefined,
        address,
        activeMedications,
        allergies,
        chronicConditions,
      }
    })

    revalidatePath(`/admin/patients/${patient.userId}`)
    revalidatePath("/admin/patients")
    return { success: true }
  } catch (err: any) {
    console.error("[UPDATE_ERROR]:", err)
    return { error: `Update failed: ${err.message}` }
  }
}

export async function fetchPatientUnpaidCountAction(userId: string) {
  const { getPatientUnpaidCount } = await import("@/lib/patient-unpaid-count")
  return getPatientUnpaidCount(userId)
}


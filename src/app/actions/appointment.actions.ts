"use server"

import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"
import { AppointmentSchema } from "@/lib/validations"
import { format } from "date-fns"

function parseScheduledTimeComponents(scheduledAtInput: string) {
  const match = scheduledAtInput.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const hours = match[4] !== undefined ? parseInt(match[4], 10) : 0;
    const minutes = match[5] !== undefined ? parseInt(match[5], 10) : 0;

    const dayDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const dayName = dayNames[dayDate.getUTCDay()];
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    return {
      year,
      month,
      day,
      hours,
      minutes,
      dayName,
      timeStr,
      minutesSinceMidnight: hours * 60 + minutes,
    };
  }

  const d = new Date(scheduledAtInput);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const dayName = dayNames[d.getUTCDay()];
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hours,
    minutes,
    dayName,
    timeStr,
    minutesSinceMidnight: hours * 60 + minutes,
  };
}

export async function createAppointmentAction(formData: FormData) {
  const patientId = formData.get('patientId') as string;
  const providerId = formData.get('providerId') as string;
  const scheduledAt = formData.get('scheduledAt') as string;
  const notes = formData.get('notes') as string;

  if (!patientId || !providerId || !scheduledAt) {
    return { success: false, error: 'Missing required fields for appointment (Patient, Provider, or Date).' };
  }

  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: { select: { firstName: true, lastName: true } } },
    })
    const providerProfile = await prisma.providerProfile.findUnique({ where: { id: providerId } })

    if (!patientProfile || !providerProfile) {
      return { success: false, error: 'Selected Patient or Provider profile does not exist.' };
    }

    const scheduledDate = new Date(scheduledAt);
    const { dayName, minutesSinceMidnight } = parseScheduledTimeComponents(scheduledAt);

    // 2. Strict Availability Check
    const availability = await prisma.availability.findFirst({
      where: {
        providerId: providerProfile.id,
        day: dayName,
        isActive: true
      }
    });

    if (!availability) {
      const displayDay = dayName.charAt(0) + dayName.slice(1).toLowerCase();
      return { success: false, error: `Doctor is not available on ${displayDay}.` };
    }

    const [startH, startM] = availability.startTime.split(":").map(Number);
    const [endH, endM] = availability.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (minutesSinceMidnight < startMinutes || minutesSinceMidnight >= endMinutes) {
      return { success: false, error: 'Requested time slot is outside the doctor\'s office hours.' };
    }

    // 3. Strict Collision Lock (Double-Booking Protection)
    // Search for any existing record within a 30-minute overlap window
    const windowStart = new Date(scheduledDate.getTime() - 29 * 60000);
    const windowEnd = new Date(scheduledDate.getTime() + 29 * 60000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        providerId: providerProfile.id,
        status: { not: "CANCELLED" },
        scheduledAt: {
          gt: windowStart,
          lt: windowEnd
        }
      }
    });

    if (conflict) {
      return { 
        success: false, 
        error: 'This time slot overlaps with an existing reservation. Please select another slot.' 
      };
    }

    // 4. Creation
    await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        providerId: providerProfile.id,
        scheduledAt: scheduledDate,
        notes: notes || null,
        status: "PENDING",
        amount: providerProfile.consultationFee,
      },
    })

    const patientName = `${patientProfile.user.firstName} ${patientProfile.user.lastName}`.trim()
    try {
      await pusherServer.trigger("admin-alerts", "new-activity", {
        title: "New Appointment Booked",
        message: `Patient ${patientName} has booked a slot.`,
        url: "/admin/appointments",
      })
    } catch (pusherError) {
      console.error("[PUSHER_ADMIN_ALERT]:", pusherError)
    }

    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/appointments")
    revalidatePath("/patient/appointments")
    return { success: true }
  } catch (error: any) {
    console.error("[CRITICAL_BACKEND_ERROR]:", error.message)
    return { success: false, error: error?.message || String(error) };
  }
}

export async function updateAppointmentStatusAction(id: string, status: any) {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/appointments")
    revalidatePath("/patient/appointments")
    return { success: true }
  } catch (error: any) {
    console.error("[STATUS_UPDATE_ERROR]:", error.message)
    return { success: false, error: "Failed to update appointment status." };
  }
}

function parseSlotDate(dateInput: string): Date {
  // yyyy-MM-dd avoids timezone shifting the weekday when using ISO midnight UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number)
    return new Date(y, m - 1, d, 12, 0, 0, 0)
  }
  return new Date(dateInput)
}

export async function getProviderSlots(providerId: string, date: string) {
  try {
    const targetDate = parseSlotDate(date);
    const dayName = format(targetDate, "EEEE").toUpperCase(); // e.g., "MONDAY"

    // 1. Fetch Provider Availability for this day
    const availability = await prisma.availability.findFirst({
      where: {
        providerId,
        day: dayName,
        isActive: true
      }
    });

    if (!availability) return [];

    // 2. Fetch existing appointments for this day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: "CANCELLED" }
      },
      select: { scheduledAt: true }
    });

    // 3. Generate slots (30 min intervals)
    const slots = [];
    const [startH, startM] = availability.startTime.split(":").map(Number);
    const [endH, endM] = availability.endTime.split(":").map(Number);

    const current = new Date(targetDate);
    current.setHours(startH, startM, 0, 0);
    
    const end = new Date(targetDate);
    end.setHours(endH, endM, 0, 0);

    const now = new Date();

    while (current < end) {
      const isPast = current < now;
      const isBooked = existingAppointments.some(app => 
        app.scheduledAt.getTime() === current.getTime()
      );

      if (!isPast && !isBooked) {
        slots.push(format(current, "hh:mm a"));
      }
      
      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  } catch (error) {
    console.error("[GET_SLOTS_ERROR]:", error);
    return [];
  }
}


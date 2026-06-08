import { startOfDay, endOfDay } from "date-fns"
import prisma from "@/lib/prisma"

export async function getProviderDashboardListData(providerId: string) {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  const [todaysAppointments, patients, pendingAppointments] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        providerId,
        scheduledAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { scheduledAt: "asc" },
      include: { patient: { include: { user: true } } },
    }),
    prisma.patientProfile.findMany({
      where: { appointments: { some: { providerId } } },
      orderBy: { user: { lastName: "asc" } },
      include: { user: true },
    }),
    prisma.appointment.findMany({
      where: {
        providerId,
        status: "PENDING",
        scheduledAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { scheduledAt: "asc" },
      include: { patient: { include: { user: true } } },
    }),
  ])

  return { todaysAppointments, patients, pendingAppointments }
}

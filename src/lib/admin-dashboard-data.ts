import { startOfDay, endOfDay } from "date-fns"
import prisma from "@/lib/prisma"

export type AdminDashboardStatsData = {
  totalPatients: number
  totalProviders: number
  totalAppointments: number
  todaysAppointmentsCount: number
}

export type AdminUpcomingAppointment = Awaited<
  ReturnType<typeof getAdminUpcomingAppointments>
>[number]

export async function getAdminDashboardStats(): Promise<AdminDashboardStatsData> {
  const [totalPatients, totalProviders, totalAppointments, todaysAppointmentsCount] =
    await Promise.all([
      prisma.patientProfile.count(),
      prisma.providerProfile.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          },
        },
      }),
    ])

  return {
    totalPatients,
    totalProviders,
    totalAppointments,
    todaysAppointmentsCount,
  }
}

export async function getAdminUpcomingAppointments() {
  return prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: new Date() },
      status: { not: "CANCELLED" },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
    include: {
      patient: { include: { user: true } },
      provider: { include: { user: true } },
    },
  })
}

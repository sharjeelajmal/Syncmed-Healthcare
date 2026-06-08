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

export async function getAdminDashboardListData() {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  const [patients, providers, appointments, todaysAppointments] =
    await Promise.all([
      prisma.patientProfile.findMany({
        orderBy: { user: { createdAt: "desc" } },
        include: { user: true },
      }),
      prisma.providerProfile.findMany({
        orderBy: { user: { createdAt: "desc" } },
        include: { user: true },
      }),
      prisma.appointment.findMany({
        orderBy: { scheduledAt: "desc" },
        include: {
          patient: { include: { user: true } },
          provider: { include: { user: true } },
        },
      }),
      prisma.appointment.findMany({
        where: {
          scheduledAt: { gte: todayStart, lte: todayEnd },
        },
        orderBy: { scheduledAt: "asc" },
        include: {
          patient: { include: { user: true } },
          provider: { include: { user: true } },
        },
      }),
    ])

  return { patients, providers, appointments, todaysAppointments }
}

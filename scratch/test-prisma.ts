import "dotenv/config"
import prisma from "../src/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

async function main() {
  console.log("Testing Admin Dashboard Queries...")
  const start = Date.now()
  try {
    const [
      totalPatients, 
      totalProviders, 
      totalAppointments, 
      todaysAppointmentsCount, 
      upcomingAppointments
    ] = await Promise.all([
      prisma.patientProfile.count(),
      prisma.providerProfile.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ 
        where: { 
          scheduledAt: { 
            gte: startOfDay(new Date()), 
            lte: endOfDay(new Date()) 
          } 
        } 
      }),
      prisma.appointment.findMany({ 
        where: { 
          scheduledAt: { gte: new Date() },
          status: { not: "CANCELLED" }
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        include: { 
          patient: { include: { user: true } }, 
          provider: { include: { user: true } } 
        } 
      })
    ]);

    console.log("SUCCESS! Admin Dashboard Queries resolved in", Date.now() - start, "ms")
    console.log("Patients count:", totalPatients)
    console.log("Providers count:", totalProviders)
    console.log("Appointments count:", totalAppointments)
    console.log("Today appointments:", todaysAppointmentsCount)
    console.log("Upcoming appointments loaded:", upcomingAppointments.length)
  } catch (e) {
    console.error("Admin dashboard query error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()

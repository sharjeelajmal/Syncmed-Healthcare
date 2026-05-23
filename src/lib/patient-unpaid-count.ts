import { cache } from "react"
import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"

async function countUnpaidForPatient(userId: string): Promise<number> {
  const [unpaidAppointments, unpaidInvoices] = await Promise.all([
    prisma.appointment.count({
      where: {
        patient: { userId },
        paymentStatus: "UNPAID",
      },
    }),
    prisma.paymentInvoice.count({
      where: {
        patient: { userId },
        status: "PENDING",
      },
    }),
  ])
  return unpaidAppointments + unpaidInvoices
}

export const getPatientUnpaidCount = cache(async (userId: string) => {
  return unstable_cache(
    () => countUnpaidForPatient(userId),
    [`patient-unpaid-${userId}`],
    { revalidate: 30, tags: [`patient-unpaid-${userId}`] }
  )()
})

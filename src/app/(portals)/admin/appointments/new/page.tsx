export const dynamic = "force-dynamic"
export const revalidate = 0

import * as React from "react"
import prisma from "@/lib/prisma"
import { AppointmentForm } from "./AppointmentForm"

export default async function NewAppointmentPage() {
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT", isActive: true },
    include: { patientProfile: true },
    orderBy: { lastName: "asc" }
  })

  const providers = await prisma.user.findMany({
    where: { role: "PROVIDER", isActive: true },
    include: { providerProfile: true },
    orderBy: { lastName: "asc" }
  })

  return (
    <div className="mx-auto max-w-4xl">
      <AppointmentForm patients={patients} providers={providers} />
    </div>
  )
}

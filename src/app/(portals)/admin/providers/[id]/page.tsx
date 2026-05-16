import * as React from "react"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ProviderDetailsClient } from "./ProviderDetailsClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { id } = await params

  const provider = await prisma.user.findUnique({
    where: { id },
    include: {
      providerProfile: true,
    },
  })

  if (!provider || provider.role !== "PROVIDER") {
    notFound()
  }

  // Fetch stats
  const [totalPatients, totalAppointments] = await Promise.all([
    prisma.patientProfile.count({
      where: { assignedProviderId: provider.providerProfile?.id },
    }),
    prisma.appointment.count({
      where: { providerId: provider.providerProfile?.id },
    }),
  ])

  const stats = {
    totalPatients,
    totalAppointments
  }

  return <ProviderDetailsClient provider={provider} stats={stats} />
}

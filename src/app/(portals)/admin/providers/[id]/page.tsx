export const dynamic = "force-dynamic"
export const revalidate = 0

import * as React from "react"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ProviderDetailsClient } from "./ProviderDetailsClient"
import { resolveProviderUser } from "@/lib/resolve-provider-user"
import NewProviderPage from "../new/page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { id } = await params

  // "new" is a static sibling route; when the dynamic segment wins, render the form instead of 404.
  if (id === "new") {
    return <NewProviderPage />
  }

  const provider = await resolveProviderUser(id)

  if (!provider || !provider.providerProfile) {
    notFound()
  }

  // Fetch stats
  const [totalPatients, totalAppointments] = await Promise.all([
    prisma.patientProfile.count({
      where: { assignedProviderId: provider.providerProfile.id },
    }),
    prisma.appointment.count({
      where: { providerId: provider.providerProfile.id },
    }),
  ])

  const stats = {
    totalPatients,
    totalAppointments
  }

  return <ProviderDetailsClient provider={provider} stats={stats} />
}

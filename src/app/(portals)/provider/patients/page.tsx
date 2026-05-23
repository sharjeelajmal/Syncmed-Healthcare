import * as React from "react"
import { Users } from "lucide-react"
import prisma from "@/lib/prisma"
import { getProviderProfileForSession } from "@/lib/portal-auth"

export const dynamic = "force-dynamic"
export const revalidate = 0
import { AssignedPatientsTable } from "./AssignedPatientsTable"

interface PageProps {
  searchParams: Promise<{ query?: string }>
}

export default async function ProviderPatientsPage({ searchParams }: PageProps) {
  const { query } = await searchParams
  
  const provider = await getProviderProfileForSession()

  // Fetch Assigned Patients (Directly assigned OR via Appointments)
  const patients = await prisma.patientProfile.findMany({
    where: {
      OR: [
        { assignedProviderId: provider.id },
        { appointments: { some: { providerId: provider.id } } }
      ],
      user: {
        OR: [
          { firstName: { contains: query || "", mode: "insensitive" } },
          { lastName: { contains: query || "", mode: "insensitive" } },
        ]
      }
    },
    include: {
      user: true,
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      user: {
        lastName: 'asc'
      }
    }
  })

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
             <Users className="size-8 text-[#67BA2E]" />
          </div>
          My Patients
        </h1>
        <p className="text-slate-500 font-medium ml-1">Manage and review your assigned patient roster for Dr. {provider.user.lastName}.</p>
      </div>

      <AssignedPatientsTable patients={patients} />
    </div>
  )
}

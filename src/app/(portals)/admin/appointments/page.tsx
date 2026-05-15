import * as React from "react"
import prisma from "@/lib/prisma"
import { AppointmentsTable } from "./AppointmentsTable"
import { Bell } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const params = await searchParams
  const query = params?.query || ""

  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { patient: { user: { firstName: { contains: query, mode: "insensitive" } } } },
        { patient: { user: { lastName: { contains: query, mode: "insensitive" } } } },
        { provider: { user: { firstName: { contains: query, mode: "insensitive" } } } },
        { provider: { user: { lastName: { contains: query, mode: "insensitive" } } } },
      ]
    },
    include: {
      patient: {
        include: {
          user: true
        }
      },
      provider: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      scheduledAt: 'desc'
    }
  })

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
             <Bell className="size-8 text-[#67BA2E]" />
          </div>
          Master Schedule
        </h1>
        <p className="text-slate-500 font-medium ml-1">Manage and track all clinical interactions across the platform.</p>
      </div>

      <AppointmentsTable appointments={appointments} />
    </div>
  )
}

import prisma from "@/lib/prisma"
import { AppointmentsTable } from "./AppointmentsTable"
import { Bell } from "lucide-react"
import {
  TABLE_PAGE_SIZE,
  parsePageParam,
  paginationSkip,
} from "@/lib/pagination"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string; showPaid?: string }>
}) {
  const params = await searchParams
  const query = params?.query?.trim() || ""
  const showPaid = params?.showPaid !== "false"

  const where: Prisma.AppointmentWhereInput = {
    ...(!showPaid ? { paymentStatus: { not: "PAID" } } : {}),
    ...(query
      ? {
        OR: [
          {
            patient: {
              user: { firstName: { contains: query, mode: "insensitive" } },
            },
          },
          {
            patient: {
              user: { lastName: { contains: query, mode: "insensitive" } },
            },
          },
          {
            provider: {
              user: { firstName: { contains: query, mode: "insensitive" } },
            },
          },
          {
            provider: {
              user: { lastName: { contains: query, mode: "insensitive" } },
            },
          },
        ],
      }
      : {}),
  }

  const totalItems = await prisma.appointment.count({ where })
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE))
  const currentPage = parsePageParam(params?.page, totalPages)

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { include: { user: true } },
      provider: { include: { user: true } },
    },
    orderBy: { scheduledAt: "desc" },
    take: TABLE_PAGE_SIZE,
    skip: paginationSkip(currentPage),
  })

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-800">
          <div className="rounded-xl bg-[#67BA2E]/10 p-2">
            <Bell className="size-8 text-[#67BA2E]" />
          </div>
          Master Schedule
        </h1>
        <p className="ml-1 font-medium text-slate-500">
          Manage and track all clinical interactions across the platform.
        </p>
      </div>

      <AppointmentsTable
        appointments={appointments}
        totalItems={totalItems}
        currentPage={currentPage}
        showPaid={showPaid}
      />
    </div>
  )
}

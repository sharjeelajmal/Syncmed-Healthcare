import { Users } from "lucide-react"
import prisma from "@/lib/prisma"
import { PatientTable } from "./PatientTable"
import {
  TABLE_PAGE_SIZE,
  parsePageParam,
  paginationSkip,
} from "@/lib/pagination"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>
}) {
  const params = await searchParams
  const query = params?.query?.trim() || ""

  const where: Prisma.UserWhereInput = {
    role: "PATIENT",
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const totalItems = await prisma.user.count({ where })
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE))
  const currentPage = parsePageParam(params?.page, totalPages)

  const patients = await prisma.user.findMany({
    where,
    include: { patientProfile: true },
    orderBy: { createdAt: "desc" },
    take: TABLE_PAGE_SIZE,
    skip: paginationSkip(currentPage),
  })

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-800">
          <div className="rounded-xl bg-[#67BA2E]/10 p-2">
            <Users className="size-8 text-[#67BA2E]" />
          </div>
          Patients Registry
        </h1>
        <p className="ml-1 font-medium text-slate-500">
          Securely manage patient profiles and electronic health records.
        </p>
      </div>

      <PatientTable
        patients={patients}
        totalItems={totalItems}
        currentPage={currentPage}
      />
    </div>
  )
}

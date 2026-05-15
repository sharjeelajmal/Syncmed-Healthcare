import * as React from "react"
import { Users } from "lucide-react"
import prisma from "@/lib/prisma"
import { PatientTable } from "./PatientTable"

export const dynamic = "force-dynamic"

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const params = await searchParams
  const query = params?.query || ""

  const patients = await prisma.user.findMany({
    where: {
      role: "PATIENT",
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      patientProfile: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
             <Users className="size-8 text-[#67BA2E]" />
          </div>
          Patients Registry
        </h1>
        <p className="text-slate-500 font-medium ml-1">Securely manage patient profiles and electronic health records.</p>
      </div>

      <PatientTable patients={patients} />
    </div>
  )
}

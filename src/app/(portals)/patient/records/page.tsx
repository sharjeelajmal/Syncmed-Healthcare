import * as React from "react"
import { FileText } from "lucide-react"
import prisma from "@/lib/prisma"
import { RecordsListClient } from "./RecordsListClient"
import { auth } from "@/../auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PatientRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  const params = await searchParams
  const query = params?.query || ""

  // Fetch the real patient profile associated with the logged-in user
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  });

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Patient Profile Not Found</p>
      </div>
    )
  }

  // Fetch assessments scoped to this specific patient at the DB level
  const assessments = await prisma.assessment.findMany({
    where: {
      patientId: patient.id,
      ...(query ? {
        OR: [
          { provider: { user: { firstName: { contains: query, mode: 'insensitive' } } } },
          { provider: { user: { lastName: { contains: query, mode: 'insensitive' } } } },
          { provider: { specialty: { contains: query, mode: 'insensitive' } } }
        ]
      } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: {
      provider: {
        include: { user: true }
      },
      patient: {
        include: { user: true }
      }
    }
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-slide-up pb-10">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
               <FileText className="size-8 text-[#67BA2E]" />
            </div>
            My Medical Records
          </h1>
          <p className="text-slate-500 font-medium ml-1">View and download your clinical documents and care plans.</p>
        </div>

        {/* Content */}
        <RecordsListClient records={assessments} />
      </div>
    </div>
  )
}

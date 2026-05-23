import * as React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  ClipboardCheck, 
  User, 
  Calendar 
} from "lucide-react"
import { differenceInYears } from "date-fns"

import prisma from "@/lib/prisma"
import { getProviderProfileForSession } from "@/lib/portal-auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AssessmentForm } from "./AssessmentForm"

interface PageProps {
  searchParams: Promise<{ patientId?: string }>
}

export default async function NewAssessmentPage({ searchParams }: PageProps) {
  const { patientId } = await searchParams

  if (!patientId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl border-red-100 bg-white shadow-xl p-8 text-center">
          <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck className="size-8 text-red-500" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-2">Patient ID Required</h1>
          <p className="text-slate-500 font-medium mb-6">A valid patient identifier is mandatory to initiate a new clinical assessment.</p>
          <Link href="/provider/patients">
            <Button className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-xl">
              Return to Patient Roster
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const sessionProvider = await getProviderProfileForSession()

  const [patient, provider] = await Promise.all([
    prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: true },
    }),
    Promise.resolve({ id: sessionProvider.id }),
  ])

  if (!patient || !provider) {
    notFound()
  }

  const age = differenceInYears(new Date(), new Date(patient.dateOfBirth))

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up">
        {/* Navigation */}
        <Link href={`/provider/patients/${patientId}`}>
          <Button variant="ghost" className="text-slate-500 font-bold hover:bg-white gap-2 px-0 hover:px-4 transition-all">
            <ArrowLeft className="size-4" />
            Back to Patient Chart
          </Button>
        </Link>

        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
             New Clinical Assessment
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <User className="size-3.5 text-[#67BA2E]" />
              <span className="text-xs font-bold text-slate-700">{patient.user.firstName} {patient.user.lastName}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Calendar className="size-3.5 text-[#67BA2E]" />
              <span className="text-xs font-bold text-slate-700">{age} Years Old</span>
            </div>
          </div>
        </div>

        {/* Assessment Form Card */}
        <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 md:p-10">
            <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Clinical Encounter Record</CardTitle>
            <CardDescription className="font-medium text-slate-500">Document the patient's vitals, observations, and treatment trajectory.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            <AssessmentForm patientId={patient.id} providerId={provider.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

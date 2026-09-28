import * as React from "react"
import { FileText } from "lucide-react"
import prisma from "@/lib/prisma"
import { RecordsListClient } from "./RecordsListClient"
import { buildPatientHealthData } from "@/lib/patient-health-data"
import { buildClinicalRecord, isWithinEncounterWindow, type ClinicalRecordView } from "@/lib/clinical-record"
import { formatProviderDisplayName } from "@/lib/format-provider-name"
import { auth } from "@/../auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

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
  const query = (params?.query || "").trim().toLowerCase()

  // Fetch the real patient profile associated with the logged-in user
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  });

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Patient Profile Not Found</p>
      </div>
    )
  }

  const providerInclude = { include: { user: true } } as const

  const [assessments, clinicalAssessments, physicianNotes, labResults] = await Promise.all([
    prisma.assessment.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: { provider: providerInclude, medications: true, diagnoses: true },
    }),
    prisma.clinicalAssessment.findMany({ where: { patientId: patient.id } }),
    prisma.physicianNote.findMany({
      where: { patientId: patient.id },
      orderBy: { noteDate: 'asc' },
      include: { provider: providerInclude },
    }),
    prisma.labResult.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { firstName: true, lastName: true, providerProfile: { select: { providerType: true } } } } },
    }),
  ])

  const patientName = `${patient.user.firstName} ${patient.user.lastName}`
  const oldestAssessmentId = assessments[assessments.length - 1]?.id

  // Each physician note joins the assessment it was written around; the rest
  // become their own records so no note is hidden from the patient.
  const attachedNoteIds = new Set<string>()
  const assessmentRecords: ClinicalRecordView[] = assessments.map((assessment) => {
    const notes = physicianNotes.filter(
      (n) => !attachedNoteIds.has(n.id) && isWithinEncounterWindow(assessment.createdAt, n.noteDate)
    )
    notes.forEach((n) => attachedNoteIds.add(n.id))
    return buildClinicalRecord({
      id: assessment.id,
      date: assessment.createdAt,
      patientName,
      provider: assessment.provider,
      assessment,
      isInitialAssessment: assessment.id === oldestAssessmentId,
      clinicalAssessments,
      physicianNotes: notes,
    })
  })

  const noteRecords = physicianNotes
    .filter((n) => !attachedNoteIds.has(n.id))
    .map((n) =>
      buildClinicalRecord({
        id: n.id,
        date: n.noteDate,
        patientName,
        provider: n.provider,
        assessment: null,
        clinicalAssessments: [],
        physicianNotes: [n],
      })
    )

  const records = [...assessmentRecords, ...noteRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(
      (r) =>
        !query ||
        r.providerName.toLowerCase().includes(query) ||
        r.providerSpecialty.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
    )

  return (
    <div className="w-full py-6 md:py-8">
      <div className="animate-slide-up">
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
        <RecordsListClient
          records={records}
          labResults={labResults.map((l) => ({
            id: l.id,
            title: l.title,
            fileUrl: l.fileUrl,
            notes: l.notes,
            createdAt: l.createdAt.toISOString(),
            uploadedByName: l.uploadedBy.providerProfile
              ? formatProviderDisplayName({ providerType: l.uploadedBy.providerProfile.providerType, user: l.uploadedBy })
              : "SyncMed Care Team",
          }))}
          healthData={buildPatientHealthData(
            patient.diagnoses,
            patient.activeMedications,
            patient.allergies,
            assessments
          )}
        />
      </div>
    </div>
  )
}

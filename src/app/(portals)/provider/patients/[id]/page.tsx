export const dynamic = "force-dynamic"
export const revalidate = 0

import * as React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  ClipboardList, 
  History,
  ArrowLeft,
  PlusCircle,
  Stethoscope,
  Shield,
  FilePenLine,
  FlaskConical
} from "lucide-react"
import { format, differenceInYears } from "date-fns"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { formatProviderDisplayName } from "@/lib/format-provider-name"
import { parseAssessmentData } from "@/lib/assessment-vitals"
import { auth } from "@/../auth"

import prisma from "@/lib/prisma"
import { providerPatientScope } from "@/lib/care-team"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MembershipTierBadge } from "@/components/ui/membership-tier-badge"
import { VisitHistoryTable } from "./VisitHistoryTable"
import { ClinicalSnapshot } from "./ClinicalSnapshot"
import { PhysicianNoteDialog } from "./PhysicianNoteDialog"
import { PhysicianNotesList } from "./PhysicianNotesList"
import { LabResultsPanel } from "./LabResultsPanel"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatientChartPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  const sessionUserId = session?.user?.id
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!sessionUserId || !role) {
    notFound()
  }

  let providerProfileId: string | null = null
  let isPhysician = false
  if (role === "PROVIDER") {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: sessionUserId },
      select: { id: true, providerType: true },
    })
    if (!providerProfile) {
      notFound()
    }
    providerProfileId = providerProfile.id
    isPhysician = providerProfile.providerType === "MEDICAL_DOCTOR"
  } else if (role !== "ADMIN") {
    notFound()
  }

  // PatientProfile.id (roster) or User.id (admin URLs)
  const patient = await prisma.patientProfile.findFirst({
    where: {
      ...(providerProfileId
        ? {
            AND: [
              { OR: [{ id }, { userId: id }] },
              await providerPatientScope(providerProfileId),
            ],
          }
        : { OR: [{ id }, { userId: id }] }),
    },
    include: {
      user: true,
      careTeam: {
        orderBy: { createdAt: "asc" },
        include: { provider: { include: { user: true } } },
      },
      assessments: {
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          provider: {
            include: { user: true }
          },
          medications: true,
          diagnoses: true
        }
      },
      clinicalAssessments: {
        orderBy: {
          createdAt: 'desc'
        },
      },
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 1
      },
      physicianNotes: {
        orderBy: { noteDate: 'desc' },
        include: { provider: { include: { user: true } } }
      },
      labResults: {
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { firstName: true, lastName: true, providerProfile: { select: { providerType: true } } }
          }
        }
      }
    }
  })

  if (!patient) {
    notFound()
  }

  const latestAppointment = patient.appointments[0]
  const isLocked = latestAppointment ? latestAppointment.paymentStatus !== "PAID" : false

  const age = differenceInYears(new Date(), new Date(patient.dateOfBirth))

  const activeMedications = mergeUnique([
    ...patient.activeMedications,
    ...latestAssessmentMedications(patient.assessments),
  ])
  const diagnoses = mergeUnique([
    ...patient.diagnoses,
    ...patient.assessments.flatMap((a) => a.diagnoses.map((d) => d.name)),
  ])

  const physicianNotes = patient.physicianNotes.map((n) => ({
    id: n.id,
    noteDate: n.noteDate.toISOString(),
    chiefComplaint: n.chiefComplaint,
    assessment: n.assessment,
    plan: n.plan,
    authorName: formatProviderDisplayName(n.provider),
  }))

  const labResults = patient.labResults.map((l) => ({
    id: l.id,
    title: l.title,
    // Opened through the access-checked route; raw Cloudinary PDF links are blocked.
    fileUrl: `/api/lab-results/${l.id}`,
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
    uploadedByName: l.uploadedBy.providerProfile
      ? formatProviderDisplayName({ providerType: l.uploadedBy.providerProfile.providerType, user: l.uploadedBy })
      : `${l.uploadedBy.firstName} ${l.uploadedBy.lastName}`,
    // Mirrors deleteLabResultAction: the uploader or an admin.
    canDelete: role === "ADMIN" || l.uploadedById === sessionUserId,
  }))

  return (
    <div className="animate-slide-up">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/provider/patients">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-transparent hover:border-slate-200">
                <ArrowLeft className="size-5 text-slate-500" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  {patient.user.firstName} {patient.user.lastName}
                </h1>
                <MembershipTierBadge tier={patient.membershipStatus} />
                <Badge className="bg-[#67BA2E]/10 text-[#67BA2E] border-[#67BA2E]/20 font-bold px-3 py-1 rounded-full text-xs">
                  MEMBER ID: {patient.id.slice(0, 8).toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-slate-500 font-medium text-sm">
                <span className="flex items-center gap-1">
                  <User className="size-4" />
                  {age} Years Old
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <Stethoscope className="size-4" />
                  {patient.careTeam.length > 0
                    ? patient.careTeam.map((m) => formatProviderDisplayName(m.provider)).join(", ")
                    : "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-3">
          {isPhysician ? <PhysicianNoteDialog patientId={patient.id} /> : null}
          {isLocked ? (
            <div className="flex flex-col md:items-end gap-1">
              <Button disabled className="h-10 px-6 bg-slate-100 text-slate-400 rounded-lg font-black border border-slate-200 flex items-center gap-2 w-full md:w-auto text-xs uppercase tracking-wider">
                <Shield className="size-4" />
                Assessment Locked
              </Button>
              <Badge variant="outline" className="bg-red-50 text-red-500 border-red-100 font-black text-[9px] uppercase tracking-[0.2em] px-3 py-0.5 rounded-full self-center md:self-auto">
                Payment Pending
              </Badge>
            </div>
          ) : (
            <Link href={`/provider/assessments/new?patientId=${patient.id}`}>
              <Button className="h-10 px-6 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-lg font-black shadow-md shadow-emerald-50 transition-all flex items-center gap-2 w-full md:w-auto text-xs uppercase tracking-wider">
                <PlusCircle className="size-4" />
                Start New Assessment
              </Button>
            </Link>
          )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Patient Info & Clinical Snapshot */}
          <div className="lg:col-span-1 space-y-8">
            {/* Card 1: Patient Information */}
            <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="size-4 text-[#67BA2E]" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <InfoItem icon={<Phone />} label="Primary Phone" value={patient.phone} />
                <InfoItem icon={<Mail />} label="Email Address" value={patient.user.email} />
                <InfoItem icon={<Calendar />} label="Date of Birth" value={format(new Date(patient.dateOfBirth), DISPLAY_DATE_FORMAT)} />
                <InfoItem icon={<MapPin />} label="Residential Address" value={patient.address} />
                <InfoItem icon={<AlertCircle />} label="Emergency Contact" value={patient.emergencyContact} />
              </CardContent>
            </Card>

            {/* Card 2: Clinical Snapshot */}
            <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="size-4 text-[#67BA2E]" />
                  Clinical Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ClinicalSnapshot
                  patientId={patient.id}
                  diagnoses={diagnoses}
                  activeMedications={activeMedications}
                  allergies={patient.allergies}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Visit History, Physician Notes, Lab Results */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <History className="size-6 text-[#67BA2E]" />
                  Visit History & Encounters
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Log of all past appointments and clinical notes.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {patient.assessments.length > 0 ? (
                  <VisitHistoryTable
                    assessments={patient.assessments}
                    clinicalAssessments={patient.clinicalAssessments}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <History className="size-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No prior clinical history found.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <FilePenLine className="size-6 text-[#67BA2E]" />
                  Physician Notes
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Encounter notes, impressions and treatment plans.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <PhysicianNotesList notes={physicianNotes} />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <FlaskConical className="size-6 text-[#67BA2E]" />
                  Lab Results
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Uploaded lab reports (PDF).</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <LabResultsPanel patientId={patient.id} labResults={labResults} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Case-insensitive de-duplication that keeps the first spelling seen. */
function mergeUnique(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of values) {
    const value = raw.trim()
    const key = value.toLowerCase()
    if (!value || seen.has(key)) continue
    seen.add(key)
    result.push(value)
  }
  return result
}

type MedicationLike = { name?: unknown; dosage?: unknown; frequency?: unknown }

/**
 * The most recent assessment that recorded medications is the current med list.
 * Assessments store meds as Medication rows; older ones only in data.medications.
 * `assessments` must be ordered newest first.
 */
function latestAssessmentMedications(
  assessments: { data: unknown; medications: MedicationLike[] }[]
): string[] {
  for (const assessment of assessments) {
    const dataMeds = parseAssessmentData(assessment.data).medications
    const meds: MedicationLike[] =
      assessment.medications.length > 0
        ? assessment.medications
        : Array.isArray(dataMeds)
          ? (dataMeds as MedicationLike[])
          : []

    const labels = meds
      .map((m) => {
        const name = String(m?.name ?? "").trim()
        if (!name) return ""
        const detail = [m.dosage, m.frequency].map((v) => String(v ?? "").trim()).filter(Boolean).join(", ")
        return detail ? `${name} — ${detail}` : name
      })
      .filter(Boolean)

    if (labels.length > 0) return labels
  }
  return []
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-slate-50 rounded-lg text-[#67BA2E] border border-slate-100">
        {React.cloneElement(icon as any, { size: 16 })}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-slate-700 font-bold text-sm tracking-tight leading-tight">{value}</span>
      </div>
    </div>
  )
}


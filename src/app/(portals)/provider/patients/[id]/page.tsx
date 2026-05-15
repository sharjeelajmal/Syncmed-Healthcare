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
  FileText, 
  ClipboardList, 
  History,
  ArrowLeft,
  PlusCircle,
  Stethoscope,
  ChevronRight
} from "lucide-react"
import { format, differenceInYears } from "date-fns"

import prisma from "@/lib/prisma"
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
import { VisitHistoryTable } from "./VisitHistoryTable"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatientChartPage({ params }: PageProps) {
  const { id } = await params

  // Fetch Patient Details with Assessments
  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: {
      user: true,
      assignedProvider: {
        include: { user: true }
      },
      assessments: {
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          provider: {
            include: { user: true }
          }
        }
      }
    }
  })

  if (!patient) {
    notFound()
  }

  const age = differenceInYears(new Date(), new Date(patient.dateOfBirth))

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  {patient.user.firstName} {patient.user.lastName}
                </h1>
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
                  Dr. {patient.assignedProvider?.user.lastName || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          <Link href={`/provider/assessments/new?patientId=${patient.id}`}>
            <Button className="h-10 px-6 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-lg font-black shadow-md shadow-emerald-50 transition-all flex items-center gap-2 w-full md:w-auto text-xs uppercase tracking-wider">
              <PlusCircle className="size-4" />
              Start New Assessment
            </Button>
          </Link>
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
                <InfoItem icon={<Calendar />} label="Date of Birth" value={format(new Date(patient.dateOfBirth), "MMMM dd, yyyy")} />
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
              <CardContent className="p-6 space-y-8">
                <SnapshotItem title="Active Medications" />
                <SnapshotItem title="Allergies" />
                <SnapshotItem title="Chronic Conditions" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Visit History */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden h-full">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <History className="size-6 text-[#67BA2E]" />
                  Visit History & Encounters
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Log of all past appointments and clinical notes.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {patient.assessments.length > 0 ? (
                  <VisitHistoryTable assessments={patient.assessments} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <History className="size-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No prior clinical history found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
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

function SnapshotItem({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
        {title}
        <ChevronRight size={14} className="text-slate-300" />
      </h4>
      <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No clinical records found</p>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"

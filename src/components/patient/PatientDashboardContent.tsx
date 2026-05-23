import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Calendar,
  FileText,
  Stethoscope,
  CreditCard,
  ChevronRight,
  Clock,
  AlertCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppointmentActionsClient } from "@/components/ui/appointment-actions-client"

export function PatientDashboardContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <PatientDashboardSkeletonMain />
      <PatientDashboardSkeletonSide />
    </div>
  )
}

function PatientDashboardSkeletonMain() {
  return (
    <div className="lg:col-span-2 h-64 rounded-[2.5rem] bg-white border border-slate-200" />
  )
}

function PatientDashboardSkeletonSide() {
  return (
    <div className="lg:col-span-1 h-64 rounded-[2.5rem] bg-white border border-slate-200" />
  )
}

export async function PatientDashboardContent({
  sessionUserId,
}: {
  sessionUserId: string
}) {
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: sessionUserId },
    include: { user: true },
  })

  if (!patient) {
    return (
      <PatientNotFound />
    )
  }

  const patientId = patient.id

  const [nextAppointment, recentAssessment] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        patientId,
        scheduledAt: { gt: new Date() },
        status: { not: "CANCELLED" },
      },
      orderBy: { scheduledAt: "asc" },
      include: { provider: { include: { user: true } } },
    }),
    prisma.assessment.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      include: { provider: { include: { user: true } } },
    }),
  ])

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {nextAppointment ? (
            <Card className="rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden border-l-8 border-l-[#67BA2E]">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-6">
                    <Badge className="bg-[#67BA2E]/10 text-[#67BA2E] border-transparent font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                      Upcoming Appointment
                    </Badge>
                    <AppointmentDetails appointment={nextAppointment} />
                  </div>
                  <AppointmentActionsClient appointment={nextAppointment} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <NoAppointmentCard />
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-[2.5rem] border-slate-200 shadow-xl bg-white overflow-hidden h-full">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="size-4 text-[#67BA2E]" />
                Recent Record
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {recentAssessment ? (
                <>
                  <RecentAssessment assessment={recentAssessment} />
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-12 text-[#67BA2E] font-black hover:bg-[#67BA2E]/5 rounded-xl uppercase tracking-widest text-[10px]"
                  >
                    Review Encounter
                    <ChevronRight className="size-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="size-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    No clinical records found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6 mt-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">
          Health Management
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <QuickLinkCard
            href="/patient/appointments?openBooking=true"
            icon={<Calendar />}
            title="Book Appointment"
            description="Schedule a visit"
          />
          <QuickLinkCard
            href="/patient/records"
            icon={<FileText />}
            title="My Records"
            description="Lab results & notes"
          />
          <QuickLinkCard
            href="/patient/doctors"
            icon={<Stethoscope />}
            title="My Doctors"
            description="Your care team"
          />
          <QuickLinkCard
            href="/patient/billing"
            icon={<CreditCard />}
            title="Billing / Invoices"
            description="Manage payments"
          />
        </div>
      </div>
    </>
  )
}

function PatientNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] bg-slate-50 rounded-2xl border border-slate-200">
      <p className="text-slate-500 font-bold uppercase tracking-widest">
        Patient Profile Not Found
      </p>
    </div>
  )
}

function AppointmentDetails({
  appointment,
}: {
  appointment: {
    scheduledAt: Date
    provider: { user: { lastName: string } }
  }
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
        {format(new Date(appointment.scheduledAt), "EEEE, MMMM dd")}
      </h2>
      <div className="flex items-center gap-4 text-slate-500 font-bold">
        <span className="flex items-center gap-2">
          <Clock className="size-5 text-[#67BA2E]" />
          {format(new Date(appointment.scheduledAt), "hh:mm a")}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className="flex items-center gap-2">
          <Stethoscope className="size-5 text-[#67BA2E]" />
          Dr. {appointment.provider.user.lastName}
        </span>
      </div>
    </div>
  )
}

function NoAppointmentCard() {
  return (
    <Card className="rounded-[2.5rem] border-slate-200 shadow-xl bg-white overflow-hidden border-dashed border-2">
      <CardContent className="p-12 text-center space-y-6">
        <div className="size-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-4">
          <Calendar className="size-8 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            No upcoming appointments
          </h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            Stay proactive about your health by scheduling your next check-up today.
          </p>
        </div>
        <Button
          asChild
          className="h-12 px-8 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs gap-2"
        >
          <Link href="/patient/appointments?openBooking=true">
            <PlusCircle className="size-4" />
            Book New Appointment
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function RecentAssessment({
  assessment,
}: {
  assessment: {
    createdAt: Date
    provider: { user: { firstName: string; lastName: string } }
    data: unknown
  }
}) {
  return (
    <div className="space-y-4">
      <AssessmentProvider assessment={assessment} />
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <p className="text-xs font-bold text-slate-600 italic line-clamp-2 leading-relaxed">
          &quot;
          {(assessment.data as { notes?: { chiefComplaint?: string } })?.notes
            ?.chiefComplaint || "No chief complaint recorded"}
          &quot;
        </p>
      </div>
    </div>
  )
}

function AssessmentProvider({
  assessment,
}: {
  assessment: {
    createdAt: Date
    provider: { user: { firstName: string; lastName: string } }
  }
}) {
  return (
    <AssessmentProviderInner assessment={assessment} />
  )
}

function AssessmentProviderInner({
  assessment,
}: {
  assessment: {
    createdAt: Date
    provider: { user: { firstName: string; lastName: string } }
  }
}) {
  return (
    <AssessmentProviderContent assessment={assessment} />
  )
}

function AssessmentProviderContent({
  assessment,
}: {
  assessment: {
    createdAt: Date
    provider: { user: { firstName: string; lastName: string } }
  }
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-xs">
        {assessment.provider.user.firstName[0]}
        {assessment.provider.user.lastName[0]}
      </div>
      <AssessmentProviderMeta assessment={assessment} />
    </div>
  )
}

function AssessmentProviderMeta({
  assessment,
}: {
  assessment: {
    createdAt: Date
    provider: { user: { lastName: string } }
  }
}) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-bold text-slate-800">
        Dr. {assessment.provider.user.lastName}
      </span>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {format(new Date(assessment.createdAt), "MMM dd, yyyy")}
      </span>
    </div>
  )
}

function QuickLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link href={href}>
      <Card className="rounded-[2rem] border-slate-200 hover:shadow-2xl hover:shadow-[#67BA2E]/10 transition-all duration-300 cursor-pointer group bg-white overflow-hidden h-full">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="size-14 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-[#67BA2E] group-hover:bg-[#67BA2E] group-hover:text-white transition-all duration-300 shadow-sm">
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
              size: 24,
            })}
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 tracking-tight text-sm uppercase">
              {title}
            </h3>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              {description}
            </p>
          </div>
          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="size-4 text-[#67BA2E]" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

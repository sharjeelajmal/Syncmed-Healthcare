import * as React from "react"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ArrowLeft, User, UserCheck, ShieldAlert, GraduationCap } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MembershipTierBadge } from "@/components/ui/membership-tier-badge"
import AssignProviderForm from "./AssignProviderForm"
import PatientEditForm from "./PatientEditForm"
import { PatientBillingCard } from "./PatientBillingCard"
import { formatProviderDisplayName } from "@/lib/format-provider-name"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PatientDetailsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams
  const isReadOnly = mode === "view"

  // Fetch patient profile along with user and assigned provider using the userId from the URL
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: id },
    include: {
      user: true,
      careTeam: { select: { providerId: true } }
    }
  })

  if (!patient) {
    notFound()
  }

  const [providers, billingAppointments, invoices] = await Promise.all([
    prisma.providerProfile.findMany({
      include: {
        user: true
      }
    }),
    prisma.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { scheduledAt: "desc" },
      select: {
        id: true,
        scheduledAt: true,
        amount: true,
        paymentStatus: true,
        receiptData: true,
        provider: { select: { providerType: true, user: { select: { firstName: true, lastName: true } } } },
      },
    }),
    prisma.paymentInvoice.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, amount: true, status: true, receiptUrl: true },
    }),
  ])

  const patientName = { user: { firstName: patient.user.firstName, lastName: patient.user.lastName } }

  const formattedProviders = providers.map(p => ({
    id: p.id,
    name: `${formatProviderDisplayName(p)} (${p.specialty})`,
    providerType: p.providerType,
  }))

  return (
    <div className="min-h-screen animate-slide-up">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/admin/patients">
          <Button variant="ghost" className="hover:bg-slate-100 transition-colors">
            <ArrowLeft className="mr-2 size-4" />
            Back to Directory
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Editable Demographics */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card overflow-hidden border-0 shadow-2xl rounded-[2rem] p-0">
            <div className="bg-gradient-to-br from-[#67BA2E] to-[#4A8A1C] p-8 sm:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <User size={120} />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="size-20 sm:size-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 text-white shadow-inner">
                  <User size={48} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                    {patient.user.firstName} {patient.user.lastName}
                  </h1>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <MembershipTierBadge tier={patient.membershipStatus} />
                    <p className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <UserCheck size={12} />
                      Verified Patient
                    </p>
                    <p className="bg-emerald-900/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      #{patient.userId.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8 sm:p-10 bg-white/50">
              <div className="mb-10 flex items-center justify-between border-b border-slate-100 pb-4">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Clinical Data Entry</p>
                 </div>
              </div>
              
              <PatientEditForm patient={patient} isReadOnly={isReadOnly} />

              <div className="mt-12 p-6 bg-slate-50/80 rounded-3xl border border-slate-100 border-dashed relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <ShieldAlert size={60} />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-orange-500" />
                  System Notifications
                </h3>
                <p className="text-sm text-slate-500 italic font-medium leading-relaxed">
                  Patient record was last synchronized with the clinical database. {isReadOnly ? "View-only mode active." : "Any changes made here will be reflected across all provider portals immediately."}
                </p>
              </div>
            </CardContent>
          </Card>

          <PatientBillingCard
            isReadOnly={isReadOnly}
            appointments={billingAppointments.map((a) => ({
              ...a,
              scheduledAt: a.scheduledAt.toISOString(),
              patient: patientName,
            }))}
            invoices={invoices.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }))}
          />
        </div>

        {/* Right Column: Assignment Form */}
        <div className="space-y-8">
          <Card className="glass-card overflow-hidden border-0 shadow-2xl rounded-[2rem]">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Clinical Assignment</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {isReadOnly ? "Oversight Log" : "Doctors & Nurses"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <AssignProviderForm 
                patientId={patient.id} 
                careTeamProviderIds={patient.careTeam.map((m) => m.providerId)}
                providers={formattedProviders} 
                isReadOnly={isReadOnly}
              />
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import * as React from "react"
import Link from "next/link"
import { 
  Stethoscope, 
  MessageSquare, 
  Calendar, 
  ArrowLeft,
  Mail,
  ShieldCheck,
  Clock,
  MessageCircle,
} from "lucide-react"
import { differenceInYears, format } from "date-fns"

import prisma from "@/lib/prisma"
import { getPatientProfileForSession } from "@/lib/portal-auth"
import { formatProviderDisplayName } from "@/lib/format-provider-name"

export const dynamic = "force-dynamic"
export const revalidate = 0
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OpenProviderChatButton } from "@/components/chat/OpenProviderChatButton"

function getProviderAvatarSrc(providerType: string) {
  return providerType === "REGISTERED_NURSE" ? "/female.png" : "/male.png"
}

function formatAvailabilitySummary(
  rules: { day: string; startTime: string; endTime: string }[]
) {
  if (rules.length === 0) return "No active hours on file"
  const sample = rules.slice(0, 2).map((r) => `${r.day.slice(0, 3)} ${r.startTime}–${r.endTime}`)
  return rules.length > 2 ? `${sample.join(", ")} (+${rules.length - 2} more)` : sample.join(", ")
}

export default async function MyDoctorsPage() {
  const patient = await getPatientProfileForSession()

  const patientWithProvider = await prisma.patientProfile.findUnique({
    where: { id: patient.id },
    include: {
      assignedProvider: {
        include: {
          user: true,
          availability: { where: { isActive: true }, orderBy: { day: "asc" } },
        },
      },
    },
  })

  const doctor = patientWithProvider?.assignedProvider
  const completedVisits = doctor
    ? await prisma.appointment.count({
        where: { providerId: doctor.id, patientId: patient.id, status: "COMPLETED" },
      })
    : 0
  const yearsWithPlatform = doctor
    ? Math.max(1, differenceInYears(new Date(), new Date(doctor.user.createdAt)))
    : 0
  const availabilityLabel = doctor
    ? formatAvailabilitySummary(doctor.availability)
    : ""

  return (
    <div className="selection:bg-green-100">
      <div className="w-full space-y-10 py-6 md:py-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Link 
              href="/patient/dashboard" 
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Your Dedicated <span className="text-[#67BA2E]">Care Team</span>
            </h1>
            <p className="text-sm md:text-base font-medium text-slate-500 max-w-lg leading-relaxed">
              Direct, absolute access to your elite medical group. Communicate, book, and manage your health with clinical precision.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Providers</span>
                <span className="text-xl font-black text-slate-900">{doctor ? 1 : 0} Members</span>
             </div>
             <div className="size-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Stethoscope className="size-6 text-[#67BA2E]" />
             </div>
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctor ? (
            <Card className="group relative rounded-[2.5rem] border-slate-200 bg-white shadow-2xl shadow-slate-200/50 hover:shadow-green-100/50 transition-all duration-500 overflow-hidden border-b-[6px] border-b-[#67BA2E]">
              <CardContent className="p-8 md:p-10 space-y-8">
                
                {/* Status Indicator */}
                <div className="flex items-center justify-start">
                   <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 gap-2 flex items-center">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Available on Direct Line
                   </Badge>
                </div>

                {/* Profile Info */}
                <div className="flex flex-col items-center text-center space-y-5">
                   <div className="relative">
                      <div className="absolute inset-0 bg-[#67BA2E] rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                      <Avatar className="size-28 md:size-32 rounded-[2rem] border-[4px] border-white shadow-xl group-hover:scale-105 transition-transform duration-500 ring-2 ring-[#67BA2E]/10">
                        <AvatarImage
                          src={getProviderAvatarSrc(doctor.providerType)}
                          alt={formatProviderDisplayName(doctor)}
                          className="object-cover object-top"
                        />
                        <AvatarFallback className="bg-slate-50 text-[#67BA2E] font-black text-3xl">
                           {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 size-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50">
                         <ShieldCheck className="size-5 text-[#67BA2E]" />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {formatProviderDisplayName(doctor)}
                      </h2>
                      <div className="flex flex-wrap justify-center gap-2">
                         <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                            {doctor.specialty}
                         </Badge>
                         {doctor.licenseNumber ? (
                           <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                              License {doctor.licenseNumber}
                           </Badge>
                         ) : null}
                      </div>
                   </div>
                </div>

                {/* Quick Stats/Details */}
                <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-50">
                   <div className="text-center space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                      <p className="text-xs font-black text-slate-700">{yearsWithPlatform} {yearsWithPlatform === 1 ? "Year" : "Years"}</p>
                   </div>
                   <div className="text-center space-y-1 border-x border-slate-50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visits</p>
                      <p className="text-xs font-black text-slate-700">{completedVisits}</p>
                   </div>
                   <div className="text-center space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned</p>
                      <p className="text-xs font-black text-slate-700">Primary</p>
                   </div>
                </div>

                {/* Contact List */}
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-500">
                      <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                         <Mail className="size-4" />
                      </div>
                      <span className="text-xs font-bold truncate">{doctor.user.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                      <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                         <Clock className="size-4" />
                      </div>
                      <span className="text-xs font-bold">{availabilityLabel}</span>
                   </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <OpenProviderChatButton
                    providerUserId={doctor.user.id}
                    variant="outline"
                    className="md:flex-1 h-12 rounded-2xl border-slate-200 text-[#67BA2E] font-black uppercase tracking-widest text-[10px] hover:bg-[#67BA2E]/5 hover:border-[#67BA2E]/20 transition-all gap-2"
                  >
                    <MessageSquare className="size-3.5" />
                    Message
                  </OpenProviderChatButton>
                  <Button 
                    asChild 
                    className="md:flex-1 h-12 rounded-2xl bg-[#67BA2E] hover:bg-[#5aa329] text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-100 transition-all active:scale-[0.98] gap-2"
                  >
                    <Link href={`/patient/appointments?doctorId=${doctor.id}`}>
                      <Calendar className="size-3.5" />
                      Book Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Empty State */
            <Card className="col-span-full md:col-span-2 lg:col-span-3 rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 p-12 md:p-20 text-center space-y-8">
              <div className="relative mx-auto size-24 md:size-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center group">
                 <div className="absolute inset-0 bg-slate-200 rounded-[2.5rem] animate-pulse opacity-50" />
                 <Stethoscope className="size-10 md:size-14 text-slate-300 relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="max-w-md mx-auto space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">No providers assigned yet</h3>
                <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed">
                  To ensure the highest standard of care, your medical team is manually curated. 
                  Contact the clinical concierge to set up your primary medical team.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 font-black uppercase tracking-widest text-xs">
                  Contact Support
                </Button>
                <Button className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs">
                  Request Assignment
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Specialist Referral */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h4 className="text-xl font-black text-slate-900 tracking-tight">
              Need a Specialist?
            </h4>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Looking for specialized care? Send a secure message to your primary provider to request a referral to a SyncMed specialist.
            </p>
          </div>
          {doctor ? (
            <OpenProviderChatButton
              providerUserId={doctor.user.id}
              variant="ghost"
              className="h-12 px-8 font-black text-[#67BA2E] uppercase tracking-widest text-xs gap-2 hover:bg-green-50 shrink-0"
            >
              <MessageCircle className="size-4" />
              Message Provider
            </OpenProviderChatButton>
          ) : (
            <Button
              variant="ghost"
              disabled
              className="h-12 px-8 font-black text-slate-400 uppercase tracking-widest text-xs gap-2 shrink-0"
            >
              <MessageCircle className="size-4" />
              Message Provider
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

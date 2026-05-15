import * as React from "react"
import Link from "next/link"
import { 
  Calendar, 
  FileText, 
  Stethoscope, 
  CreditCard, 
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Shield,
  CheckCircle2,
  TrendingUp,
  Heart,
  Activity
} from "lucide-react"
import { format } from "date-fns"

import prisma from "@/lib/prisma"
import { auth } from "../../../../../auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MFASetupModal } from "@/components/auth/MFASetupModal"

export default async function PatientDashboard() {
  const session = await auth()
  const sessionUserId = (session?.user as any)?.id
  const sessionName = session?.user?.name || "Patient"

  // Scope to the authenticated patient's profile — no mock/fallback
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: sessionUserId },
    include: { user: true }
  });

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Patient Profile Not Found</p>
      </div>
    )
  }

  const patientId = patient.id;

  // Fetch Parallel Data
  const [nextAppointment, recentAssessment] = await Promise.all([
    prisma.appointment.findFirst({
      where: { 
        patientId,
        scheduledAt: { gt: new Date() },
        status: { not: "CANCELLED" }
      },
      orderBy: { scheduledAt: 'asc' },
      include: { provider: { include: { user: true } } }
    }),
    prisma.assessment.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: { provider: { include: { user: true } } }
    })
  ])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up">
        
        {/* Premium Hero Section - Mobile App Style */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 mb-8 shadow-2xl shadow-slate-100 group animate-in fade-in duration-1000">
          {/* Background Image Layer - App Style */}
          <div className="absolute inset-0 z-0 overflow-hidden">
             {/* Desktop: Right-aligned with radial mask | Mobile: Full-cover watermark */}
             <div 
               className="absolute inset-0 md:left-1/3 lg:left-1/2 opacity-[0.08] md:opacity-100 transition-all duration-1000 group-hover:scale-105 select-none"
               style={{
                 WebkitMaskImage: 'radial-gradient(circle at right, black 30%, transparent 80%)',
                 maskImage: 'radial-gradient(circle at right, black 30%, transparent 80%)'
               }}
             >
                <img 
                  src="/images/patient-bg.png" 
                  alt="Background" 
                  className="w-full h-full object-cover md:object-contain object-right md:object-right"
                />
             </div>
             {/* Decorative Blur Orbs */}
             <div className="absolute top-10 right-10 w-64 h-64 bg-[#67BA2E]/5 rounded-full blur-3xl" />
          </div>

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12">
            <div className="max-w-2xl space-y-6 md:space-y-8 text-center lg:text-left items-center lg:items-start flex flex-col">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-[#67BA2E] font-black text-[9px] md:text-[11px] uppercase tracking-[0.25em] animate-in fade-in slide-in-from-left-4 duration-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67BA2E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#67BA2E]"></span>
                  </span>
                  Good to see you again, 👋
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight animate-in fade-in slide-in-from-left-6 duration-1000">
                    Welcome back,
                    <span className="block text-[#67BA2E] filter drop-shadow-sm">
                      {sessionName}!
                    </span>
                  </h1>
                  <div className="h-1 w-16 bg-[#67BA2E] rounded-full mt-4 mx-auto lg:ml-0 animate-in zoom-in duration-1000 delay-300" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 md:p-5 bg-slate-50/80 backdrop-blur-md rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-100 shadow-sm w-fit animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Calendar className="size-4 md:size-5 text-[#67BA2E]" />
                </div>
                <p className="text-xs md:text-base font-bold text-slate-600 tracking-tight">
                  Your health journey at a glance.
                </p>
              </div>

              {/* Bottom Quick Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">
                 <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3.5 bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded-xl md:rounded-2xl hover:bg-[#67BA2E]/10 transition-all cursor-pointer group/badge">
                    <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm group-hover/badge:scale-110 transition-transform">
                      <Activity className="size-3.5 md:size-4 text-[#67BA2E]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] md:text-[10px] font-black text-[#67BA2E] uppercase tracking-wider leading-none mb-0.5">Vitals</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-700">Active Monitoring</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3.5 bg-blue-50 border border-blue-100 rounded-xl md:rounded-2xl hover:bg-blue-100 transition-all cursor-pointer group/badge">
                    <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm group-hover/badge:scale-110 transition-transform">
                      <Shield className="size-3.5 md:size-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-wider leading-none mb-0.5">Secure Care</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-700">Privacy Protected</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Identity Floating Card (Desktop) */}
            <div className="hidden lg:flex flex-col gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 w-72 animate-in fade-in slide-in-from-right-8 duration-1000 relative">
              <div className="absolute -top-4 -right-4 size-12 bg-[#67BA2E] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                 <Heart className="size-6" />
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#67BA2E] shadow-inner overflow-hidden">
                    <img src="/images/patient-bg.png" alt="ID" className="w-full h-full object-contain opacity-80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Member ID</p>
                    <p className="text-sm font-black text-slate-800 leading-tight uppercase truncate">{patient.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-[#67BA2E] rounded-full border border-green-100">
                    <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Valued Patient</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero: Appointment Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {nextAppointment ? (
              <Card className="rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden border-l-8 border-l-[#67BA2E]">
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#67BA2E]/10 text-[#67BA2E] border-transparent font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                          Upcoming Appointment
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                          {format(new Date(nextAppointment.scheduledAt), "EEEE, MMMM dd")}
                        </h2>
                        <div className="flex items-center gap-4 text-slate-500 font-bold">
                          <span className="flex items-center gap-2">
                            <Clock className="size-5 text-[#67BA2E]" />
                            {format(new Date(nextAppointment.scheduledAt), "hh:mm a")}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-2">
                            <Stethoscope className="size-5 text-[#67BA2E]" />
                            Dr. {nextAppointment.provider.user.lastName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <Button className="h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest text-xs">
                        View Details
                      </Button>
                      <Button variant="outline" className="h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all rounded-xl uppercase tracking-widest text-xs">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[2.5rem] border-slate-200 shadow-xl bg-white overflow-hidden border-dashed border-2">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="size-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="size-8 text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">No upcoming appointments</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Stay proactive about your health by scheduling your next check-up today.</p>
                  </div>
                  <Button asChild className="h-12 px-8 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs gap-2">
                    <Link href="/patient/appointments?openBooking=true">
                      <PlusCircle className="size-4" />
                      Book New Appointment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-xs">
                          {recentAssessment.provider.user.firstName[0]}{recentAssessment.provider.user.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">Dr. {recentAssessment.provider.user.lastName}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(recentAssessment.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                         <p className="text-xs font-bold text-slate-600 italic line-clamp-2 leading-relaxed">
                           "{(recentAssessment.data as any)?.notes?.chiefComplaint || "Routine Wellness Visit"}"
                         </p>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-between h-12 text-[#67BA2E] font-black hover:bg-[#67BA2E]/5 rounded-xl uppercase tracking-widest text-[10px]">
                      Review Encounter
                      <ChevronRight className="size-4" />
                    </Button>
                   </>
                 ) : (
                   <div className="text-center py-8">
                     <AlertCircle className="size-10 text-slate-200 mx-auto mb-3" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No clinical records found</p>
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="space-y-6">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Health Management</h2>
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
    </div>
  </div>
)
}

function QuickLinkCard({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link href={href}>
      <Card className="rounded-[2rem] border-slate-200 hover:shadow-2xl hover:shadow-[#67BA2E]/10 transition-all duration-300 cursor-pointer group bg-white overflow-hidden h-full">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="size-14 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-[#67BA2E] group-hover:bg-[#67BA2E] group-hover:text-white transition-all duration-300 shadow-sm">
            {React.cloneElement(icon as any, { size: 24 })}
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 tracking-tight text-sm uppercase">{title}</h3>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{description}</p>
          </div>
          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="size-4 text-[#67BA2E]" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

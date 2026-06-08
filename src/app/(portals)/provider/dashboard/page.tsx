export const dynamic = "force-dynamic"
export const revalidate = 0

import * as React from "react"
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  CalendarDays,
  ArrowRight,
  Stethoscope,
  LayoutDashboard,
  Activity,
  ChevronRight,
  Shield,
  PlusCircle,
  FileText,
  Heart
} from "lucide-react"
import prisma from "@/lib/prisma"
import { auth } from "../../../../../auth"
import { startOfDay, endOfDay, format } from "date-fns"
import { DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"
import { getProviderDashboardListData } from "@/lib/provider-dashboard-data"
import { ProviderDashboardStatsClient } from "@/components/provider/ProviderDashboardStatsClient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BannerInstallBtn } from "@/components/auth/BannerInstallBtn"
import { formatProviderDisplayName } from "@/lib/format-provider-name"

export default async function ProviderDashboardPage() {
  const session = await auth()
  const sessionUserId = (session?.user as any)?.id

  // Resolve provider profile from the authenticated session user ID
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: sessionUserId },
    include: { user: true }
  })
  
  if (!provider) {
    return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest">Provider Profile Not Found</div>
  }

  const providerDisplayName = formatProviderDisplayName(provider)
  const sessionName = session?.user?.name || providerDisplayName
  const providerFullName = providerDisplayName

  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  // Parallel Data Fetching
  const [appointments, statsCounts, alerts, totalPatientsCount, listData] = await Promise.all([
    // 1. Today's Appointments
    prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    }),

    // 2. Stats Counts
    prisma.appointment.groupBy({
      by: ['status'],
      where: {
        providerId: provider.id,
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _count: true,
    }),

    // 3. Urgent Alerts
    prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        scheduledAt: {
          gte: todayStart,
        },
        OR: [
          { notes: { contains: "Urgent", mode: "insensitive" } },
          { status: "PENDING" }, 
        ],
      },
      include: {
        patient: { include: { user: true } }
      },
      take: 3,
    }),

    // 4. Total Assigned Patients
    prisma.patientProfile.count({
      where: {
        appointments: { some: { providerId: provider.id } }
      }
    }),

    // 5. List data for stat card modals
    getProviderDashboardListData(provider.id),
  ])

  // Process stats
  const totalToday = appointments.length
  const pendingCount = statsCounts.find(s => s.status === 'PENDING')?._count || 0
  const completedCount = statsCounts.find(s => s.status === 'COMPLETED')?._count || 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-bold text-[10px] rounded-full px-2">PENDING</Badge>
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-[#67BA2E]/10 text-[#67BA2E] border-[#67BA2E]/20 font-bold text-[10px] rounded-full px-2">CONFIRMED</Badge>
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold text-[10px] rounded-full px-2">CANCELLED</Badge>
      case "COMPLETED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] rounded-full px-2">COMPLETED</Badge>
      default:
        return <Badge variant="outline" className="text-[10px] rounded-full px-2">{status}</Badge>
    }
  }

  return (
    <div className="animate-slide-up">
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
                src="/images/provider-bg.png" 
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
                Here is your clinical schedule for today.
              </p>
            </div>

            {/* Bottom Quick Stats/Badges */}
            <div className="flex flex-row items-center gap-2 md:gap-3 mt-1.5 w-full md:w-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">
               <BannerInstallBtn />
            </div>
          </div>

          {/* Identity Floating Card (Desktop) */}
          <div className="hidden lg:flex flex-col gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 w-72 animate-in fade-in slide-in-from-right-8 duration-1000 relative">
            <div className="absolute -top-4 -right-4 size-12 bg-[#67BA2E] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <Shield className="size-6" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#67BA2E] shadow-inner overflow-hidden">
                  <img src="/images/provider-bg.png" alt="ID" className="w-full h-full object-contain opacity-80" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Identity Status</p>
                  <p className="text-sm font-black text-slate-800 leading-tight">MEDICAL PROVIDER</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-[#67BA2E] rounded-full border border-green-100">
                  <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">Verified Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex flex-col gap-2 mb-10">
        <h2 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
             <LayoutDashboard className="size-7 text-[#67BA2E]" />
          </div>
          Clinical Overview
        </h2>
        <p className="text-slate-500 font-medium ml-1">Welcome back, {providerFullName}. Here is your schedule for today.</p>
      </div>

      <ProviderDashboardStatsClient
        totalToday={totalToday}
        totalPatientsCount={totalPatientsCount}
        pendingCount={pendingCount}
        listData={listData}
      />

      {/* Main Content: Schedule Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="size-5 text-[#67BA2E]" />
            Today's Appointments
          </h2>
          <Badge variant="outline" className="bg-[#67BA2E]/10 text-[#67BA2E] border-[#67BA2E]/20 font-bold px-3 py-1 rounded-full text-[10px]">
            {totalToday} ENCOUNTERS
          </Badge>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[120px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Time</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Patient Identity</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Reason/Notes</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="px-8 py-5 font-bold text-[#67BA2E] whitespace-nowrap">
                         <div className="flex flex-col">
                            <span className="text-sm">{format(new Date(apt.scheduledAt), DISPLAY_DATE_TIME_FORMAT)}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Enc. ID: {apt.id.slice(0, 5)}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 border border-slate-200 uppercase">
                              {apt.patient.user.firstName[0]}{apt.patient.user.lastName[0]}
                           </div>
                           <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{apt.patient.user.firstName} {apt.patient.user.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500 font-medium line-clamp-1 max-w-[200px]">
                          {apt.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(apt.status)}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        {apt.paymentStatus === "PAID" ? (
                          <Button className="h-9 px-4 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 ml-auto shadow-sm">
                             Start Visit
                             <ChevronRight className="size-3.5" />
                          </Button>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <Button disabled className="h-9 px-4 bg-slate-100 text-slate-400 font-black rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-2 ml-auto border border-slate-200">
                               <Shield className="size-3.5" />
                               Visit Locked
                            </Button>
                            <Badge variant="outline" className="bg-red-50 text-red-500 border-red-100 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                               Payment Pending
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                <CheckCircle2 className="size-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">No appointments scheduled for today.</h3>
              <p className="text-slate-500 font-medium max-w-[300px]">Take a breather! Use this time to catch up on patient records or clinical documentation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Priority Alerts */}
      {alerts.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6 px-1">
            <AlertCircle className="size-5 text-red-500" />
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Clinical Priority Alerts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute -right-2 -top-2 opacity-5 text-red-500 group-hover:scale-110 transition-transform">
                  <AlertCircle size={80} />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-red-50 rounded-xl">
                    <Stethoscope className="size-5 text-red-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgent Encounter</span>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-slate-800">{alert.patient.user.firstName} {alert.patient.user.lastName}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{alert.notes || "Check clinical history for priority notes."}</p>
                </div>
                <Button variant="ghost" className="w-full mt-2 rounded-xl text-red-500 font-bold text-xs bg-red-50 hover:bg-red-100 transition-all">
                  Review Records
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

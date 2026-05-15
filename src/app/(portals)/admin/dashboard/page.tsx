import * as React from "react"
import prisma from "@/lib/prisma"
import { auth } from "../../../../../auth"
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Clock, 
  ChevronRight,
  LayoutDashboard,
  ArrowUpRight,
  Activity,
  HeartPulse,
  Monitor,
  Shield,
  CheckCircle2,
  TrendingUp,
  User
} from "lucide-react"
import { format, startOfDay, endOfDay } from "date-fns"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { MFASetupModal } from "@/components/auth/MFASetupModal"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await auth()
  const userName = session?.user?.name || "Admin"

  const [
    totalPatients, 
    totalProviders, 
    totalAppointments, 
    todaysAppointmentsCount, 
    upcomingAppointments
  ] = await Promise.all([
    prisma.patientProfile.count(),
    prisma.providerProfile.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ 
      where: { 
        scheduledAt: { 
          gte: startOfDay(new Date()), 
          lte: endOfDay(new Date()) 
        } 
      } 
    }),
    prisma.appointment.findMany({ 
      where: { 
        scheduledAt: { gte: new Date() },
        status: { not: "CANCELLED" }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: { 
        patient: { include: { user: true } }, 
        provider: { include: { user: true } } 
      } 
    })
  ]);

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

  const stats = [
    { title: "Patients", value: totalPatients, icon: Users, color: "text-[#67BA2E]", bg: "bg-[#67BA2E]/10", border: "border-[#67BA2E]/20" },
    { title: "Providers", value: totalProviders, icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "Bookings", value: totalAppointments, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { title: "Today", value: todaysAppointmentsCount, icon: Clock, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ]

  return (
    <div className="animate-slide-up pb-24 md:pb-10">
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
                src="/images/admin-bg.png" 
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
                    {userName}!
                  </span>
                </h1>
                <div className="h-1 w-16 bg-[#67BA2E] rounded-full mt-4 mx-auto lg:ml-0 animate-in zoom-in duration-1000 delay-300" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 md:p-5 bg-slate-50/80 backdrop-blur-md rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-100 shadow-sm w-fit animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Activity className="size-4 md:size-5 text-[#67BA2E]" />
              </div>
              <p className="text-xs md:text-base font-bold text-slate-600 tracking-tight">
                Here is what&apos;s happening in your clinic today.
              </p>
            </div>

            {/* Bottom Quick Stats/Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">
               <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3.5 bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded-xl md:rounded-2xl hover:bg-[#67BA2E]/10 transition-all cursor-pointer group/badge">
                  <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm group-hover/badge:scale-110 transition-transform">
                    <TrendingUp className="size-3.5 md:size-4 text-[#67BA2E]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] md:text-[10px] font-black text-[#67BA2E] uppercase tracking-wider leading-none mb-0.5">Systems</p>
                    <p className="text-[10px] md:text-xs font-bold text-slate-700">All Nodes Active</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3.5 bg-blue-50 border border-blue-100 rounded-xl md:rounded-2xl hover:bg-blue-100 transition-all cursor-pointer group/badge">
                  <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm group-hover/badge:scale-110 transition-transform">
                    <User className="size-3.5 md:size-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-wider leading-none mb-0.5">Admin Control</p>
                    <p className="text-[10px] md:text-xs font-bold text-slate-700">Full Access Verified</p>
                  </div>
               </div>
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
                  <img src="/images/admin-bg.png" alt="ID" className="w-full h-full object-contain opacity-80" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Access Level</p>
                  <p className="text-sm font-black text-slate-800 leading-tight uppercase">Administrator</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-[#67BA2E] rounded-full border border-green-100">
                  <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">Verified Session</span>
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
          Dashboard Overview
        </h2>
        <p className="text-slate-500 font-medium ml-1">Real-time health of your clinical platform.</p>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`relative p-5 md:p-6 rounded-[2rem] bg-white border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden`}>
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
               <stat.icon size={100} />
            </div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className={`size-10 md:size-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                <stat.icon size={20} className="md:size-24" />
                <stat.icon className="size-5 md:size-6" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                  <ArrowUpRight size={14} className={stat.color} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Section - Harmonized with List Pages */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="size-5 text-[#67BA2E]" />
            Upcoming Appointments
          </h2>
          <Link href="/admin/appointments">
            <Button variant="link" className="text-[#67BA2E] font-bold text-xs uppercase tracking-widest gap-1 hover:no-underline">
              View Schedule <ChevronRight size={14} />
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[180px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Scheduled Time</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Patient Identity</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Assigned Doctor</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <TableRow key={apt.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="px-8 py-5 font-bold text-slate-700 whitespace-nowrap">
                         <div className="flex flex-col">
                            <span className="text-sm text-slate-800">{format(new Date(apt.scheduledAt), "MMM dd, yyyy")}</span>
                            <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-wider mt-1">{format(new Date(apt.scheduledAt), "hh:mm a")}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 border border-slate-200">
                              {apt.patient.user.firstName[0]}{apt.patient.user.lastName[0]}
                           </div>
                           <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{apt.patient.user.firstName} {apt.patient.user.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm whitespace-nowrap">
                           <Stethoscope size={14} className="text-[#67BA2E]" />
                           Dr. {apt.provider.user.firstName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(apt.status)}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Link href={`/admin/appointments`}>
                           <Button variant="ghost" size="sm" className="size-9 p-0 rounded-xl hover:bg-emerald-50 text-[#67BA2E] border border-transparent hover:border-emerald-100 transition-all">
                              <ChevronRight size={18} />
                           </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] bg-slate-50/20">
                      Registry is empty for upcoming encounters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>


    </div>
  )
}

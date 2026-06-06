export const dynamic = "force-dynamic"
export const revalidate = 0

import * as React from "react"
import { Suspense } from "react"
import { auth } from "../../../../../auth"
import {
  LayoutDashboard,
  Activity,
  Shield,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import {
  AdminDashboardStats,
  AdminDashboardStatsSkeleton,
} from "@/components/admin/AdminDashboardStats"
import {
  AdminUpcomingAppointments,
  AdminUpcomingAppointmentsSkeleton,
} from "@/components/admin/AdminUpcomingAppointments"
import { BannerInstallBtn } from "@/components/auth/BannerInstallBtn"

export default async function AdminDashboardPage() {
  const session = await auth()
  const userName = session?.user?.name || "Admin"

  return (
    <div className="animate-slide-up">
      <AdminDashboardHero userName={userName} />

      <div className="flex flex-col gap-2 mb-10">
        <h2 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
            <LayoutDashboard className="size-7 text-[#67BA2E]" />
          </div>
          Dashboard Overview
        </h2>
        <p className="text-slate-500 font-medium ml-1">
          Real-time health of your clinical platform.
        </p>
      </div>

      <Suspense fallback={<AdminDashboardStatsSkeleton />}>
        <AdminDashboardStats />
      </Suspense>

      <Suspense fallback={<AdminUpcomingAppointmentsSkeleton />}>
        <AdminUpcomingAppointments />
      </Suspense>
    </div>
  )
}

function AdminDashboardHero({ userName }: { userName: string }) {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 mb-8 shadow-2xl shadow-slate-100 group animate-in fade-in duration-1000">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 md:left-1/3 lg:left-1/2 opacity-[0.08] md:opacity-100 transition-all duration-1000 group-hover:scale-105 select-none"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at right, black 30%, transparent 80%)",
            maskImage:
              "radial-gradient(circle at right, black 30%, transparent 80%)",
          }}
        >
          <img
            src="/images/admin-bg.png"
            alt="Background"
            className="w-full h-full object-cover md:object-contain object-right md:object-right"
          />
        </div>
        <HeroBlurOrb />
      </div>

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

          <div className="flex flex-row items-center gap-2 md:gap-3 mt-1.5 w-full md:w-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">
            <div className="flex-1 md:flex-initial w-1/2 md:w-auto flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3.5 bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded-xl md:rounded-2xl hover:bg-[#67BA2E]/10 transition-all cursor-pointer group/badge">
              <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm group-hover/badge:scale-110 transition-transform">
                <TrendingUp className="size-3.5 md:size-4 text-[#67BA2E]" />
              </div>
              <div className="text-left">
                <p className="text-[8px] md:text-[10px] font-black text-[#67BA2E] uppercase tracking-wider leading-none mb-0.5">
                  Systems
                </p>
                <p className="text-[10px] md:text-xs font-bold text-slate-700">
                  All Nodes Active
                </p>
              </div>
            </div>

            <BannerInstallBtn />
          </div>
        </div>

        <AdminIdentityCard />
      </div>
    </div>
  )
}

function HeroBlurOrb() {
  return (
    <div className="absolute top-10 right-10 w-64 h-64 bg-[#67BA2E]/5 rounded-full blur-3xl" />
  )
}

function AdminIdentityCard() {
  return (
    <div className="hidden lg:flex flex-col gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 w-72 animate-in fade-in slide-in-from-right-8 duration-1000 relative">
      <div className="absolute -top-4 -right-4 size-12 bg-[#67BA2E] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
        <Shield className="size-6" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#67BA2E] shadow-inner overflow-hidden">
            <img
              src="/images/admin-bg.png"
              alt="ID"
              className="w-full h-full object-contain opacity-80"
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Access Level
            </p>
            <p className="text-sm font-black text-slate-800 leading-tight uppercase">
              Administrator
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-[#67BA2E] rounded-full border border-green-100">
            <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
              Verified Session
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

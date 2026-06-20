"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  HEALTH_CATEGORY_CONFIG,
  getHealthCategoryCount,
} from "@/lib/patient-health-categories"
import type { PatientHealthData } from "@/types/patient-health"

interface PatientHealthTabsProps {
  diagnoses: string[]
  medications: string[]
  allergies: string[]
  vitalSigns: PatientHealthData["vitalSigns"]
}

export function PatientHealthTabs({
  diagnoses,
  medications,
  allergies,
  vitalSigns,
}: PatientHealthTabsProps) {
  const pathname = usePathname()
  const healthData: PatientHealthData = {
    diagnoses,
    medications,
    allergies,
    vitalSigns,
  }

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] border border-slate-200/90 bg-white/90 backdrop-blur-md shadow-[0_8px_32px_-8px_rgba(103,186,46,0.12)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 0% 0%, rgba(209,250,229,0.35) 0%, transparent 55%), radial-gradient(ellipse 60% 70% at 100% 100%, rgba(204,251,241,0.3) 0%, transparent 50%)",
        }}
      />

      <div className="relative px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 lg:px-6">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <div>
            <p className="text-[10px] font-black text-[#67BA2E] uppercase tracking-[0.22em]">
              Health Overview
            </p>
            <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight mt-0.5">
              My Clinical History
            </h2>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Tap to open full view
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {Object.values(HEALTH_CATEGORY_CONFIG).map((tab) => {
            const Icon = tab.icon
            const count = getHealthCategoryCount(tab.key, healthData)
            const href = `/patient/records/health/${tab.key}`
            const isActive = pathname === href

            return (
              <Link
                key={tab.key}
                href={href}
                className="group relative w-full text-left block"
              >
                <div
                  className={cn(
                    "flex h-full min-h-[5.5rem] sm:min-h-[6.25rem] flex-col justify-between rounded-2xl border p-3 sm:p-4 transition-all duration-300",
                    "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
                    isActive
                      ? "border-[#67BA2E]/40 bg-gradient-to-br from-[#67BA2E] to-[#4fa824] text-white shadow-lg shadow-emerald-200/50"
                      : cn(
                          "border-slate-200/90 bg-white/95 hover:border-[#67BA2E]/25 hover:bg-emerald-50/40",
                          tab.accentBorder
                        )
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        "flex size-9 sm:size-10 items-center justify-center rounded-xl border transition-colors",
                        isActive
                          ? "border-white/25 bg-white/20 text-white"
                          : cn(tab.accentBg, tab.accent, tab.accentBorder)
                      )}
                    >
                      <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={2.25} />
                    </div>
                    <span
                      className={cn(
                        "inline-flex min-w-[1.75rem] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-[#67BA2E]/10 group-hover:text-[#67BA2E]"
                      )}
                    >
                      {count}
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-1">
                    <div className="text-left min-w-0">
                      <p
                        className={cn(
                          "text-[10px] sm:text-xs font-black uppercase tracking-wide leading-tight line-clamp-2",
                          isActive ? "text-white" : "text-slate-800"
                        )}
                      >
                        {tab.label}
                      </p>
                      <p
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider mt-0.5",
                          isActive ? "text-white/75" : "text-slate-400"
                        )}
                      >
                        {count === 1 ? "1 record" : `${count} records`}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "size-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5",
                        isActive ? "text-white/90" : "text-slate-300 group-hover:text-[#67BA2E]"
                      )}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Re-export for consumers that imported VitalSignEntry from here
export type { VitalSignEntry } from "@/types/patient-health"

"use client"

import * as React from "react"
import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import {
  Stethoscope,
  Pill,
  Activity,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PaginatedListModal } from "@/components/ui/paginated-list-modal"
import { DashboardListModal } from "@/components/ui/dashboard-list-modal"

export type HealthTab = "diagnosis" | "medications" | "vitals" | "allergies"

export interface VitalSignEntry {
  date: string
  bp?: string
  hr?: string
  temp?: string
  weight?: string
}

interface PatientHealthTabsProps {
  diagnoses: string[]
  medications: string[]
  allergies: string[]
  vitalSigns: VitalSignEntry[]
}

const TAB_CONFIG: {
  key: HealthTab
  label: string
  icon: typeof Stethoscope
  accent: string
  accentBg: string
  accentBorder: string
}[] = [
  {
    key: "diagnosis",
    label: "Diagnosis",
    icon: Stethoscope,
    accent: "text-emerald-700",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200/80",
  },
  {
    key: "medications",
    label: "Medications",
    icon: Pill,
    accent: "text-teal-700",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200/80",
  },
  {
    key: "vitals",
    label: "Vital Signs",
    icon: Activity,
    accent: "text-sky-700",
    accentBg: "bg-sky-50",
    accentBorder: "border-sky-200/80",
  },
  {
    key: "allergies",
    label: "Allergies",
    icon: AlertTriangle,
    accent: "text-amber-700",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200/80",
  },
]

function getTabCount(key: HealthTab, props: PatientHealthTabsProps): number {
  switch (key) {
    case "diagnosis":
      return props.diagnoses.length
    case "medications":
      return props.medications.length
    case "vitals":
      return props.vitalSigns.length
    case "allergies":
      return props.allergies.length
  }
}

export function PatientHealthTabs({
  diagnoses,
  medications,
  allergies,
  vitalSigns,
}: PatientHealthTabsProps) {
  const [activeTab, setActiveTab] = React.useState<HealthTab | null>(null)
  const healthProps = { diagnoses, medications, allergies, vitalSigns }

  const vitalItems = vitalSigns.map((v) => (
    <div
      key={v.date}
      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#67BA2E]/30 transition-colors"
    >
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        {format(new Date(v.date), DISPLAY_DATE_FORMAT)}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {v.bp && (
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">BP</p>
            <p className="text-sm font-bold text-slate-800">{v.bp}</p>
          </div>
        )}
        {v.hr && (
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Heart Rate</p>
            <p className="text-sm font-bold text-slate-800">{v.hr}</p>
          </div>
        )}
        {v.temp && (
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Temp</p>
            <p className="text-sm font-bold text-slate-800">{v.temp}</p>
          </div>
        )}
        {v.weight && (
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Weight</p>
            <p className="text-sm font-bold text-slate-800">{v.weight}</p>
          </div>
        )}
      </div>
    </div>
  ))

  const activeConfig = TAB_CONFIG.find((t) => t.key === activeTab)

  return (
    <>
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
              Tap to view details
            </span>
          </div>

          {/* Mobile & tablet: 2×2 grid | Laptop: single row of 4 */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon
              const count = getTabCount(tab.key, healthProps)
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="group relative w-full text-left"
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
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {activeTab && activeTab !== "vitals" && activeConfig && (
        <PaginatedListModal
          isOpen={true}
          onClose={() => setActiveTab(null)}
          title={activeConfig.label}
          icon={activeConfig.icon}
          items={
            activeTab === "diagnosis"
              ? diagnoses
              : activeTab === "medications"
                ? medications
                : allergies
          }
        />
      )}

      {activeTab === "vitals" && (
        <DashboardListModal
          isOpen={true}
          onClose={() => setActiveTab(null)}
          title="Vital Signs History"
          icon={Activity}
          items={vitalItems}
          emptyMessage="No vital signs recorded yet"
        />
      )}
    </>
  )
}

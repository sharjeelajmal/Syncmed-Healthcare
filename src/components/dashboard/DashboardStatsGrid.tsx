"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"
import { DashboardListModal } from "@/components/ui/dashboard-list-modal"

export interface DashboardStatConfig {
  key: string
  title: string
  value: number
  icon: LucideIcon
  color: string
  bg: string
  border: string
  listTitle: string
  listItems: React.ReactNode[]
}

interface DashboardStatsGridProps {
  stats: DashboardStatConfig[]
  columns?: "2-4" | "1-3"
}

export function DashboardStatsGrid({ stats, columns = "2-4" }: DashboardStatsGridProps) {
  const [activeKey, setActiveKey] = React.useState<string | null>(null)

  const activeStat = stats.find((s) => s.key === activeKey)
  const gridClass =
    columns === "1-3"
      ? "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      : "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"

  return (
    <>
      <div className={gridClass}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => setActiveKey(stat.key)}
              className={`relative p-5 md:p-6 rounded-[2rem] bg-white border ${stat.border} shadow-sm hover:shadow-md hover:border-[#67BA2E]/30 transition-all duration-300 group overflow-hidden text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#67BA2E]/40`}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Icon size={100} />
              </div>
              <div className="flex flex-col gap-4 relative z-10">
                <div
                  className={`size-10 md:size-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110 duration-500`}
                >
                  <Icon className="size-5 md:size-6" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">
                      {stat.value}
                    </h3>
                    <ArrowUpRight
                      size={14}
                      className={`${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {activeStat && (
        <DashboardListModal
          isOpen={activeKey !== null}
          onClose={() => setActiveKey(null)}
          title={activeStat.listTitle}
          icon={activeStat.icon}
          items={activeStat.listItems}
        />
      )}
    </>
  )
}

export function DashboardStatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative p-5 md:p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm animate-pulse"
        >
          <div className="flex flex-col gap-4">
            <div className="size-10 md:size-12 rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-slate-100" />
              <div className="h-8 w-12 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

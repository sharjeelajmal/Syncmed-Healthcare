"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar, User, Clock } from "lucide-react"
import { DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"
import { Badge } from "@/components/ui/badge"
import {
  DashboardStatsGrid,
  type DashboardStatConfig,
} from "@/components/dashboard/DashboardStatsGrid"

interface ProviderDashboardStatsClientProps {
  totalToday: number
  totalPatientsCount: number
  pendingCount: number
  listData: {
    todaysAppointments: {
      id: string
      status: string
      scheduledAt: Date
      notes: string | null
      patient: { user: { firstName: string; lastName: string } }
    }[]
    patients: {
      id: string
      user: { firstName: string; lastName: string }
    }[]
    pendingAppointments: {
      id: string
      scheduledAt: Date
      notes: string | null
      patient: { user: { firstName: string; lastName: string } }
    }[]
  }
}

function ListRow({
  title,
  subtitle,
  badge,
}: {
  title: string
  subtitle: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#67BA2E]/30 transition-colors">
      <div>
        <p className="font-bold text-slate-800 text-sm">{title}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
      </div>
      {badge}
    </div>
  )
}

export function ProviderDashboardStatsClient({
  totalToday,
  totalPatientsCount,
  pendingCount,
  listData,
}: ProviderDashboardStatsClientProps) {
  const todayItems = listData.todaysAppointments.map((a) => (
    <ListRow
      key={a.id}
      title={`${a.patient.user.firstName} ${a.patient.user.lastName}`}
      subtitle={`${format(new Date(a.scheduledAt), DISPLAY_DATE_TIME_FORMAT)}${a.notes ? ` · ${a.notes}` : ""}`}
      badge={
        <Badge variant="outline" className="font-bold text-[10px] uppercase">
          {a.status}
        </Badge>
      }
    />
  ))

  const patientItems = listData.patients.map((p) => (
    <ListRow
      key={p.id}
      title={`${p.user.firstName} ${p.user.lastName}`}
      subtitle={`Patient ID: ${p.id.slice(0, 8).toUpperCase()}`}
    />
  ))

  const pendingItems = listData.pendingAppointments.map((a) => (
    <ListRow
      key={a.id}
      title={`${a.patient.user.firstName} ${a.patient.user.lastName}`}
      subtitle={`${format(new Date(a.scheduledAt), DISPLAY_DATE_TIME_FORMAT)}${a.notes ? ` · ${a.notes}` : ""}`}
      badge={
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[10px] uppercase">
          Pending
        </Badge>
      }
    />
  ))

  const stats: DashboardStatConfig[] = [
    {
      key: "today",
      title: "Today's Total",
      value: totalToday,
      icon: Calendar,
      color: "text-[#67BA2E]",
      bg: "bg-[#67BA2E]/10",
      border: "border-[#67BA2E]/20",
      listTitle: "Today's Appointments",
      listItems: todayItems,
    },
    {
      key: "patients",
      title: "Total Patients",
      value: totalPatientsCount,
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      listTitle: "Your Patients",
      listItems: patientItems,
    },
    {
      key: "pending",
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      listTitle: "Pending Appointments",
      listItems: pendingItems,
    },
  ]

  return <DashboardStatsGrid stats={stats} columns="1-3" />
}

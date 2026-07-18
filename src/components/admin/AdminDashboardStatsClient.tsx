"use client"

import * as React from "react"
import { format } from "date-fns"
import { Users, Stethoscope, Calendar, Clock } from "lucide-react"
import { DISPLAY_DATE_FORMAT, DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"
import { formatProviderDisplayName } from "@/lib/format-provider-name"
import { Badge } from "@/components/ui/badge"
import { MembershipTierBadge } from "@/components/ui/membership-tier-badge"
import {
  DashboardStatsGrid,
  type DashboardStatConfig,
} from "@/components/dashboard/DashboardStatsGrid"
import type { AdminDashboardStatsData } from "@/lib/admin-dashboard-data"

interface AdminDashboardStatsClientProps {
  statsData: AdminDashboardStatsData
  listData: {
    patients: {
      id: string
      membershipStatus: string
      user: { firstName: string; lastName: string; createdAt: Date }
    }[]
    providers: {
      id: string
      specialty: string
      user: { firstName: string; lastName: string; createdAt: Date }
    }[]
    appointments: {
      id: string
      status: string
      scheduledAt: Date
      patient: { user: { firstName: string; lastName: string } }
      provider: { user: { firstName: string; lastName: string }; specialty: string }
    }[]
    todaysAppointments: {
      id: string
      status: string
      scheduledAt: Date
      patient: { user: { firstName: string; lastName: string } }
      provider: { user: { firstName: string; lastName: string }; specialty: string }
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

export function AdminDashboardStatsClient({
  statsData,
  listData,
}: AdminDashboardStatsClientProps) {
  const patientItems = listData.patients.map((p) => (
    <ListRow
      key={p.id}
      title={`${p.user.firstName} ${p.user.lastName}`}
      subtitle={`Joined ${format(new Date(p.user.createdAt), DISPLAY_DATE_FORMAT)}`}
      badge={<MembershipTierBadge tier={p.membershipStatus} size="sm" />}
    />
  ))

  const providerItems = listData.providers.map((p) => (
    <ListRow
      key={p.id}
      title={formatProviderDisplayName(p)}
      subtitle={`${p.specialty} · Joined ${format(new Date(p.user.createdAt), DISPLAY_DATE_FORMAT)}`}
    />
  ))

  const appointmentItems = listData.appointments.map((a) => (
    <ListRow
      key={a.id}
      title={`${a.patient.user.firstName} ${a.patient.user.lastName}`}
      subtitle={`${formatProviderDisplayName(a.provider)} · ${format(new Date(a.scheduledAt), DISPLAY_DATE_TIME_FORMAT)}`}
      badge={
        <Badge variant="outline" className="font-bold text-[10px] uppercase">
          {a.status}
        </Badge>
      }
    />
  ))

  const todayItems = listData.todaysAppointments.map((a) => (
    <ListRow
      key={a.id}
      title={`${a.patient.user.firstName} ${a.patient.user.lastName}`}
      subtitle={`${format(new Date(a.scheduledAt), DISPLAY_DATE_TIME_FORMAT)} · ${formatProviderDisplayName(a.provider)}`}
      badge={
        <Badge variant="outline" className="font-bold text-[10px] uppercase">
          {a.status}
        </Badge>
      }
    />
  ))

  const stats: DashboardStatConfig[] = [
    {
      key: "patients",
      title: "Patients",
      value: statsData.totalPatients,
      icon: Users,
      color: "text-[#67BA2E]",
      bg: "bg-[#67BA2E]/10",
      border: "border-[#67BA2E]/20",
      listTitle: "All Patients",
      listItems: patientItems,
    },
    {
      key: "providers",
      title: "Providers",
      value: statsData.totalProviders,
      icon: Stethoscope,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      listTitle: "All Providers",
      listItems: providerItems,
    },
    {
      key: "bookings",
      title: "Bookings",
      value: statsData.totalAppointments,
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
      listTitle: "All Bookings",
      listItems: appointmentItems,
    },
    {
      key: "today",
      title: "Today",
      value: statsData.todaysAppointmentsCount,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      listTitle: "Today's Appointments",
      listItems: todayItems,
    },
  ]

  return <DashboardStatsGrid stats={stats} />
}

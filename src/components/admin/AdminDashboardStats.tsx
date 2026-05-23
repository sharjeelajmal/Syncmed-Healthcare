import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react"
import { getAdminDashboardStats } from "@/lib/admin-dashboard-data"

export async function AdminDashboardStats() {
  const statsData = await getAdminDashboardStats()

  const stats = [
    {
      title: "Patients",
      value: statsData.totalPatients,
      icon: Users,
      color: "text-[#67BA2E]",
      bg: "bg-[#67BA2E]/10",
      border: "border-[#67BA2E]/20",
    },
    {
      title: "Providers",
      value: statsData.totalProviders,
      icon: Stethoscope,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      title: "Bookings",
      value: statsData.totalAppointments,
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    {
      title: "Today",
      value: statsData.todaysAppointmentsCount,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <StatCard key={i} stat={stat} Icon={Icon} />
        )
      })}
    </div>
  )
}

function StatCard({
  stat,
  Icon,
}: {
  stat: {
    title: string
    value: number
    color: string
    bg: string
    border: string
  }
  Icon: typeof Users
}) {
  return (
    <div
      className={`relative p-5 md:p-6 rounded-[2rem] bg-white border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden`}
    >
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
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
            <ArrowUpRight size={14} className={stat.color} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
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

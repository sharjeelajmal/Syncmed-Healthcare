import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { formatProviderDisplayName } from "@/lib/format-provider-name"
import Link from "next/link"
import { Activity, ChevronRight, Stethoscope } from "lucide-react"
import { getAdminUpcomingAppointments } from "@/lib/admin-dashboard-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200 font-bold text-[10px] rounded-full px-2"
        >
          PENDING
        </Badge>
      )
    case "CONFIRMED":
      return (
        <Badge
          variant="outline"
          className="bg-[#67BA2E]/10 text-[#67BA2E] border-[#67BA2E]/20 font-bold text-[10px] rounded-full px-2"
        >
          CONFIRMED
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 font-bold text-[10px] rounded-full px-2"
        >
          CANCELLED
        </Badge>
      )
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] rounded-full px-2"
        >
          COMPLETED
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px] rounded-full px-2">
          {status}
        </Badge>
      )
  }
}

export async function AdminUpcomingAppointments() {
  const upcomingAppointments = await getAdminUpcomingAppointments()

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Activity className="size-5 text-[#67BA2E]" />
          Upcoming Appointments
        </h2>
        <Link href="/admin/appointments">
          <Button
            variant="link"
            className="text-[#67BA2E] font-bold text-xs uppercase tracking-widest gap-1 hover:no-underline"
          >
            View Schedule <ChevronRight size={14} />
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[180px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">
                  Scheduled Time
                </TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">
                  Patient Identity
                </TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">
                  Assigned Doctor
                </TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">
                  Status
                </TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <TableRow
                    key={apt.id}
                    className="group hover:bg-slate-50/50 transition-colors border-slate-100"
                  >
                    <TableCell className="px-8 py-5 font-bold text-slate-700 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-800">
                          {format(new Date(apt.scheduledAt), DISPLAY_DATE_FORMAT)}
                        </span>
                        <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-wider mt-1">
                          {format(new Date(apt.scheduledAt), "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <PatientAvatar apt={apt} />
                        <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                          {apt.patient.user.firstName} {apt.patient.user.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm whitespace-nowrap">
                        <Stethoscope size={14} className="text-[#67BA2E]" />
                        {formatProviderDisplayName(apt.provider)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell className="text-right px-8">
                      <Link href="/admin/appointments">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-9 p-0 rounded-xl hover:bg-emerald-50 text-[#67BA2E] border border-transparent hover:border-emerald-100 transition-all"
                        >
                          <ChevronRight size={18} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] bg-slate-50/20"
                  >
                    Registry is empty for upcoming encounters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function PatientAvatar({
  apt,
}: {
  apt: Awaited<ReturnType<typeof getAdminUpcomingAppointments>>[number]
}) {
  return (
    <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 border border-slate-200">
      {apt.patient.user.firstName[0]}
      {apt.patient.user.lastName[0]}
    </div>
  )
}

export function AdminUpcomingAppointmentsSkeleton() {
  return (
    <div className="mt-12 animate-pulse">
      <div className="flex items-center justify-between mb-6 px-1">
        <SkeletonLine className="h-6 w-56" />
        <SkeletonLine className="h-4 w-28" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonLine key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}

function SkeletonLine({ className }: { className: string }) {
  return <div className={`rounded bg-slate-100 ${className}`} />
}

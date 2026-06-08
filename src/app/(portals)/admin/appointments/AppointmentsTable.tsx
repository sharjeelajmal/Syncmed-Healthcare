"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns";
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format";
import { formatProviderDisplayName } from "@/lib/format-provider-name";

import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Check,
  Ban,
  Stethoscope,
  Loader2,
  MoreVertical,
  FileText,
  Filter
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AnimatedTableBody } from "@/components/ui/animated-table-body"
import { Badge } from "@/components/ui/badge"
import { updateAppointmentStatusAction } from "@/app/actions/appointment.actions"
import { DebouncedSearch } from "@/components/ui/debounced-search"
import { ServerTablePagination } from "@/components/ui/server-table-pagination"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { VerifyReceiptModal } from "@/components/ui/verify-receipt-modal"
import { Checkbox } from "@/components/ui/checkbox"

interface AppointmentsTableProps {
  appointments: any[]
  totalItems: number
  currentPage: number
  showPaid: boolean
}

export function AppointmentsTable({
  appointments,
  totalItems,
  currentPage,
  showPaid,
}: AppointmentsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = React.useTransition()
  const [receiptModalAppt, setReceiptModalAppt] = React.useState<any>(null)

  const handleStatusUpdate = (id: string, status: string) => {
    startTransition(async () => {
      const res = await updateAppointmentStatusAction(id, status)
      if (res.success) {
        toast.success(`Appointment marked as ${status.toLowerCase()}`)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update status")
      }
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
            PENDING
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="bg-[#67BA2E]/20 text-[#67BA2E] border-[#67BA2E]/30 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
            CONFIRMED
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
            CANCELLED
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
            COMPLETED
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
            SCHEDULED
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (appt: any) => {
    if (appt.paymentStatus === 'VERIFICATION_PENDING') {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider animate-pulse">
          REVIEW PENDING
        </Badge>
      )
    }
    if (appt.paymentStatus === 'PAID') {
      return (
        <Badge variant="outline" className="bg-[#67BA2E]/10 text-[#67BA2E] border-[#67BA2E]/20 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
          PAID
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-400 border-slate-200 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
        UNPAID
      </Badge>
    )
  }

  const [direction, setDirection] = React.useState(1)
  const prevPage = React.useRef(currentPage)

  React.useEffect(() => {
    setDirection(currentPage > prevPage.current ? 1 : -1)
    prevPage.current = currentPage
  }, [currentPage])

  const toggleShowPaid = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      params.delete("showPaid")
    } else {
      params.set("showPaid", "false")
    }
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1 max-w-4xl">
          <DebouncedSearch placeholder="Search by patient or doctor name..." />
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Checkbox 
              id="showPaid" 
              checked={showPaid} 
              onCheckedChange={(checked) => toggleShowPaid(!!checked)}
              className="border-slate-300 data-[state=checked]:bg-[#67BA2E] data-[state=checked]:border-[#67BA2E]"
            />
            <label htmlFor="showPaid" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">
              Show Paid Encounters
            </label>
          </div>
        </div>
        <Link href="/admin/appointments/new" className="w-full md:w-auto">
          <Button className="h-12 w-full md:px-8 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
            <Plus className="size-5" />
            Book Appointment
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm mt-6">
        <div className="overflow-x-auto overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[200px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-6">Date & Time</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Patient Name</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Assigned Doctor</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Status</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Payment</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <AnimatedTableBody pageKey={currentPage} direction={direction}>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                    <TableCell className="px-6 py-4 font-bold text-slate-700">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2">
                          <Calendar className="size-3 text-[#67BA2E]" />
                          {format(new Date(appointment.scheduledAt), DISPLAY_DATE_FORMAT)}
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-1 uppercase">
                          <Clock className="size-3" />
                          {format(new Date(appointment.scheduledAt), "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                          {appointment.patient.user.firstName[0]}
                        </div>
                        <span className="font-bold text-slate-700">{appointment.patient.user.firstName} {appointment.patient.user.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Stethoscope className="size-4 text-[#67BA2E]" />
                        {formatProviderDisplayName(appointment.provider)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      {getPaymentBadge(appointment)}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="size-8 p-0 rounded-full hover:bg-slate-100" disabled={isPending}>
                            {isPending ? <Loader2 className="size-4 animate-spin text-slate-400" /> : <MoreVertical className="size-4 text-slate-400" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl border-slate-100 bg-white z-[9999]">
                          <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Clinical Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          {appointment.paymentStatus === 'VERIFICATION_PENDING' && (
                            <>
                              <DropdownMenuItem 
                                className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-amber-600 hover:bg-amber-50 focus:bg-amber-50 transition-all"
                                onClick={() => setReceiptModalAppt(appointment)}
                              >
                                <FileText className="size-4" />
                                Review Receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-100" />
                            </>
                          )}
                          <DropdownMenuItem 
                            className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#67BA2E] focus:bg-emerald-50 focus:text-[#67BA2E] transition-all"
                            onClick={() => handleStatusUpdate(appointment.id, "CONFIRMED")}
                          >
                            <Check className="size-4" />
                            Confirm Appointment
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 transition-all"
                            onClick={() => handleStatusUpdate(appointment.id, "COMPLETED")}
                          >
                            <CheckCircle2 className="size-4" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          <DropdownMenuItem 
                            className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-red-600 hover:bg-red-50 focus:bg-red-50 transition-all"
                            onClick={() => handleStatusUpdate(appointment.id, "CANCELLED")}
                          >
                            <Ban className="size-4" />
                            Cancel Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold">
                    No clinical encounters matched your search.
                  </TableCell>
                </TableRow>
              )}
            </AnimatedTableBody>
          </Table>
        </div>
        <ServerTablePagination
          currentPage={currentPage}
          totalItems={totalItems}
        />
      </div>

      <VerifyReceiptModal 
        isOpen={!!receiptModalAppt}
        onClose={() => setReceiptModalAppt(null)}
        appointment={receiptModalAppt}
      />
    </div>
  )
}

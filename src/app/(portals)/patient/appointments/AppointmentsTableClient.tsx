"use client"

import * as React from "react"
import { format } from "date-fns"
import { 
  Bell, 
  Clock, 
  ChevronRight,
} from "lucide-react"

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
import { AppointmentDetailsModal } from "@/components/ui/appointment-details-modal"

interface AppointmentsTableClientProps {
  appointments: any[]
}

export function AppointmentsTableClient({ appointments }: AppointmentsTableClientProps) {
  const [selectedAppt, setSelectedAppt] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">Pending</Badge>
      case "CONFIRMED": return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">Confirmed</Badge>
      case "SCHEDULED": return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">Scheduled</Badge>
      case "COMPLETED": return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">Completed</Badge>
      case "CANCELLED": return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">Cancelled</Badge>
      default: return <Badge className="font-black text-[10px] uppercase tracking-widest">{status}</Badge>
    }
  }

  const handleViewDetails = (appt: any) => {
    setSelectedAppt(appt)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[300px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Date & Time</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Doctor / Provider</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((app) => (
                <TableRow key={app.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                         <Bell className="size-5" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-slate-700 text-sm">{format(new Date(app.scheduledAt), "MMM dd, yyyy")}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                           <Clock className="size-3" />
                           {format(new Date(app.scheduledAt), "hh:mm a")}
                         </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-sm border border-[#67BA2E]/20 shadow-inner">
                          {app.provider.user.firstName[0]}{app.provider.user.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-base leading-tight">Dr. {app.provider.user.firstName} {app.provider.user.lastName}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{app.provider.specialty}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     {getStatusBadge(app.status)}
                  </TableCell>
                  <TableCell className="text-right px-8">
                     <div className="flex justify-end">
                       <Button 
                         onClick={() => handleViewDetails(app)}
                         className="h-9 px-4 bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"
                       >
                          <ChevronRight className="size-3.5" />
                          View Details
                       </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AppointmentDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        appointment={selectedAppt} 
      />
    </>
  )
}

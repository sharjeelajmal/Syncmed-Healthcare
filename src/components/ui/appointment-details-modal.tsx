"use client"

import * as React from "react"
import { format } from "date-fns"
import { 
  Bell, 
  Clock, 
  User, 
  FileText, 
  XCircle,
  ChevronRight
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AppointmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
}

export function AppointmentDetailsModal({ isOpen, onClose, appointment }: AppointmentDetailsModalProps) {
  if (!appointment) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] md:max-w-md rounded-3xl border-slate-200 shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Appointment Details</DialogTitle>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref ID: {appointment.id.toUpperCase()}</span>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Section A: Status & Schedule */}
          <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="space-y-3">
              {getStatusBadge(appointment.status)}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-base md:text-lg">
                  <Bell className="size-4 text-[#67BA2E]" />
                  {format(new Date(appointment.scheduledAt), "EEEE, MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-xs md:text-sm">
                  <Clock className="size-4 text-[#67BA2E]" />
                  {format(new Date(appointment.scheduledAt), "hh:mm a")}
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Doctor Information */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Assigned Provider</h3>
            <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <div className="size-12 md:size-14 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] border border-[#67BA2E]/20 shadow-inner">
                <User className="size-6 md:size-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-black text-slate-800 tracking-tight">Dr. {appointment.provider.user.firstName} {appointment.provider.user.lastName}</span>
                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{appointment.provider.specialty}</span>
              </div>
            </div>
          </div>

          {/* Section C: Quick Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {appointment.status === 'COMPLETED' && (
              <Button className="h-12 w-full bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs gap-2 border-0">
                <FileText className="size-4" />
                View Clinical Record
                <ChevronRight className="size-4 ml-auto" />
              </Button>
            )}
            {appointment.status === 'PENDING' && (
              <Button variant="outline" className="h-12 w-full border-red-200 text-red-500 hover:bg-red-50 font-black rounded-xl transition-all uppercase tracking-widest text-xs gap-2">
                <XCircle className="size-4" />
                Cancel Appointment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

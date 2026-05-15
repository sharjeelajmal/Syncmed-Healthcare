"use client"

import * as React from "react"
import { CreditCard, History, Clock, Info, Bell, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReceiptUploadModal } from "@/components/ui/receipt-upload-modal"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DebouncedSearch } from "@/components/ui/debounced-search"

interface BillingClientProps {
  appointments: any[]
}

export function BillingClient({ appointments }: BillingClientProps) {
  const [selectedAppointment, setSelectedAppointment] = React.useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const unpaidCount = appointments.filter(a => a.paymentStatus === "UNPAID").length
  const totalOutstanding = unpaidCount * 150

  return (
    <div className="space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-slate-200/40 bg-gradient-to-br from-white to-slate-50/50 overflow-hidden group">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="size-16 rounded-[1.5rem] bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] group-hover:scale-110 transition-transform">
                <CreditCard className="size-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outstanding</span>
                <span className="text-3xl font-black text-slate-800 tracking-tighter">${totalOutstanding.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden group">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="size-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Clock className="size-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Verification</span>
                <span className="text-3xl font-black text-slate-800 tracking-tighter">
                  {appointments.filter(a => a.paymentStatus === "VERIFICATION_PENDING").length} Visits
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden group">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="size-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                <History className="size-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Payment Date</span>
                <span className="text-lg font-black text-slate-800 tracking-tight">
                  {appointments.some(a => a.paymentStatus === "PAID") ? "Yesterday" : "No Payments Found"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Search Filter - Standardized */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <DebouncedSearch placeholder="Search by clinician, specialty or Invoice ID..." />
        <div className="flex items-center">
           <Badge variant="outline" className="h-10 bg-slate-50 text-slate-400 border-slate-200 font-black text-[9px] uppercase tracking-tighter px-4 rounded-xl whitespace-nowrap shadow-sm">
             {appointments.length} Invoices Found
           </Badge>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2 px-1">
          Recent Invoices
          <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
        </h2>

        {appointments.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[300px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Service Date</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Clinician</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Amount</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                             <Bell className="size-5" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-slate-700 text-sm">{format(new Date(appt.scheduledAt), "MMMM dd, yyyy")}</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                               <Clock className="size-3" />
                               Invoice: #{appt.id.slice(-6).toUpperCase()}
                             </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-sm border border-[#67BA2E]/20 shadow-inner">
                              {appt.provider.user.firstName[0]}{appt.provider.user.lastName[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-base leading-tight">Dr. {appt.provider.user.firstName} {appt.provider.user.lastName}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{appt.provider.specialty || 'General Practitioner'}</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <span className="text-base font-black text-slate-700 tracking-tighter">$150.00</span>
                      </TableCell>
                      <TableCell>
                         {appt.paymentStatus === "UNPAID" && (
                            <Badge variant="outline" className="bg-red-50 text-red-500 border-red-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                               Outstanding
                            </Badge>
                         )}
                         {appt.paymentStatus === "VERIFICATION_PENDING" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                               Reviewing
                            </Badge>
                         )}
                         {appt.paymentStatus === "PAID" && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                               Cleared
                            </Badge>
                         )}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex justify-end">
                          {appt.paymentStatus === 'UNPAID' && (
                            <Button 
                              onClick={() => { setSelectedAppointment(appt); setIsModalOpen(true); }}
                              className="h-9 px-4 bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"
                            >
                              <ChevronRight className="size-3.5" />
                              Upload Receipt
                            </Button>
                          )}
                          {appt.paymentStatus === 'VERIFICATION_PENDING' && (
                             <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Reviewing</span>
                          )}
                          {appt.paymentStatus === 'PAID' && (
                            <span className="text-[#67BA2E] font-black text-[10px] uppercase tracking-widest bg-[#67BA2E]/10 px-3 py-1.5 rounded-lg border border-[#67BA2E]/20">Receipt Verified</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
             <Info className="size-10 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest">No billable encounters found.</p>
          </div>
        )}
      </div>

      {selectedAppointment && (
        <ReceiptUploadModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointmentId={selectedAppointment.id}
          amountToPay={150}
        />
      )}
    </div>
  )
}

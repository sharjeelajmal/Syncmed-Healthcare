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

interface BillingItem {
  id: string
  type: "APPOINTMENT" | "SECONDARY"
  date: Date
  amount: number
  status: string // UNPAID, PAID, VERIFICATION_PENDING, REJECTED
  clinician: string
  specialty: string
  initials: string
}

interface BillingClientProps {
  invoices: BillingItem[]
}

export function BillingClient({ invoices }: BillingClientProps) {
  const [selectedInvoice, setSelectedInvoice] = React.useState<BillingItem | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const lastPaidInvoice = invoices
    .filter((item) => item.status === "PAID")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  const totalOutstanding = invoices
    .filter(a => a.status === "UNPAID")
    .reduce((sum, item) => sum + item.amount, 0)

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
                  {invoices.filter(a => a.status === "VERIFICATION_PENDING").length} Items
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
                  {lastPaidInvoice
                    ? format(new Date(lastPaidInvoice.date), "MMM d, yyyy")
                    : "No Payments Found"}
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
             {invoices.length} Invoices Found
           </Badge>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2 px-1">
          Recent Invoices
          <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
        </h2>

        {invoices.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[300px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Service Date</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Clinician / Service</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Amount</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                             <Bell className="size-5" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-slate-700 text-sm">{format(new Date(item.date), "MMMM dd, yyyy")}</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                               <Clock className="size-3" />
                               {item.type === "APPOINTMENT" ? "Visit Invoice" : "Secondary Charges"}: #{item.id.slice(-6).toUpperCase()}
                             </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-sm border border-[#67BA2E]/20 shadow-inner">
                              {item.initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-base leading-tight">{item.clinician}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.specialty}</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <span className="text-base font-black text-slate-700 tracking-tighter">${item.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                         {item.status === "UNPAID" && (
                            <Badge variant="outline" className="bg-red-50 text-red-500 border-red-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                                Outstanding
                            </Badge>
                         )}
                         {item.status === "VERIFICATION_PENDING" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                                Reviewing
                            </Badge>
                         )}
                         {item.status === "PAID" && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                                Cleared
                            </Badge>
                         )}
                         {item.status === "REJECTED" && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                                Rejected
                            </Badge>
                         )}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex justify-end">
                          {item.status === 'UNPAID' && (
                            <Button 
                              onClick={() => { setSelectedInvoice(item); setIsModalOpen(true); }}
                              className="h-9 px-4 bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"
                            >
                              <ChevronRight className="size-3.5" />
                              Upload Receipt
                            </Button>
                          )}
                          {item.status === 'VERIFICATION_PENDING' && (
                             <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Reviewing</span>
                          )}
                          {item.status === 'PAID' && (
                            <span className="text-[#67BA2E] font-black text-[10px] uppercase tracking-widest bg-[#67BA2E]/10 px-3 py-1.5 rounded-lg border border-[#67BA2E]/20">Verified</span>
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

      {selectedInvoice && (
        <ReceiptUploadModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointmentId={selectedInvoice.id}
          amountToPay={selectedInvoice.amount}
        />
      )}
    </div>
  )
}

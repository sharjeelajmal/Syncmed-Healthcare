"use client"

import * as React from "react"
import { MoreVertical, CheckCircle2, XCircle, Mail, Loader2, Calendar, Phone, MailQuestion } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT, DISPLAY_DATE_AT_TIME_FORMAT } from "@/lib/date-format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AnimatedTableBody } from "@/components/ui/animated-table-body"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { updateLeadStatusAction } from "@/app/actions/lead.actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ServerTablePagination } from "@/components/ui/server-table-pagination"

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  type: string
  message: string
  status: string
  createdAt: Date
}

interface LeadsTableProps {
  leads: Lead[]
  totalItems: number
  currentPage: number
}

export function LeadsTable({
  leads: initialLeads,
  totalItems,
  currentPage,
}: LeadsTableProps) {
  const router = useRouter()
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads)
  const [isPendingMap, setIsPendingMap] = React.useState<Record<string, boolean>>({})
  const [viewingLead, setViewingLead] = React.useState<Lead | null>(null)
  const [direction, setDirection] = React.useState(1)
  const prevPage = React.useRef(currentPage)

  React.useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  React.useEffect(() => {
    setDirection(currentPage > prevPage.current ? 1 : -1)
    prevPage.current = currentPage
  }, [currentPage])

  const handleStatusChange = async (leadId: string, newStatus: "CONVERTED" | "DISMISSED") => {
    setIsPendingMap(prev => ({ ...prev, [leadId]: true }))
    
    const result = await updateLeadStatusAction(leadId, newStatus)
    
    if (result.success) {
      toast.success("Status Updated", {
        description: result.message || "Lead status was updated successfully."
      })
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      )
      router.refresh()
    } else {
      toast.error("Operation Failed", {
        description: result.error || "Failed to update lead status."
      })
    }
    
    setIsPendingMap(prev => ({ ...prev, [leadId]: false }))
  }

  const getTypeBadge = (type: string) => {
    if (type === "patient_registration") {
      return (
        <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-600 font-bold text-[10px] rounded-full px-2.5 py-0.5 whitespace-nowrap">
          New Patient Registration
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-600 font-bold text-[10px] rounded-full px-2.5 py-0.5 whitespace-nowrap">
        General Question
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-600 font-bold text-[10px] rounded-full px-2.5 py-0.5 whitespace-nowrap">
            PENDING
          </Badge>
        )
      case "CONVERTED":
        return (
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-600 font-bold text-[10px] rounded-full px-2.5 py-0.5 whitespace-nowrap">
            CONVERTED
          </Badge>
        )
      case "DISMISSED":
        return (
          <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-500 font-bold text-[10px] rounded-full px-2.5 py-0.5 whitespace-nowrap">
            DISMISSED
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] rounded-full px-2.5 py-0.5 whitespace-nowrap">
            {status}
          </Badge>
        )
    }
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-3xl text-center space-y-6 shadow-xs">
        <div className="size-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#67BA2E]">
          <Mail size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">No Leads or Inquiries</h3>
          <p className="text-slate-500 text-xs max-w-sm">
            All caught up! There are currently no contact or registration requests pending in the queue.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[180px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Received</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Prospect</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Category</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Message Summary</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <AnimatedTableBody pageKey={currentPage} direction={direction}>
              {leads.map((lead) => {
                const isProcessing = isPendingMap[lead.id] || false
                return (
                  <TableRow key={lead.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                    {/* Timestamp */}
                    <TableCell className="px-8 py-5 font-bold text-slate-700 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-800">{format(new Date(lead.createdAt), DISPLAY_DATE_FORMAT)}</span>
                        <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-wider mt-1 flex items-center gap-1">
                          <Calendar size={10} />
                          {format(new Date(lead.createdAt), "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>

                    {/* Prospect Identity */}
                    <TableCell className="py-5">
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-800 text-sm block leading-none">{lead.name}</span>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <MailQuestion size={12} className="text-slate-400" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1 font-medium">
                              <Phone size={12} className="text-slate-400" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category Badge */}
                    <TableCell className="py-5">
                      {getTypeBadge(lead.type)}
                    </TableCell>

                    {/* Message Summary */}
                    <TableCell className="py-5 max-w-xs md:max-w-sm">
                      <button
                        type="button"
                        onClick={() => setViewingLead(lead)}
                        className="text-left w-full hover:bg-slate-50 p-2 rounded-xl transition-all cursor-pointer group/msg border border-transparent hover:border-slate-100 focus:outline-none"
                      >
                        <p className="text-xs text-slate-600 leading-relaxed break-words line-clamp-3 group-hover/msg:text-slate-800 transition-colors">
                          "{lead.message}"
                        </p>
                        <span className="text-[10px] text-[#67BA2E] font-bold mt-1 inline-block opacity-0 group-hover/msg:opacity-100 transition-opacity">
                          Click to view full message &rarr;
                        </span>
                      </button>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-5">
                      {getStatusBadge(lead.status)}
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="text-right px-8 py-5">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="size-9 p-0 rounded-xl hover:bg-slate-100 text-slate-500 border border-transparent transition-all"
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="size-4 animate-spin text-slate-400" />
                            ) : (
                              <MoreVertical className="size-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 p-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                          <DropdownMenuLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1.5">
                            Status Workflow
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          
                          <DropdownMenuItem
                            disabled={lead.status === "CONVERTED" || isProcessing}
                            onClick={() => handleStatusChange(lead.id, "CONVERTED")}
                            className="flex items-center gap-2 px-2.5 py-2.5 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle2 size={15} className="text-emerald-500" />
                            Mark as Converted
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={lead.status === "DISMISSED" || isProcessing}
                            onClick={() => handleStatusChange(lead.id, "DISMISSED")}
                            className="flex items-center gap-2 px-2.5 py-2.5 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-600 focus:bg-slate-50 focus:text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={15} className="text-slate-400" />
                            Dismiss Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </AnimatedTableBody>
          </Table>
        </div>
        <ServerTablePagination
          currentPage={currentPage}
          totalItems={totalItems}
        />
      </div>

      <Dialog open={!!viewingLead} onOpenChange={(open) => !open && setViewingLead(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-0 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 bg-white">
          <div className="bg-slate-50 p-6 flex flex-col items-start border-b border-slate-100">
            <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#67BA2E] mb-3">
              <Mail size={18} />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">Confidential Inquiry</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium text-xs mt-1">
                Submitted by <span className="text-slate-600 font-bold">{viewingLead?.name}</span> on {viewingLead && format(new Date(viewingLead.createdAt), DISPLAY_DATE_AT_TIME_FORMAT)}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white space-y-6">
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 max-h-96 overflow-y-auto">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {viewingLead?.message}
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setViewingLead(null)}
                className="h-10 px-5 rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold text-xs uppercase tracking-widest border-0"
              >
                Close Inquiry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

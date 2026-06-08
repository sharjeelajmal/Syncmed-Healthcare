"use client"

import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, ExternalLink, FileText } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { verifyReceiptAction } from "@/app/actions/billing.actions"
import { formatNaira } from "@/lib/currency"
import { formatProviderDisplayName } from "@/lib/format-provider-name"

interface VerifyReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
}

export function VerifyReceiptModal({ isOpen, onClose, appointment }: VerifyReceiptModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  if (!appointment) return null

  const isPdf = appointment.receiptData?.toLowerCase().endsWith(".pdf")

  const handleVerify = (status: 'PAID' | 'UNPAID') => {
    startTransition(async () => {
      const res = await verifyReceiptAction(appointment.id, status)
      if (res.success) {
        toast.success(status === 'PAID' ? "Payment Approved" : "Payment Rejected")
        router.refresh()
        onClose()
      } else {
        toast.error(res.error || "Action failed")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] border-0 shadow-2xl bg-white p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
                <FileText className="size-6 text-[#67BA2E]" />
             </div>
             Review Payment Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="my-6 space-y-4">
           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient</span>
                    <span className="font-bold text-slate-700">{appointment.patient.user.firstName} {appointment.patient.user.lastName}</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Doctor</span>
                    <span className="font-bold text-slate-700">{formatProviderDisplayName(appointment.provider)}</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Expected Amount</span>
                    <span className="font-black text-[#67BA2E]">{formatNaira(appointment.amount ?? 0)}</span>
                 </div>
              </div>
           </div>

           <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center min-h-[300px] overflow-hidden relative group">
              {appointment.receiptData ? (
                <>
                  {isPdf ? (
                    <div className="flex flex-col items-center gap-4">
                       <FileText className="size-16 text-slate-300" />
                       <Button 
                         variant="outline" 
                         className="rounded-xl font-bold gap-2"
                         onClick={() => window.open(appointment.receiptData, '_blank')}
                       >
                          <ExternalLink className="size-4" />
                          View PDF Document
                       </Button>
                    </div>
                  ) : (
                    <img 
                      src={appointment.receiptData} 
                      alt="Receipt Preview" 
                      className="max-h-[400px] w-full object-contain transition-transform group-hover:scale-[1.02] duration-500"
                    />
                  )}
                </>
              ) : (
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No receipt data found</p>
              )}
           </div>
        </div>

        <DialogFooter className="gap-3 sm:justify-between">
           <Button 
             variant="destructive"
             className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs gap-2 w-full md:flex-1 text-white"
             onClick={() => handleVerify('UNPAID')}
             disabled={isPending}
           >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
              Reject Payment
           </Button>
           <Button 
             className="h-12 px-8 rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black uppercase tracking-widest text-xs gap-2 w-full md:flex-1"
             onClick={() => handleVerify('PAID')}
             disabled={isPending}
           >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Approve Payment
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

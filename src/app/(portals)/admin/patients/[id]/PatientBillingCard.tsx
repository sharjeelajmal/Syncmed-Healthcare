"use client"

import * as React from "react"
import { format } from "date-fns"
import { FileText, Receipt, Wallet } from "lucide-react"

import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { formatNaira } from "@/lib/currency"
import { formatProviderDisplayName } from "@/lib/format-provider-name"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReceiptViewerDialog } from "@/components/ui/receipt-viewer-dialog"
import { VerifyReceiptModal } from "@/components/ui/verify-receipt-modal"
import { cn } from "@/lib/utils"

export interface BillingAppointment {
  id: string
  scheduledAt: string
  amount: number
  paymentStatus: string
  receiptData: string | null
  provider: { providerType: string; user: { firstName: string; lastName: string } }
  patient: { user: { firstName: string; lastName: string } }
}

export interface BillingInvoice {
  id: string
  createdAt: string
  amount: number
  status: string
  receiptUrl: string | null
}

type Tone = "paid" | "pending" | "unpaid"

const TONE_CLASSES: Record<Tone, string> = {
  paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  unpaid: "bg-red-50 text-red-500 border-red-100",
}

const APPOINTMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  PAID: { label: "Paid", tone: "paid" },
  VERIFICATION_PENDING: { label: "Pending Verification", tone: "pending" },
  UNPAID: { label: "Unpaid", tone: "unpaid" },
}

const INVOICE_STATUS: Record<string, { label: string; tone: Tone }> = {
  VERIFIED: { label: "Paid", tone: "paid" },
  PENDING: { label: "Pending", tone: "pending" },
  REJECTED: { label: "Rejected", tone: "unpaid" },
}

interface Row {
  key: string
  kind: "Appointment" | "Invoice"
  date: string
  detail: string
  amount: number
  status: { label: string; tone: Tone }
  receipt: string | null
  appointment?: BillingAppointment
}

export function PatientBillingCard({
  appointments,
  invoices,
  isReadOnly,
}: {
  appointments: BillingAppointment[]
  invoices: BillingInvoice[]
  isReadOnly?: boolean
}) {
  const [reviewing, setReviewing] = React.useState<BillingAppointment | null>(null)
  const [viewingReceipt, setViewingReceipt] = React.useState<string | null>(null)

  const rows: Row[] = React.useMemo(() => {
    const appointmentRows: Row[] = appointments.map((a) => ({
      key: `apt-${a.id}`,
      kind: "Appointment",
      date: a.scheduledAt,
      detail: `Visit with ${formatProviderDisplayName(a.provider)}`,
      amount: a.amount,
      status: APPOINTMENT_STATUS[a.paymentStatus] ?? { label: a.paymentStatus, tone: "pending" },
      receipt: a.receiptData,
      appointment: a,
    }))
    const invoiceRows: Row[] = invoices.map((i) => ({
      key: `inv-${i.id}`,
      kind: "Invoice",
      date: i.createdAt,
      detail: `Invoice #${i.id.slice(0, 8).toUpperCase()}`,
      amount: i.amount,
      status: INVOICE_STATUS[i.status] ?? { label: i.status, tone: "pending" },
      receipt: i.receiptUrl,
    }))
    return [...appointmentRows, ...invoiceRows].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [appointments, invoices])

  const totalPaid = rows.filter((r) => r.status.tone === "paid").reduce((sum, r) => sum + r.amount, 0)
  const totalPending = rows.filter((r) => r.status.tone === "pending").reduce((sum, r) => sum + r.amount, 0)

  const openReceipt = (row: Row) => {
    if (!row.receipt) return
    // Receipts awaiting verification open the approve/reject review.
    if (!isReadOnly && row.appointment && row.appointment.paymentStatus === "VERIFICATION_PENDING") {
      setReviewing(row.appointment)
    } else {
      setViewingReceipt(row.receipt)
    }
  }

  return (
    <Card className="glass-card overflow-hidden border-0 shadow-2xl rounded-[2rem] p-0">
      <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
            <Wallet size={24} />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Billing & Invoices</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Payments, receipts and invoice history
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
            <p className="text-2xl font-black text-[#67BA2E] mt-1">{formatNaira(totalPaid)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{formatNaira(totalPending)}</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Receipt className="size-10 text-slate-200 mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No billing history yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-slate-800 text-sm">{formatNaira(row.amount)}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full",
                        TONE_CLASSES[row.status.tone]
                      )}
                    >
                      {row.status.label}
                    </Badge>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.kind}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1 truncate">
                    {format(new Date(row.date), DISPLAY_DATE_FORMAT)} · {row.detail}
                  </p>
                </div>
                {row.receipt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openReceipt(row)}
                    className="h-9 shrink-0 rounded-lg border-[#67BA2E]/30 text-[#67BA2E] font-black text-[10px] uppercase tracking-wider hover:bg-[#67BA2E]/10 gap-1.5"
                  >
                    <FileText className="size-3.5" />
                    {!isReadOnly && row.appointment?.paymentStatus === "VERIFICATION_PENDING"
                      ? "Review Receipt"
                      : "View Receipt"}
                  </Button>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">No receipt</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <VerifyReceiptModal isOpen={reviewing !== null} onClose={() => setReviewing(null)} appointment={reviewing} />
      <ReceiptViewerDialog url={viewingReceipt} onClose={() => setViewingReceipt(null)} />
    </Card>
  )
}

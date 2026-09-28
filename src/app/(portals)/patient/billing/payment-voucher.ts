import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT, DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"

export interface VoucherItem {
  id: string
  type: "APPOINTMENT" | "SECONDARY"
  date: Date | string
  amount: number
  clinician: string
  specialty: string
}

/**
 * Builds a payment confirmation voucher for a verified payment. Uses "NGN"
 * because jsPDF's built-in fonts have no glyph for the Naira sign.
 */
export async function downloadPaymentVoucher(item: VoucherItem, patientName: string) {
  const { default: jsPDF } = await import("jspdf")
  const pdf = new jsPDF("p", "mm", "a4")
  const width = pdf.internal.pageSize.getWidth()
  const left = 20
  const right = width - 20
  const reference = item.id.slice(0, 8).toUpperCase()

  // Header band
  pdf.setFillColor(103, 186, 46)
  pdf.rect(0, 0, width, 38, "F")
  pdf.setTextColor(255, 255, 255)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(18)
  pdf.text("SyncMed Concierge Healthcare Services", left, 18)
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.text("PAYMENT CONFIRMATION VOUCHER", left, 28)

  // Status stamp
  pdf.setTextColor(103, 186, 46)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(22)
  pdf.text("PAID", right, 58, { align: "right" })

  const rows: [string, string][] = [
    ["Voucher Reference", reference],
    ["Patient", patientName],
    ["Service", item.type === "APPOINTMENT" ? "Clinical Visit" : "Additional Charges"],
    ["Clinician / Description", `${item.clinician}${item.specialty ? ` (${item.specialty})` : ""}`],
    ["Service Date", format(new Date(item.date), DISPLAY_DATE_FORMAT)],
    ["Payment Status", "Verified by SyncMed billing"],
  ]

  let y = 58
  pdf.setFontSize(10)
  for (const [label, value] of rows) {
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(100, 116, 139)
    pdf.text(label, left, y)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(15, 23, 42)
    const lines = pdf.splitTextToSize(value, 100)
    pdf.text(lines, left + 60, y)
    y += 9 * lines.length
  }

  // Amount box
  y += 6
  pdf.setDrawColor(226, 232, 240)
  pdf.setFillColor(248, 250, 252)
  pdf.roundedRect(left, y, right - left, 24, 3, 3, "FD")
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 116, 139)
  pdf.text("Amount Paid", left + 8, y + 14)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(16)
  pdf.setTextColor(15, 23, 42)
  pdf.text(`NGN ${item.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`, right - 8, y + 15, {
    align: "right",
  })

  // Footer
  pdf.setFont("helvetica", "italic")
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184)
  pdf.text(
    `Generated ${format(new Date(), DISPLAY_DATE_TIME_FORMAT)}. This voucher confirms a payment verified by SyncMed.`,
    left,
    280
  )

  pdf.save(`SyncMed_Payment_Voucher_${reference}.pdf`)
}

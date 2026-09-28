"use client"

import * as React from "react"
import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT, DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"
import { Download, Stethoscope, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getReassessmentDisplayRows } from "@/components/assessment/ReassessmentStepView"
import { ROUTINE_REASSESSMENT_WIZARD_STEPS } from "@/lib/assessment-reassessment-fields"
import type { RoutineHomeVisitReassessment } from "@/types/assessment"
import type { ClinicalRecordView } from "@/lib/clinical-record"

interface PatientRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: ClinicalRecordView | null
}

const DOCUMENT_ID = "clinical-document"
// A4 at 96dpi is ~794px wide; the PDF is rendered at this fixed width.
const PDF_RENDER_WIDTH = 794
const PDF_MARGIN_MM = 12

// html2canvas cannot parse Tailwind v4's oklch() colors, so everything inside
// the printable document uses hex values only.
const C = {
  ink: "#0f172a",
  body: "#1e293b",
  muted: "#64748b",
  faint: "#94a3b8",
  line: "#e2e8f0",
  panel: "#f8fafc",
  brand: "#67BA2E",
}

export function PatientRecordModal({ isOpen, onClose, record }: PatientRecordModalProps) {
  const [isDownloading, setIsDownloading] = React.useState(false)

  if (!record) return null

  const handleDownload = async () => {
    const element = document.getElementById(DOCUMENT_ID)
    if (!element) return

    setIsDownloading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])

      // Measured inside the clone, which is laid out at the fixed PDF width.
      let blocks: { top: number; bottom: number }[] = []
      let totalHeight = 0

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: PDF_RENDER_WIDTH,
        onclone: (doc) => {
          const clone = doc.getElementById(DOCUMENT_ID)
          if (!clone) return
          clone.style.width = `${PDF_RENDER_WIDTH}px`
          clone.style.maxWidth = "none"
          const originTop = clone.getBoundingClientRect().top
          totalHeight = clone.scrollHeight
          blocks = Array.from(clone.querySelectorAll<HTMLElement>("[data-pdf-block]")).map((b) => {
            const rect = b.getBoundingClientRect()
            return { top: rect.top - originTop, bottom: rect.bottom - originTop }
          })
        },
      })

      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidthMm = pdf.internal.pageSize.getWidth()
      const pageHeightMm = pdf.internal.pageSize.getHeight()
      const contentWidthMm = pageWidthMm - PDF_MARGIN_MM * 2
      const contentHeightMm = pageHeightMm - PDF_MARGIN_MM * 2 - 6 // room for the page number

      const cssWidth = canvas.width / 2
      const pxPerMm = cssWidth / contentWidthMm
      const pageHeightPx = contentHeightMm * pxPerMm
      const docHeight = totalHeight || canvas.height / 2

      // Break pages at the top of whichever block would otherwise be cut in half.
      const pages: [number, number][] = []
      let start = 0
      while (start < docHeight - 1) {
        let end = Math.min(start + pageHeightPx, docHeight)
        if (end < docHeight) {
          const crossing = blocks.filter((b) => b.top > start + 1 && b.top < end && b.bottom > end)
          if (crossing.length > 0) end = Math.max(...crossing.map((b) => b.top))
        }
        pages.push([start, end])
        start = end
      }

      const scale = canvas.width / cssWidth
      pages.forEach(([top, bottom], index) => {
        const slice = document.createElement("canvas")
        slice.width = canvas.width
        slice.height = Math.max(1, Math.round((bottom - top) * scale))
        const ctx = slice.getContext("2d")
        if (!ctx) return
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, slice.width, slice.height)
        ctx.drawImage(canvas, 0, Math.round(top * scale), canvas.width, slice.height, 0, 0, canvas.width, slice.height)

        if (index > 0) pdf.addPage()
        pdf.addImage(
          slice.toDataURL("image/jpeg", 0.92),
          "JPEG",
          PDF_MARGIN_MM,
          PDF_MARGIN_MM,
          contentWidthMm,
          (bottom - top) / pxPerMm
        )
        pdf.setFontSize(8)
        pdf.setTextColor(148, 163, 184)
        pdf.text(`Page ${index + 1} of ${pages.length}`, pageWidthMm / 2, pageHeightMm - PDF_MARGIN_MM / 2, {
          align: "center",
        })
      })

      pdf.save(`Clinical_Record_${record.id.slice(0, 8).toUpperCase()}.pdf`)
    } catch (error) {
      console.error("PDF Generation failed", error)
      toast.error("Could not generate the PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const reassessment = record.routineReassessment as RoutineHomeVisitReassessment
  const reviewSections = ROUTINE_REASSESSMENT_WIZARD_STEPS.map((step) => ({
    step,
    rows: getReassessmentDisplayRows(step, reassessment),
  })).filter((s) => s.rows.length > 0)
  const additionalNotes = typeof reassessment.additionalNotes === "string" ? reassessment.additionalNotes.trim() : ""
  const showSoap = record.soapNotes && record.soapNotes !== record.assessmentSummary
  const hasContent = record.hasAssessment || record.physicianNotes.length > 0

  const encounterType = record.hasAssessment
    ? record.isInitialAssessment
      ? "Initial Assessment"
      : "Follow-up Visit"
    : "Clinical Visit"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] md:max-w-3xl rounded-3xl border-slate-200 shadow-2xl bg-white p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Clinical Record</DialogTitle>
        <DialogDescription className="sr-only">
          Clinical record from {format(new Date(record.date), DISPLAY_DATE_FORMAT)}
        </DialogDescription>

        {/* Actions header (not part of the PDF) */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 pr-14 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Stethoscope className="size-5 text-[#67BA2E] shrink-0" />
            <span className="font-bold text-slate-800 truncate">Clinical Record</span>
          </div>
          {hasContent ? (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl gap-2 shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] shrink-0"
            >
              {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {isDownloading ? "Generating PDF..." : "Download PDF"}
            </Button>
          ) : null}
        </div>

        {/* Printable document — hex colours only (see C) */}
        <div id={DOCUMENT_ID} style={{ background: "#ffffff", color: C.body }} className="p-6 md:p-12 space-y-10">
          <div data-pdf-block style={{ borderBottom: `2px solid ${C.ink}` }} className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6">
            <div className="space-y-1">
              <h1 style={{ color: C.ink }} className="text-xl md:text-2xl font-black tracking-tight uppercase">
                SyncMed Concierge Healthcare Services
              </h1>
              <p style={{ color: C.brand }} className="text-xs font-black uppercase tracking-widest">
                Confidential Clinical Record
              </p>
            </div>
            <div className="sm:text-right space-y-1">
              <Label>Record ID</Label>
              <p style={{ color: C.ink }} className="font-bold text-sm">{record.id.slice(0, 8).toUpperCase()}</p>
              <Label className="mt-3">Date of Service</Label>
              <p style={{ color: C.ink }} className="font-bold text-sm">{format(new Date(record.date), DISPLAY_DATE_TIME_FORMAT)}</p>
            </div>
          </div>

          <div data-pdf-block style={{ background: C.panel, border: `1px solid ${C.line}` }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl">
            <Field label="Patient" value={record.patientName} />
            <Field label="Attending Clinician" value={record.providerName} sub={record.providerSpecialty} />
            <Field label="Encounter" value={encounterType} />
          </div>

          {!hasContent ? (
            <div data-pdf-block style={{ border: `1px dashed ${C.line}`, color: C.muted }} className="rounded-2xl p-8 text-center text-sm font-medium">
              Clinical documentation for this visit has not been published yet. Please check back later
              or message your care team.
            </div>
          ) : null}

          {record.vitals.length > 0 ? (
            <Section title="Vital Signs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {record.vitals.map((v) => (
                  <div key={v.label} data-pdf-block style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-xl p-3">
                    <Label>{v.label}</Label>
                    <p style={{ color: C.ink }} className="text-base font-bold mt-1">{v.value}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {record.hasAssessment && (record.riskLevel || record.assessmentSummary || showSoap || record.supervisorReview) ? (
            <Section title="Assessment Summary">
              {record.riskLevel ? (
                <p data-pdf-block className="text-sm">
                  <span style={{ color: C.muted }} className="font-bold">Risk level: </span>
                  <span style={{ color: C.ink }} className="font-black">
                    {record.riskLevel}
                    {typeof record.riskScore === "number" ? ` (score ${record.riskScore})` : ""}
                  </span>
                </p>
              ) : null}
              {record.assessmentSummary ? <Paragraph label="Overall Assessment" text={record.assessmentSummary} /> : null}
              {showSoap ? <Paragraph label="Clinical Notes" text={record.soapNotes} /> : null}
              {record.supervisorReview ? <Paragraph label="Supervisor Review" text={record.supervisorReview} /> : null}
            </Section>
          ) : null}

          {reviewSections.length > 0 || additionalNotes ? (
            <Section title="Home Visit Review (ADL, Pain & Clinical Findings)">
              {reviewSections.map(({ step, rows }) => (
                <div key={step} className="space-y-2">
                  <p data-pdf-block style={{ color: C.brand }} className="text-[10px] font-black uppercase tracking-widest">{step}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rows.map((row) => (
                      <div key={row.key} data-pdf-block style={{ background: C.panel, border: `1px solid ${C.line}` }} className={`rounded-lg p-2.5 ${row.value.length > 80 ? "sm:col-span-2" : ""}`}>
                        <p style={{ color: C.faint }} className="text-[9px] font-black uppercase tracking-widest">{row.label}</p>
                        <p style={{ color: C.ink }} className="text-sm font-semibold mt-0.5 whitespace-pre-wrap break-words">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {additionalNotes ? <Paragraph label="Additional Notes" text={additionalNotes} /> : null}
            </Section>
          ) : null}

          {record.medications.length > 0 ? (
            <Section title="Active Medications">
              <div style={{ border: `1px solid ${C.line}` }} className="rounded-xl overflow-hidden">
                <div data-pdf-block style={{ background: C.panel, color: C.faint }} className="grid grid-cols-3 gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest">
                  <span>Medication</span><span>Dosage</span><span>Frequency</span>
                </div>
                {record.medications.map((m, i) => (
                  <div key={`${m.name}-${i}`} data-pdf-block style={{ borderTop: `1px solid ${C.line}`, color: C.ink }} className="grid grid-cols-3 gap-2 px-4 py-2.5 text-sm">
                    <span className="font-bold break-words">{m.name}</span>
                    <span className="break-words">{m.dosage || "—"}</span>
                    <span className="break-words">{m.frequency || "—"}</span>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {record.diagnoses.length > 0 ? (
            <Section title="Diagnoses">
              <ul className="space-y-1.5">
                {record.diagnoses.map((d, i) => (
                  <li key={`${d}-${i}`} data-pdf-block style={{ color: C.ink }} className="text-sm font-semibold flex gap-2">
                    <span style={{ color: C.brand }}>•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {record.followUpDate ? (
            <Section title="Follow-up">
              <p data-pdf-block style={{ color: C.ink }} className="text-sm font-bold">
                Next review: {format(new Date(record.followUpDate), DISPLAY_DATE_FORMAT)}
              </p>
            </Section>
          ) : null}

          {record.physicianNotes.length > 0 ? (
            <Section title="Physician Notes">
              {record.physicianNotes.map((note) => (
                <div key={note.id} style={{ border: `1px solid ${C.line}` }} className="rounded-xl p-4 space-y-3">
                  <p data-pdf-block style={{ color: C.muted }} className="text-xs font-bold">
                    {format(new Date(note.date), DISPLAY_DATE_TIME_FORMAT)} · {note.authorName}
                  </p>
                  {note.chiefComplaint ? <Paragraph label="Chief Complaint" text={note.chiefComplaint} /> : null}
                  <Paragraph label="Note / Impression" text={note.assessment} />
                  {note.plan ? <Paragraph label="Treatment Plan" text={note.plan} /> : null}
                </div>
              ))}
            </Section>
          ) : null}

          {record.signatures.length > 0 ? (
            <Section title="Digital Signatures">
              <div className="flex flex-wrap gap-6">
                {record.signatures.map((sig) => (
                  <div key={sig.url} data-pdf-block className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sig.url} alt={sig.label} crossOrigin="anonymous" className="h-16 w-auto max-w-[240px] object-contain" />
                    <p style={{ color: C.muted, borderTop: `1px solid ${C.line}` }} className="pt-1 text-[10px] font-bold">{sig.label}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <div data-pdf-block style={{ borderTop: `1px solid ${C.line}`, color: C.faint }} className="pt-6 text-[10px] font-medium italic space-y-1">
            <p>This is an electronic medical record issued by SyncMed Concierge Healthcare Services.</p>
            <p>Generated on {format(new Date(), DISPLAY_DATE_TIME_FORMAT)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p style={{ color: C.faint }} className={`text-[10px] font-black uppercase tracking-widest ${className}`}>
      {children}
    </p>
  )
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      <p style={{ color: C.ink }} className="text-sm font-bold mt-1 break-words">{value}</p>
      {sub ? <p style={{ color: C.brand }} className="text-xs font-semibold">{sub}</p> : null}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 data-pdf-block style={{ color: C.faint, borderBottom: `1px solid ${C.line}` }} className="text-[10px] font-black uppercase tracking-[0.3em] pb-2">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Paragraph({ label, text }: { label: string; text: string }) {
  return (
    <div data-pdf-block className="space-y-1">
      <Label>{label}</Label>
      <p style={{ color: C.body }} className="text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">{text}</p>
    </div>
  )
}

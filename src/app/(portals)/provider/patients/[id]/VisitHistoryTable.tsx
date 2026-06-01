"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  FileText,
  FileSignature,
  Activity,
  Droplet,
  Scale,
  Heart,
  Ruler,
  Gauge,
  Pill,
  ClipboardList,
  Stethoscope,
  CalendarClock,
  AlertTriangle,
  UserSquare2,
  ListChecks,
} from "lucide-react"

import {
  WIZARD_STEPS,
  memberInfoFields,
  step2Sections,
  step3Sections,
  step4Sections,
  step5Questions,
} from "@/app/(portals)/provider/assessments/new/AssessmentForm"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const RESPONSE_SECTIONS = [
  ...step2Sections,
  ...step3Sections,
  ...step4Sections,
  { title: "Risk Summary & Care Plan", questions: step5Questions },
]

const QUESTION_PROMPTS = new Map<string, string>()
const QUESTION_OPTION_LABELS = new Map<string, Map<string, string>>()
for (const section of RESPONSE_SECTIONS) {
  for (const q of section.questions) {
    QUESTION_PROMPTS.set(q.id, q.prompt)
    if (q.options) {
      const inner = new Map<string, string>()
      for (const o of q.options) inner.set(o.value, o.label)
      QUESTION_OPTION_LABELS.set(q.id, inner)
    }
  }
}

function formatAnswer(questionId: string, answer: unknown): string {
  const labels = QUESTION_OPTION_LABELS.get(questionId)
  if (Array.isArray(answer)) {
    return answer.map((v) => labels?.get(String(v)) ?? String(v)).join(", ")
  }
  if (answer === null || answer === undefined || answer === "") return ""
  return labels?.get(String(answer)) ?? String(answer)
}

interface MedicationEntry {
  id?: string
  name?: string
  dosage?: string
  frequency?: string
}

interface DiagnosisEntry {
  id?: string
  name?: string
}

interface Assessment {
  id: string
  type?: string
  createdAt: string | Date
  signatureUrl?: string | null
  patientSignatureUrl?: string | null
  weightKg?: number | null
  heightInches?: number | null
  soapNotes?: string | null
  followUpDate?: string | Date | null
  data?: Record<string, unknown> | null
  medications?: MedicationEntry[]
  diagnoses?: DiagnosisEntry[]
  provider: {
    user: { firstName: string; lastName: string }
  }
}

interface VisitHistoryTableProps {
  assessments: Assessment[]
}

const RISK_STYLES: Record<string, string> = {
  HIGH: "bg-rose-50 text-rose-600 border-rose-100",
  MODERATE: "bg-amber-50 text-amber-600 border-amber-100",
  LOW: "bg-emerald-50 text-emerald-600 border-emerald-100",
}

function getClinicalData(visit: Assessment) {
  const data = (visit.data ?? {}) as Record<string, any>
  const bmiVitals = (data.bmiVitals ?? {}) as Record<string, any>
  const summary = (data.summary ?? {}) as Record<string, any>
  const memberInfo = (data.memberInfo ?? {}) as Record<string, any>
  const responses = (data.responses ?? {}) as Record<string, any>

  const medications: MedicationEntry[] =
    visit.medications && visit.medications.length > 0
      ? visit.medications
      : Array.isArray(data.medications)
      ? data.medications
      : []

  const diagnoses: DiagnosisEntry[] =
    visit.diagnoses && visit.diagnoses.length > 0
      ? visit.diagnoses
      : Array.isArray(data.diagnoses)
      ? data.diagnoses
      : []

  const soapNotes: string =
    visit.soapNotes || (typeof data.soapNotes === "string" ? data.soapNotes : "")

  const followUpDate = visit.followUpDate || data.followUpDate || null

  const signatureUrl: string =
    visit.signatureUrl ||
    visit.patientSignatureUrl ||
    (data.signatures?.assessorSignature as string) ||
    ""

  const weightKg =
    visit.weightKg ??
    (bmiVitals.weightKg !== undefined && bmiVitals.weightKg !== ""
      ? Number(bmiVitals.weightKg)
      : null)

  const heightInches =
    visit.heightInches ??
    (bmiVitals.heightInches !== undefined && bmiVitals.heightInches !== ""
      ? Number(bmiVitals.heightInches)
      : null)

  return {
    bmiVitals,
    summary,
    memberInfo,
    responses,
    medications,
    diagnoses,
    soapNotes,
    followUpDate,
    signatureUrl,
    weightKg,
    heightInches,
    riskLevel: (summary.riskLevel as string) || "",
    riskScore: summary.totalRiskScore as number | undefined,
    overallSummary: (summary.q98OverallAssessmentSummary as string) || "",
    supervisorReview: (summary.supervisorReview as string) || "",
  }
}

export function VisitHistoryTable({ assessments }: VisitHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</TableHead>
            <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</TableHead>
            <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk</TableHead>
            <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</TableHead>
            <TableHead className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((visit) => {
            const c = getClinicalData(visit)
            const riskClass = RISK_STYLES[c.riskLevel?.toUpperCase()] || "bg-slate-50 text-slate-500 border-slate-100"

            return (
              <TableRow key={visit.id} className="group hover:bg-slate-50/50 border-slate-100">
                <TableCell className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{format(new Date(visit.createdAt), "MMM dd, yyyy")}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{format(new Date(visit.createdAt), "hh:mm a")}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-slate-700 text-sm line-clamp-1 max-w-[220px] block">
                    {c.overallSummary || (c.diagnoses[0]?.name ? `Dx: ${c.diagnoses[0]?.name}` : "Clinical Assessment")}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
                    {c.medications.length} meds · {c.diagnoses.length} dx
                  </span>
                </TableCell>
                <TableCell>
                  {c.riskLevel ? (
                    <Badge className={`${riskClass} border font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full`}>
                      {c.riskLevel}{typeof c.riskScore === "number" ? ` · ${c.riskScore}` : ""}
                    </Badge>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-[8px] border border-[#67BA2E]/20">
                      {visit.provider.user.firstName[0]}{visit.provider.user.lastName[0]}
                    </div>
                    <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest">Dr. {visit.provider.user.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 px-4 border-[#67BA2E]/20 text-[#67BA2E] font-bold text-[10px] uppercase tracking-widest hover:bg-[#67BA2E] hover:text-white rounded-lg transition-all gap-2"
                      >
                        <FileText size={14} />
                        View Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[760px] max-h-[92dvh] rounded-2xl sm:rounded-[2rem] border-slate-200 p-0 overflow-hidden flex flex-col" closeButtonClassName="top-3 right-3 sm:top-5 sm:right-5 size-7 sm:size-9 bg-white/20 text-white hover:bg-white hover:text-[#5aa827]">
                      {/* Header — fixed, never clips */}
                      <div className="bg-[#67BA2E] p-4 sm:p-6 text-white flex-shrink-0">
                        <DialogHeader>
                          <div className="flex items-center gap-3">
                            <div className="size-9 sm:size-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="size-5 sm:size-6" />
                            </div>
                            <div className="flex-1 min-w-0 pr-9 sm:pr-11">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">Clinical Encounter Note</DialogTitle>
                                <Badge className="bg-white/20 text-white border-transparent font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md flex-shrink-0">
                                  #{visit.id.slice(0, 6).toUpperCase()}
                                </Badge>
                                {c.riskLevel ? (
                                  <Badge className="bg-white text-[#67BA2E] border-transparent font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md flex-shrink-0">
                                    {c.riskLevel}
                                  </Badge>
                                ) : null}
                              </div>
                              <DialogDescription className="text-white/80 font-medium text-[11px] mt-1 truncate">
                                {format(new Date(visit.createdAt), "dd MMM yyyy · hh:mm a")}
                              </DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                      </div>

                      <EncounterDetail c={c} visit={visit} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

type ClinicalData = ReturnType<typeof getClinicalData>

function QACard({ questionId, value }: { questionId: string; value: string }) {
  return (
    <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
      <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 leading-snug break-words">
        {QUESTION_PROMPTS.get(questionId) || questionId}
      </p>
      <p className="text-xs sm:text-sm font-black text-slate-800 mt-1 break-words whitespace-pre-wrap">
        {value}
      </p>
    </div>
  )
}

function SectionResponses({ sections, responses }: { sections: typeof step2Sections; responses: Record<string, any> }) {
  const groups = sections
    .map((section) => ({
      title: section.title,
      rows: section.questions
        .map((q) => ({ q, value: formatAnswer(q.id, responses[q.id]) }))
        .filter((row) => row.value !== ""),
    }))
    .filter((group) => group.rows.length > 0)

  if (groups.length === 0) return <EmptyNote />

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="text-[9px] font-black text-[#67BA2E] uppercase tracking-widest">{group.title}</p>
          <div className="space-y-1.5">
            {group.rows.map(({ q, value }) => (
              <QACard key={q.id} questionId={q.id} value={value} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function FlatResponses({ questions, responses }: { questions: typeof step5Questions; responses: Record<string, any> }) {
  const rows = questions
    .map((q) => ({ q, value: formatAnswer(q.id, responses[q.id]) }))
    .filter((row) => row.value !== "")

  if (rows.length === 0) return null

  return (
    <div className="space-y-1.5">
      {rows.map(({ q, value }) => (
        <QACard key={q.id} questionId={q.id} value={value} />
      ))}
    </div>
  )
}

function EncounterDetail({ c, visit }: { c: ClinicalData; visit: Assessment }) {
  const [activeTab, setActiveTab] = React.useState(0)

  return (
    <>
      {/* Tab navigation — its OWN scroll context so tabs never get clipped */}
      <div className="border-b border-slate-100 bg-white flex-shrink-0">
        <div
          className="flex gap-1.5 px-3 sm:px-5 py-3 overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          {WIZARD_STEPS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`whitespace-nowrap flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition border ${
                index === activeTab
                  ? "bg-[#67BA2E] text-white border-[#67BA2E]"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content — takes remaining height */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-7">
        {/* Tab 0: Member Info */}
        {activeTab === 0 ? (
          <Section icon={<UserSquare2 className="size-3 text-[#67BA2E]" />} title="Member Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {memberInfoFields.map((field) => {
                const raw = c.memberInfo[field.key]
                if (raw === undefined || raw === null || raw === "") return null
                const value = field.type === "date" ? formatMaybeDate(raw) : String(raw)
                return <FieldRow key={field.key} label={field.label} value={value} />
              })}
            </div>
          </Section>
        ) : null}

        {/* Tab 1: Factors 1-4 */}
        {activeTab === 1 ? (
          <Section icon={<ListChecks className="size-3 text-[#67BA2E]" />} title="Factors 1-4 Responses">
            <SectionResponses sections={step2Sections} responses={c.responses} />
          </Section>
        ) : null}

        {/* Tab 2: Factors 5-8 */}
        {activeTab === 2 ? (
          <Section icon={<ListChecks className="size-3 text-[#67BA2E]" />} title="Factors 5-8 Responses">
            <SectionResponses sections={step3Sections} responses={c.responses} />
          </Section>
        ) : null}

        {/* Tab 3: Factors 9-11 */}
        {activeTab === 3 ? (
          <Section icon={<ListChecks className="size-3 text-[#67BA2E]" />} title="Factors 9-11 Responses">
            <SectionResponses sections={step4Sections} responses={c.responses} />
          </Section>
        ) : null}

        {/* Tab 4: BMI & Vitals */}
        {activeTab === 4 ? (
          <div className="space-y-8">
            <Section icon={<Activity className="size-3 text-[#67BA2E]" />} title="Biometric Vitals">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <VitalBox icon={<Heart />} label="Blood Pressure" value={c.bmiVitals.bloodPressure ? `${c.bmiVitals.bloodPressure} mmHg` : "--"} />
                <VitalBox icon={<Droplet />} label="Blood Glucose" value={c.bmiVitals.bloodGlucose ? `${c.bmiVitals.bloodGlucose}` : "--"} />
                <VitalBox icon={<Gauge />} label="BMI" value={c.bmiVitals.calculatedBmi ? `${c.bmiVitals.calculatedBmi} ${c.bmiVitals.bmiCategory ? `(${c.bmiVitals.bmiCategory})` : ""}` : "--"} />
                <VitalBox icon={<Scale />} label="Weight" value={c.weightKg ? `${c.weightKg} kg` : "--"} />
                <VitalBox icon={<Ruler />} label="Height" value={c.heightInches ? `${c.heightInches} in` : "--"} />
              </div>
            </Section>

            <Section icon={<AlertTriangle className="size-3 text-[#67BA2E]" />} title={`Diagnoses (${c.diagnoses.length})`}>
              {c.diagnoses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {c.diagnoses.map((dx, i) => (
                    <Badge key={dx.id || i} variant="outline" className="bg-white border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg">
                      {dx.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <EmptyNote />
              )}
            </Section>

            <Section icon={<Pill className="size-3 text-[#67BA2E]" />} title={`Medications (${c.medications.length})`}>
              {c.medications.length > 0 ? (
                <div className="space-y-2">
                  {c.medications.map((med, i) => (
                    <div key={med.id || i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] flex-shrink-0">
                          <Pill size={14} />
                        </div>
                        <span className="font-black text-slate-800 text-sm truncate">{med.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pl-11 sm:pl-0">
                        {med.dosage ? (
                          <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold text-[10px]">{med.dosage}</Badge>
                        ) : null}
                        {med.frequency ? (
                          <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold text-[10px]">{med.frequency}</Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyNote />
              )}
            </Section>

            {c.followUpDate ? (
              <Section icon={<CalendarClock className="size-3 text-[#67BA2E]" />} title="Follow-up Plan">
                <div className="inline-flex items-center gap-2 p-3 px-4 bg-[#67BA2E]/5 rounded-xl border border-[#67BA2E]/15">
                  <CalendarClock className="size-4 text-[#67BA2E]" />
                  <span className="font-black text-slate-700 text-sm">{format(new Date(c.followUpDate), "PPP")}</span>
                </div>
              </Section>
            ) : null}

            <Section icon={<ListChecks className="size-3 text-[#67BA2E]" />} title="Additional Care Plan Responses">
              <FlatResponses questions={step5Questions} responses={c.responses} />
            </Section>
          </div>
        ) : null}

        {/* Tab 5: Summary & Sign */}
        {activeTab === 5 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Risk Score</p>
                <p className="text-3xl font-black text-slate-700 mt-1">{typeof c.riskScore === "number" ? c.riskScore : "--"}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Level</p>
                <p className="text-3xl font-black text-[#67BA2E] mt-1">{c.riskLevel || "--"}</p>
              </div>
            </div>

            <Section icon={<ClipboardList className="size-3 text-[#67BA2E]" />} title="SOAP Notes">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {c.soapNotes || "No clinical documentation provided."}
              </div>
            </Section>

            {c.overallSummary ? (
              <Section icon={<ClipboardList className="size-3 text-[#67BA2E]" />} title="Overall Assessment Summary">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {c.overallSummary}
                </div>
              </Section>
            ) : null}

            {c.supervisorReview ? (
              <Section icon={<ClipboardList className="size-3 text-[#67BA2E]" />} title="Supervisor Review">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {c.supervisorReview}
                </div>
              </Section>
            ) : null}

            {c.signatureUrl ? (
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSignature className="size-3 text-[#67BA2E]" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assessor / Patient Signature</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full sm:w-auto sm:inline-block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.signatureUrl} alt="Signature" className="h-20 sm:h-24 max-w-full object-contain mix-blend-multiply opacity-90" />
                </div>
              </div>
            ) : null}

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                  {visit.provider.user.firstName[0]}{visit.provider.user.lastName[0]}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digitally Signed by Dr. {visit.provider.user.lastName}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase italic">Confidential Medical Record</span>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  )
}

function formatMaybeDate(raw: unknown): string {
  const value = String(raw)
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime()) && /\d{4}-\d{2}-\d{2}/.test(value)) {
    return format(parsed, "PPP")
  }
  return value
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-0.5 break-words">{value}</p>
    </div>
  )
}

function EmptyNote() {
  return (
    <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">None recorded</p>
    </div>
  )
}

function VitalBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1 text-center">
      <div className="text-[#67BA2E] opacity-60">
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 14 })}
      </div>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-800">{value || "--"}</span>
    </div>
  )
}

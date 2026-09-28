import { normalizeBmiVitals, parseAssessmentData } from "@/lib/assessment-vitals"
import { formatProviderDisplayName } from "@/lib/format-provider-name"

/**
 * A patient-facing, serializable view of one clinical encounter: the nurse /
 * doctor assessment (if any) plus physician notes written around the same time.
 * Only real recorded values are included — nothing is defaulted or invented.
 */
export interface ClinicalRecordView {
  id: string
  date: string
  patientName: string
  providerName: string
  providerSpecialty: string
  hasAssessment: boolean
  isInitialAssessment: boolean
  vitals: { label: string; value: string }[]
  riskLevel: string
  riskScore: number | null
  assessmentSummary: string
  soapNotes: string
  supervisorReview: string
  /** Raw data.routineHomeVisitReassessment, rendered by the client modal. */
  routineReassessment: Record<string, unknown>
  medications: { name: string; dosage: string; frequency: string }[]
  diagnoses: string[]
  followUpDate: string | null
  physicianNotes: PhysicianNoteView[]
  signatures: { label: string; url: string }[]
}

export interface PhysicianNoteView {
  id: string
  date: string
  authorName: string
  chiefComplaint: string | null
  assessment: string
  plan: string | null
}

type ProviderInput = {
  id: string
  providerType: string
  specialty: string
  user: { firstName: string; lastName: string }
}

export type AssessmentInput = {
  id: string
  providerId: string
  createdAt: Date
  data: unknown
  signatureUrl: string | null
  patientSignatureUrl: string | null
  weightKg: number | null
  heightInches: number | null
  soapNotes: string | null
  followUpDate: Date | null
  medications: { name: string; dosage: string; frequency: string }[]
  diagnoses: { name: string }[]
  provider: ProviderInput
}

export type ClinicalAssessmentInput = {
  providerId: string
  createdAt: Date
  totalRiskScore: number
  riskLevel: string
  bmi: number
  bmiCategory: string
  bloodPressure: string
  bloodGlucose: string
  assessmentData: unknown
}

export type PhysicianNoteInput = {
  id: string
  noteDate: Date
  chiefComplaint: string | null
  assessment: string
  plan: string | null
  provider: ProviderInput
}

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonRecord) : {}
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function addVital(list: { label: string; value: string }[], label: string, value: unknown, suffix = "") {
  const text = asText(value)
  if (text && text !== "0") list.push({ label, value: `${text}${suffix}` })
}

export function toPhysicianNoteView(note: PhysicianNoteInput): PhysicianNoteView {
  return {
    id: note.id,
    date: note.noteDate.toISOString(),
    authorName: formatProviderDisplayName(note.provider),
    chiefComplaint: note.chiefComplaint,
    assessment: note.assessment,
    plan: note.plan,
  }
}

export function buildClinicalRecord(input: {
  id: string
  date: Date
  patientName: string
  provider: ProviderInput
  assessment: AssessmentInput | null
  /** The patient's assessment count before this one decides "initial" vs follow-up. */
  isInitialAssessment?: boolean
  clinicalAssessments: ClinicalAssessmentInput[]
  physicianNotes: PhysicianNoteInput[]
}): ClinicalRecordView {
  const { assessment } = input
  const physicianNotes = input.physicianNotes.map(toPhysicianNoteView)

  const base: ClinicalRecordView = {
    id: input.id,
    date: input.date.toISOString(),
    patientName: input.patientName,
    providerName: formatProviderDisplayName(input.provider),
    providerSpecialty: input.provider.specialty,
    hasAssessment: false,
    isInitialAssessment: false,
    vitals: [],
    riskLevel: "",
    riskScore: null,
    assessmentSummary: "",
    soapNotes: "",
    supervisorReview: "",
    routineReassessment: {},
    medications: [],
    diagnoses: [],
    followUpDate: null,
    physicianNotes,
    signatures: [],
  }

  if (!assessment) return base

  const data = parseAssessmentData(assessment.data)
  const summary = asRecord(data.summary)
  const bmiVitals = asRecord(data.bmiVitals)
  const signatures = asRecord(data.signatures)

  // ClinicalAssessment rows are written in the same transaction as the assessment.
  const matchedClinical = input.clinicalAssessments.find(
    (c) =>
      c.providerId === assessment.providerId &&
      Math.abs(c.createdAt.getTime() - assessment.createdAt.getTime()) <= 15_000
  )

  const v = normalizeBmiVitals({
    data: assessment.data,
    weightKg: assessment.weightKg,
    heightInches: assessment.heightInches,
    clinicalBmi: matchedClinical?.bmi,
    clinicalBmiCategory: matchedClinical?.bmiCategory,
    clinicalBloodPressure: matchedClinical?.bloodPressure,
    clinicalBloodGlucose: matchedClinical?.bloodGlucose,
    clinicalAssessmentData: matchedClinical?.assessmentData,
  })

  const vitals: { label: string; value: string }[] = []
  addVital(vitals, "Blood Pressure", v.bloodPressure, " mmHg")
  addVital(vitals, "Heart Rate", bmiVitals.heartRate ?? bmiVitals.pulse, " bpm")
  addVital(vitals, "Temperature", v.temperatureCelsius, " °C")
  addVital(vitals, "Weight", v.weightKg, " kg")
  addVital(vitals, "Height", v.heightInches, " in")
  addVital(
    vitals,
    "BMI",
    v.calculatedBmi ? `${v.calculatedBmi}${v.bmiCategory ? ` (${v.bmiCategory})` : ""}` : ""
  )
  addVital(vitals, "Blood Glucose", v.bloodGlucose)
  addVital(vitals, "SpO₂", v.oxygenSaturation, " %")
  addVital(vitals, "Respiration", v.respiration, " /min")
  if (asText(v.painScale) !== "") vitals.push({ label: "Pain Scale", value: `${v.painScale} / 10` })

  const medications =
    assessment.medications.length > 0
      ? assessment.medications
      : (Array.isArray(data.medications) ? data.medications : [])
          .map((m) => {
            const r = asRecord(m)
            return { name: asText(r.name), dosage: asText(r.dosage), frequency: asText(r.frequency) }
          })
          .filter((m) => m.name)

  const diagnoses =
    assessment.diagnoses.length > 0
      ? assessment.diagnoses.map((d) => d.name)
      : (Array.isArray(data.diagnoses) ? data.diagnoses : [])
          .map((d) => asText(typeof d === "string" ? d : asRecord(d).name))
          .filter(Boolean)

  const signatureUrl =
    assessment.signatureUrl || assessment.patientSignatureUrl || asText(signatures.assessorSignature)

  const riskScore = typeof summary.totalRiskScore === "number" ? summary.totalRiskScore : matchedClinical?.totalRiskScore

  return {
    ...base,
    hasAssessment: true,
    isInitialAssessment: input.isInitialAssessment ?? data.isFirstTimeAssessment !== false,
    vitals,
    riskLevel: asText(summary.riskLevel) || matchedClinical?.riskLevel || "",
    riskScore: riskScore ?? null,
    assessmentSummary: asText(summary.q98OverallAssessmentSummary),
    soapNotes: asText(assessment.soapNotes ?? data.soapNotes),
    supervisorReview: asText(summary.supervisorReview),
    routineReassessment: asRecord(data.routineHomeVisitReassessment),
    medications,
    diagnoses,
    followUpDate: assessment.followUpDate ? assessment.followUpDate.toISOString() : null,
    signatures: signatureUrl ? [{ label: `Assessor — ${formatProviderDisplayName(assessment.provider)}`, url: signatureUrl }] : [],
  }
}

/** Notes written from 12h before to 36h after an encounter belong to it. */
export const ENCOUNTER_WINDOW_BEFORE_MS = 12 * 60 * 60 * 1000
export const ENCOUNTER_WINDOW_AFTER_MS = 36 * 60 * 60 * 1000

export function isWithinEncounterWindow(anchor: Date, candidate: Date): boolean {
  const delta = candidate.getTime() - anchor.getTime()
  return delta >= -ENCOUNTER_WINDOW_BEFORE_MS && delta <= ENCOUNTER_WINDOW_AFTER_MS
}

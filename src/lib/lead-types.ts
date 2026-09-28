export const LEAD_TYPES = ["general", "patient_registration", "career_application"] as const
export type LeadType = (typeof LEAD_TYPES)[number]

const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  general: "General Question",
  patient_registration: "New Patient Registration",
  career_application: "Career Application",
}

export const CAREER_ROLES = [
  "Doctor",
  "Registered Nurse",
  "Physiotherapist",
  "Dietitian",
  "Psychologist",
  "General Clinical Staff",
] as const

export function leadTypeLabel(type: string): string {
  return LEAD_TYPE_LABELS[type as LeadType] ?? LEAD_TYPE_LABELS.general
}

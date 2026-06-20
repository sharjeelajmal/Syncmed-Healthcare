export type HealthCategory = "diagnosis" | "medications" | "vitals" | "allergies"

export interface VitalSignEntry {
  date: string
  bp?: string
  hr?: string
  temp?: string
  weight?: string
}

export interface PatientHealthData {
  diagnoses: string[]
  medications: string[]
  allergies: string[]
  vitalSigns: VitalSignEntry[]
}

export const HEALTH_CATEGORIES: HealthCategory[] = [
  "diagnosis",
  "medications",
  "vitals",
  "allergies",
]

export function isHealthCategory(value: string): value is HealthCategory {
  return HEALTH_CATEGORIES.includes(value as HealthCategory)
}

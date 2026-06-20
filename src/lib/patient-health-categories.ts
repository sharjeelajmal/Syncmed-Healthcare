import type { LucideIcon } from "lucide-react"
import {
  Stethoscope,
  Pill,
  Activity,
  AlertTriangle,
} from "lucide-react"
import type { HealthCategory, PatientHealthData } from "@/types/patient-health"

export interface HealthCategoryConfig {
  key: HealthCategory
  label: string
  description: string
  icon: LucideIcon
  accent: string
  accentBg: string
  accentBorder: string
  heroGradient: string
  glowColor: string
}

export const HEALTH_CATEGORY_CONFIG: Record<HealthCategory, HealthCategoryConfig> = {
  diagnosis: {
    key: "diagnosis",
    label: "Diagnosis",
    description: "Your documented clinical diagnoses and conditions on record.",
    icon: Stethoscope,
    accent: "text-emerald-700",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200/80",
    heroGradient: "from-emerald-500/15 via-teal-50/40 to-white/80",
    glowColor: "bg-emerald-400/20",
  },
  medications: {
    key: "medications",
    label: "Medications",
    description: "Active prescriptions and medication history from your care team.",
    icon: Pill,
    accent: "text-teal-700",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200/80",
    heroGradient: "from-teal-500/15 via-cyan-50/40 to-white/80",
    glowColor: "bg-teal-400/20",
  },
  vitals: {
    key: "vitals",
    label: "Vital Signs",
    description: "Blood pressure, heart rate, temperature, and weight over time.",
    icon: Activity,
    accent: "text-sky-700",
    accentBg: "bg-sky-50",
    accentBorder: "border-sky-200/80",
    heroGradient: "from-sky-500/15 via-blue-50/40 to-white/80",
    glowColor: "bg-sky-400/20",
  },
  allergies: {
    key: "allergies",
    label: "Allergies",
    description: "Known allergies and sensitivities flagged in your medical profile.",
    icon: AlertTriangle,
    accent: "text-amber-700",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200/80",
    heroGradient: "from-amber-500/15 via-orange-50/40 to-white/80",
    glowColor: "bg-amber-400/20",
  },
}

export function getHealthCategoryCount(
  key: HealthCategory,
  data: PatientHealthData
): number {
  switch (key) {
    case "diagnosis":
      return data.diagnoses.length
    case "medications":
      return data.medications.length
    case "vitals":
      return data.vitalSigns.length
    case "allergies":
      return data.allergies.length
  }
}

export function getHealthCategoryItems(
  key: HealthCategory,
  data: PatientHealthData
): string[] | PatientHealthData["vitalSigns"] {
  switch (key) {
    case "diagnosis":
      return data.diagnoses
    case "medications":
      return data.medications
    case "vitals":
      return data.vitalSigns
    case "allergies":
      return data.allergies
  }
}

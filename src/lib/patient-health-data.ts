import type { VitalSignEntry } from "@/components/patient/PatientHealthTabs"
import { normalizeBmiVitals, parseAssessmentData } from "@/lib/assessment-vitals"

type AssessmentWithRelations = {
  createdAt: Date
  data: unknown
  weightKg?: number | null
  heightInches?: number | null
  medications: { name: string; dosage?: string | null; frequency?: string | null }[]
  diagnoses: { name: string }[]
}

export function buildPatientHealthData(
  profileDiagnoses: string[],
  profileMedications: string[],
  profileAllergies: string[],
  assessments: AssessmentWithRelations[]
) {
  const diagnosisSet = new Set<string>(profileDiagnoses)
  const medicationSet = new Set<string>(profileMedications)
  const vitalSigns: VitalSignEntry[] = []

  for (const assessment of assessments) {
    for (const dx of assessment.diagnoses) {
      if (dx.name) diagnosisSet.add(dx.name)
    }

    for (const med of assessment.medications) {
      const label = [med.name, med.dosage, med.frequency].filter(Boolean).join(" · ")
      if (label) medicationSet.add(label)
    }

    const vitals = normalizeBmiVitals({
      data: assessment.data,
      weightKg: assessment.weightKg,
      heightInches: assessment.heightInches,
    })
    const legacy = parseAssessmentData(assessment.data).vitals as Record<string, string> | undefined
    const hasVitals =
      vitals.bloodPressure ||
      vitals.bloodGlucose ||
      vitals.temperatureCelsius ||
      vitals.respiration ||
      vitals.oxygenSaturation ||
      vitals.weightKg ||
      legacy?.bp ||
      legacy?.hr

    if (hasVitals) {
      vitalSigns.push({
        date: assessment.createdAt.toISOString(),
        bp: vitals.bloodPressure || legacy?.bp,
        hr: vitals.respiration || legacy?.hr,
        temp: vitals.temperatureCelsius
          ? `${vitals.temperatureCelsius} °C`
          : legacy?.temp,
        weight: vitals.weightKg ? `${vitals.weightKg} kg` : legacy?.weight,
      })
    }
  }

  return {
    diagnoses: Array.from(diagnosisSet),
    medications: Array.from(medicationSet),
    allergies: profileAllergies,
    vitalSigns,
  }
}

export type AssessmentRiskLevel = "LOW" | "MODERATE" | "HIGH"

export interface ScoredOption {
  value: string
  score?: number
}

export interface ScoredQuestion {
  id: string
  options?: ScoredOption[]
}

export interface AssessmentVitalsInput {
  bloodPressure: string
  bloodGlucose: string
  temperatureCelsius: string
  respiration: string
  painScale: string
  oxygenSaturation: string
  calculatedBmi: number
}

export interface CalculateTotalRiskScoreInput {
  answers: Record<string, string | string[]>
  riskScoreMap: Map<string, Map<string, number>>
  vitals: AssessmentVitalsInput
}

export const MEDICATION_DOSAGE_UNITS = [
  "Milligrams",
  "Micrograms",
  "mg",
  "mcg",
  "meq",
  "Units",
] as const

export type MedicationDosageUnit = (typeof MEDICATION_DOSAGE_UNITS)[number]

export function deriveRiskLevel(totalRiskScore: number): AssessmentRiskLevel {
  if (totalRiskScore <= 20) return "LOW"
  if (totalRiskScore <= 45) return "MODERATE"
  return "HIGH"
}

export function buildRiskScoreMap(questions: ScoredQuestion[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>()

  if (!Array.isArray(questions)) {
    return map
  }

  for (const question of questions) {
    if (!question.options) continue

    const optionScores = new Map<string, number>()
    for (const option of question.options) {
      if (typeof option.score === "number") {
        optionScores.set(option.value, option.score)
      }
    }

    if (optionScores.size > 0) {
      map.set(question.id, optionScores)
    }
  }

  return map
}

function parseBloodPressure(bp: string): { systolic: number; diastolic: number } | null {
  const trimmed = bp.trim()
  if (!trimmed) return null

  const match = trimmed.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/)
  if (!match) return null

  const systolic = Number(match[1])
  const diastolic = Number(match[2])
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null
  if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200) return null
  if (diastolic > systolic) return null

  return { systolic, diastolic }
}

/** AHA-aligned BP risk points. Normal: 120/80 or lower = 0. */
function scoreBloodPressure(bloodPressure: string): number {
  const parsed = parseBloodPressure(bloodPressure)
  if (!parsed) return 0

  const { systolic, diastolic } = parsed

  // Normal: 120/80 or lower
  if (systolic <= 120 && diastolic <= 80) return 0

  // Hypertensive crisis
  if (systolic >= 180 || diastolic >= 120) return 5

  // Stage 2: >= 140 systolic or >= 90 diastolic
  if (systolic >= 140 || diastolic >= 90) return 3

  // Stage 1: 130-139 systolic or 81-89 diastolic (>80, not >=80 at boundary)
  if (systolic >= 130 || diastolic > 80) return 2

  // Elevated: 121-129 systolic and diastolic still <= 80
  if (systolic > 120 && systolic <= 129 && diastolic <= 80) return 1

  return 0
}

function parseNumericVital(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = Number(trimmed.replace(/[^\d.]/g, ""))
  if (!Number.isFinite(parsed)) return null

  return parsed
}

function isValidBloodGlucose(bloodGlucose: string): boolean {
  const value = parseNumericVital(bloodGlucose)
  if (value === null || value <= 0) return false
  return value >= 2 && value <= 40
}

function scoreBloodGlucose(bloodGlucose: string): number {
  if (!isValidBloodGlucose(bloodGlucose)) return 0

  const value = parseNumericVital(bloodGlucose)!
  if (value > 11) return 4
  if (value >= 7.1) return 2
  if (value >= 5.6) return 1
  if (value < 3.9) return 2
  return 0
}

function isValidTemperatureCelsius(temperatureCelsius: string): boolean {
  const value = parseNumericVital(temperatureCelsius)
  if (value === null || value <= 0) return false
  return value >= 30 && value <= 45
}

function scoreTemperatureCelsius(temperatureCelsius: string): number {
  if (!isValidTemperatureCelsius(temperatureCelsius)) return 0

  const value = parseNumericVital(temperatureCelsius)!
  if (value > 39) return 3
  if (value >= 38.1) return 2
  if (value >= 37.3) return 1
  if (value < 35) return 3
  return 0
}

function isValidRespiration(respiration: string): boolean {
  const value = parseNumericVital(respiration)
  if (value === null || value <= 0) return false
  return Number.isInteger(value) && value >= 5 && value <= 60
}

function scoreRespiration(respiration: string): number {
  if (!isValidRespiration(respiration)) return 0

  const value = parseNumericVital(respiration)!
  if (value < 10 || value > 24) return 3
  if (value <= 11 || value >= 21) return 1
  return 0
}

function isValidPainScale(painScale: string): boolean {
  const trimmed = painScale.trim()
  if (!trimmed) return false

  const value = Number(trimmed)
  if (!Number.isFinite(value) || !Number.isInteger(value)) return false
  return value >= 0 && value <= 10
}

function scorePainScale(painScale: string): number {
  if (!isValidPainScale(painScale)) return 0

  const value = Number(painScale.trim())
  if (value >= 9) return 4
  if (value >= 7) return 2
  if (value >= 4) return 1
  return 0
}

function isValidOxygenSaturation(oxygenSaturation: string): boolean {
  const value = parseNumericVital(oxygenSaturation)
  if (value === null || value <= 0) return false
  return value >= 50 && value <= 100
}

function scoreOxygenSaturation(oxygenSaturation: string): number {
  if (!isValidOxygenSaturation(oxygenSaturation)) return 0

  const value = parseNumericVital(oxygenSaturation)!
  if (value < 85) return 5
  if (value < 90) return 3
  if (value < 95) return 2
  return 0
}

function scoreBmi(calculatedBmi: number): number {
  if (!Number.isFinite(calculatedBmi) || calculatedBmi <= 0) return 0
  if (calculatedBmi >= 40) return 4
  if (calculatedBmi >= 35) return 3
  if (calculatedBmi >= 30) return 2
  if (calculatedBmi >= 25) return 1
  if (calculatedBmi < 18.5) return 1
  return 0
}

export function scoreAssessmentAnswers(
  answers: Record<string, string | string[]>,
  riskScoreMap: Map<string, Map<string, number>>
): number {
  let total = 0

  for (const [questionId, optionScores] of riskScoreMap.entries()) {
    const answer = answers[questionId]
    if (typeof answer === "string") {
      total += optionScores.get(answer) ?? 0
    } else if (Array.isArray(answer)) {
      for (const selected of answer) {
        total += optionScores.get(selected) ?? 0
      }
    }
  }

  return total
}

export function scoreVitals(vitals: AssessmentVitalsInput): number {
  return (
    scoreBloodPressure(vitals.bloodPressure) +
    scoreBloodGlucose(vitals.bloodGlucose) +
    scoreTemperatureCelsius(vitals.temperatureCelsius) +
    scoreRespiration(vitals.respiration) +
    scorePainScale(vitals.painScale) +
    scoreOxygenSaturation(vitals.oxygenSaturation) +
    scoreBmi(vitals.calculatedBmi)
  )
}

export function calculateTotalRiskScore({
  answers,
  riskScoreMap,
  vitals,
}: CalculateTotalRiskScoreInput): number {
  return scoreAssessmentAnswers(answers, riskScoreMap) + scoreVitals(vitals)
}

type JsonRecord = Record<string, unknown>

export interface NormalizedBmiVitals {
  weightKg: number | null
  heightInches: number | null
  calculatedBmi: number | null
  bmiCategory: string
  bloodPressure: string
  bloodGlucose: string
  temperatureCelsius: string
  respiration: string
  painScale: string
  oxygenSaturation: string
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function parseAssessmentData(value: unknown): JsonRecord {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value)
      return isJsonRecord(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return isJsonRecord(value) ? value : {}
}

function asJsonRecord(value: unknown): JsonRecord {
  return isJsonRecord(value) ? value : {}
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ""
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue
    const parsed = typeof value === "number" ? value : Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

export interface NormalizeBmiVitalsInput {
  data?: unknown
  weightKg?: number | null
  heightInches?: number | null
  clinicalBmi?: number | null
  clinicalBmiCategory?: string | null
  clinicalBloodPressure?: string | null
  clinicalBloodGlucose?: string | null
  clinicalAssessmentData?: unknown
}

export function normalizeBmiVitals(input: NormalizeBmiVitalsInput): NormalizedBmiVitals {
  const data = parseAssessmentData(input.data)
  const bmiVitals = asJsonRecord(data.bmiVitals)
  const legacyVitals = asJsonRecord(data.vitals)

  const clinicalData = parseAssessmentData(input.clinicalAssessmentData)
  const clinicalBmiVitals = asJsonRecord(clinicalData.bmiVitals)

  const weightKg = pickNumber(input.weightKg, bmiVitals.weightKg, clinicalBmiVitals.weightKg)
  const heightInches = pickNumber(
    input.heightInches,
    bmiVitals.heightInches,
    clinicalBmiVitals.heightInches,
    (() => {
      const heightCm = pickNumber(bmiVitals.heightCm, clinicalBmiVitals.heightCm)
      return heightCm ? Number((heightCm / 2.54).toFixed(2)) : null
    })()
  )

  const calculatedBmi = pickNumber(
    bmiVitals.calculatedBmi,
    clinicalBmiVitals.calculatedBmi,
    input.clinicalBmi
  )

  const painScaleRaw = pickString(
    bmiVitals.painScale,
    clinicalBmiVitals.painScale
  )

  return {
    weightKg,
    heightInches,
    calculatedBmi,
    bmiCategory: pickString(bmiVitals.bmiCategory, clinicalBmiVitals.bmiCategory, input.clinicalBmiCategory),
    bloodPressure: pickString(
      bmiVitals.bloodPressure,
      clinicalBmiVitals.bloodPressure,
      input.clinicalBloodPressure,
      legacyVitals.bp
    ),
    bloodGlucose: pickString(
      bmiVitals.bloodGlucose,
      clinicalBmiVitals.bloodGlucose,
      input.clinicalBloodGlucose
    ),
    temperatureCelsius: pickString(
      bmiVitals.temperatureCelsius,
      clinicalBmiVitals.temperatureCelsius,
      legacyVitals.temp
    ),
    respiration: pickString(bmiVitals.respiration, clinicalBmiVitals.respiration, legacyVitals.hr),
    painScale: painScaleRaw !== "" ? painScaleRaw : "",
    oxygenSaturation: pickString(
      bmiVitals.oxygenSaturation,
      clinicalBmiVitals.oxygenSaturation
    ),
  }
}

export function formatVitalDisplay(value: string | number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "--"
  const text = String(value).trim()
  if (!text) return "--"
  return suffix ? `${text}${suffix}` : text
}

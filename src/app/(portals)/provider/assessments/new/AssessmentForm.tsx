"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Calculator,
  Calendar as CalendarIcon,
  Loader2,
  Pill,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { toast } from "sonner"

import { submitAssessment } from "@/app/actions/assessment.actions"
import {
  buildRiskScoreMap,
  calculateTotalRiskScore,
  deriveRiskLevel,
  MEDICATION_DOSAGE_UNITS,
  type MedicationDosageUnit,
} from "@/lib/assessment-risk-score"
import {
  getScoredQuestionsForAssessment,
  getWizardSteps,
  memberInfoFields,
  step2Sections,
  step3Sections,
  step4Sections,
  step5Questions,
  type QuestionDefinition,
} from "@/lib/assessment-questions"
export {
  WIZARD_STEPS,
  FOLLOW_UP_WIZARD_STEPS,
  getWizardSteps,
  memberInfoFields,
  step2Sections,
  step3Sections,
  step4Sections,
  step5Questions,
} from "@/lib/assessment-questions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PureCalendar } from "@/components/ui/pure-calendar"
import { SignatureModal } from "@/components/ui/signature-modal"
import { Textarea } from "@/components/ui/textarea"

interface AssessmentFormProps {
  patientId: string
  providerId: string
  isCaseManager?: boolean
  isFirstTimeAssessment?: boolean
}

interface MedicationDraft {
  name: string
  dosageAmount: string
  dosageUnit: MedicationDosageUnit
  frequency: string
}

interface DiagnosisDraft {
  name: string
}

function getBmiCategory(bmi: number): string {
  if (!Number.isFinite(bmi) || bmi <= 0) return "N/A"
  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Normal"
  if (bmi < 30) return "Overweight"
  if (bmi < 35) return "Obese Class 1"
  if (bmi < 40) return "Obese Class 2"
  return "Obese Class 3"
}

function parseDateValue(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed
}

function formatDateValue(date?: Date): string {
  if (!date) return ""
  return date.toISOString().split("T")[0] ?? ""
}

function sanitizePromptText(text: string): string {
  return text.replace(/\[Case Manager\]/g, "Case Manager")
}

const ASSESSMENT_MIN_DATE = new Date(1900, 0, 1)
const ASSESSMENT_MAX_DATE = new Date()
const FOLLOW_UP_MIN_DATE = new Date(new Date().setHours(24, 0, 0, 0))
const FOLLOW_UP_MAX_DATE = new Date(new Date().getFullYear() + 10, 11, 31)

interface AssessmentPureDateFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  minDate?: Date
  maxDate?: Date
}

function AssessmentPureDateField({
  value,
  onChange,
  disabled = false,
  placeholder = "Select Date",
  minDate = ASSESSMENT_MIN_DATE,
  maxDate = ASSESSMENT_MAX_DATE,
}: AssessmentPureDateFieldProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseDateValue(value)

  return (
    <Popover open={open} onOpenChange={(nextOpen) => !disabled && setOpen(nextOpen)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="input-premium h-12 w-full flex items-center justify-between px-4 font-normal text-slate-600 bg-white border-slate-200"
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-[#67BA2E]" />
            {selectedDate ? format(selectedDate, DISPLAY_DATE_FORMAT) : <span>{placeholder}</span>}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[9999] bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden"
        align="start"
      >
        <PureCalendar
          selectedDate={selectedDate}
          onSelect={(newDate) => {
            onChange(formatDateValue(newDate))
            setOpen(false)
          }}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export function AssessmentForm({
  patientId,
  providerId,
  isCaseManager = true,
  isFirstTimeAssessment = true,
}: AssessmentFormProps) {
  const router = useRouter()
  const wizardSteps = React.useMemo(
    () => getWizardSteps(isFirstTimeAssessment),
    [isFirstTimeAssessment]
  )
  const [currentStep, setCurrentStep] = React.useState(0)
  const topAnchorRef = React.useRef<HTMLDivElement>(null)
  const [isSubmitting, startTransition] = React.useTransition()
  const [isSignatureModalOpen, setIsSignatureModalOpen] = React.useState(false)

  const [memberInfo, setMemberInfo] = React.useState<Record<string, string>>({})
  const [answers, setAnswers] = React.useState<Record<string, string | string[]>>({})
  const [weightKg, setWeightKg] = React.useState("")
  const [heightInches, setHeightInches] = React.useState("")
  const [bloodPressure, setBloodPressure] = React.useState("")
  const [bloodGlucose, setBloodGlucose] = React.useState("")
  const [temperatureCelsius, setTemperatureCelsius] = React.useState("")
  const [respiration, setRespiration] = React.useState("")
  const [painScale, setPainScale] = React.useState("0")
  const [oxygenSaturation, setOxygenSaturation] = React.useState("")
  const [soapNotes, setSoapNotes] = React.useState("")
  const [followUpDate, setFollowUpDate] = React.useState("")
  const [medications, setMedications] = React.useState<MedicationDraft[]>([
    { name: "", dosageAmount: "", dosageUnit: "mg", frequency: "" },
  ])
  const [diagnoses, setDiagnoses] = React.useState<DiagnosisDraft[]>([{ name: "" }])
  const [summaryText, setSummaryText] = React.useState("")
  const [supervisorReview, setSupervisorReview] = React.useState("")

  const { calculatedBmi, bmiCategory } = React.useMemo(() => {
    const weight = Number(weightKg)
    const height = Number(heightInches)

    if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
      return { calculatedBmi: 0, bmiCategory: "N/A" }
    }

    const nextBmi = weight / (height * 0.0254) ** 2
    const rounded = Number(nextBmi.toFixed(1))
    return { calculatedBmi: rounded, bmiCategory: getBmiCategory(rounded) }
  }, [weightKg, heightInches])

  const riskScoreMap = React.useMemo(
    () => buildRiskScoreMap(getScoredQuestionsForAssessment(isFirstTimeAssessment)),
    [isFirstTimeAssessment]
  )

  const totalRiskScore = React.useMemo(
    () =>
      calculateTotalRiskScore({
        answers,
        riskScoreMap,
        vitals: {
          bloodPressure,
          bloodGlucose,
          temperatureCelsius,
          respiration,
          painScale,
          oxygenSaturation,
          calculatedBmi,
        },
      }),
    [
      answers,
      riskScoreMap,
      bloodPressure,
      bloodGlucose,
      temperatureCelsius,
      respiration,
      painScale,
      oxygenSaturation,
      calculatedBmi,
    ]
  )

  const riskLevel = deriveRiskLevel(totalRiskScore)

  const updateSingleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const updateMultiAnswer = (questionId: string, value: string, checked: boolean) => {
    setAnswers((prev) => {
      const existing = Array.isArray(prev[questionId]) ? prev[questionId] : []
      const nextValues = checked
        ? [...existing, value]
        : existing.filter((item) => item !== value)
      return { ...prev, [questionId]: nextValues }
    })
  }

  const isQuestionDisabled = (question: QuestionDefinition): boolean => {
    return Boolean(question.caseManagerOnly && !isCaseManager)
  }

  const renderQuestion = (question: QuestionDefinition) => {
    const disabled = isQuestionDisabled(question)
    const value = answers[question.id]

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {sanitizePromptText(question.prompt)}
            {question.required ? <span className="ml-1 text-rose-500">*</span> : null}
          </p>
          {question.caseManagerOnly ? (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 whitespace-nowrap shrink-0">Case Manager</Badge>
          ) : null}
        </div>

        {question.type === "text" ? (
          <Input
            value={typeof value === "string" ? value : ""}
            onChange={(event) => updateSingleAnswer(question.id, event.target.value)}
            placeholder={question.placeholder ?? "Enter response"}
            disabled={disabled}
            className="h-11 text-slate-700 border-slate-200"
          />
        ) : null}

        {question.type === "textarea" ? (
          <Textarea
            value={typeof value === "string" ? value : ""}
            onChange={(event) => updateSingleAnswer(question.id, event.target.value)}
            placeholder={question.placeholder ?? "Enter response"}
            disabled={disabled}
            className="min-h-28 text-slate-700 border-slate-200"
          />
        ) : null}

        {question.type === "date" ? (
          <div className="max-w-xs">
            <AssessmentPureDateField
              value={typeof value === "string" ? value : ""}
              onChange={(nextValue) => updateSingleAnswer(question.id, nextValue)}
              disabled={disabled}
              placeholder="Select date"
            />
          </div>
        ) : null}

        {question.type === "single" && question.options ? (
          <div className="grid gap-2">
            {question.options.map((option) => {
              const checked = value === option.value
              return (
                <button
                  key={`${question.id}-${option.value}`}
                  type="button"
                  onClick={() => !disabled && updateSingleAnswer(question.id, option.value)}
                  disabled={disabled}
                  className={`text-left px-4 py-3 rounded-xl border transition ${
                    checked
                      ? "border-[#67BA2E] bg-emerald-50 text-slate-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {typeof option.score === "number" ? (
                    <span className="ml-2 text-xs text-slate-500">+{option.score}</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : null}

        {question.type === "multi" && question.options ? (
          <div className="grid gap-3">
            {question.options.map((option) => {
              const selectedValues = Array.isArray(value) ? value : []
              const checked = selectedValues.includes(option.value)
              return (
                <label key={`${question.id}-${option.value}`} className="flex items-start gap-3">
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(checkedState) =>
                      updateMultiAnswer(question.id, option.value, Boolean(checkedState))
                    }
                    className="mt-1"
                  />
                  <span className="text-sm text-slate-700">
                    {option.label}
                    {typeof option.score === "number" ? (
                      <span className="ml-2 text-xs text-slate-500">+{option.score}</span>
                    ) : null}
                  </span>
                </label>
              )
            })}
          </div>
        ) : null}
      </motion.div>
    )
  }

  const validateMemberInfoStep = () => {
    for (const field of memberInfoFields) {
      if (!field.required) continue
      if (!memberInfo[field.key]?.trim()) {
        toast.error(`Please complete ${field.label}.`)
        return false
      }
    }
    return true
  }

  const activeStep = wizardSteps[currentStep]

  const handleNext = () => {
    if (currentStep === 0 && !validateMemberInfoStep()) return
    setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length - 1))
  }

  React.useEffect(() => {
    setCurrentStep((prev) => Math.min(prev, wizardSteps.length - 1))
  }, [wizardSteps.length])

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  React.useEffect(() => {
    const node = topAnchorRef.current
    if (!node) return
    const top = node.getBoundingClientRect().top + window.scrollY - 16
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" })
  }, [currentStep])

  const updateMedicationField = (
    index: number,
    field: keyof MedicationDraft,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    )
  }

  const addMedicationRow = () => {
    setMedications((prev) => [
      ...prev,
      { name: "", dosageAmount: "", dosageUnit: "mg", frequency: "" },
    ])
  }

  const formatMedicationDosage = (medication: MedicationDraft) => {
    const amount = medication.dosageAmount.trim()
    const unit = medication.dosageUnit.trim()
    if (!amount) return ""
    return unit ? `${amount} ${unit}` : amount
  }

  const removeMedicationRow = (index: number) => {
    setMedications((prev) => (prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)))
  }

  const updateDiagnosisField = (index: number, value: string) => {
    setDiagnoses((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, name: value } : item
      )
    )
  }

  const addDiagnosisRow = () => {
    setDiagnoses((prev) => [...prev, { name: "" }])
  }

  const removeDiagnosisRow = (index: number) => {
    setDiagnoses((prev) => (prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)))
  }

  const handleSignatureSave = (signatureBase64: string) => {
    setIsSignatureModalOpen(false)

    startTransition(async () => {
      if (!bloodPressure.trim() || !bloodGlucose.trim() || calculatedBmi <= 0) {
        toast.error("Blood pressure, blood glucose, and BMI fields are required.")
        return
      }

      const normalizedMedications = medications
        .map((item) => ({
          name: item.name.trim(),
          dosage: formatMedicationDosage(item),
          dosageAmount: item.dosageAmount.trim(),
          dosageUnit: item.dosageUnit,
          frequency: item.frequency.trim(),
        }))
        .filter((item) => item.name || item.dosage || item.frequency)

      const invalidMedication = normalizedMedications.find(
        (item) => !item.name || !item.dosage || !item.frequency
      )
      if (invalidMedication) {
        toast.error("Each medication entry must include name, dosage amount, unit, and frequency.")
        return
      }

      const normalizedDiagnoses = diagnoses
        .map((item) => ({ name: item.name.trim() }))
        .filter((item) => item.name)

      const heightInchesNumber = Number(heightInches)
      const weightKgNumber = Number(weightKg)
      const heightCm = Number.isFinite(heightInchesNumber)
        ? Number((heightInchesNumber * 2.54).toFixed(2))
        : 0
      const followUpDateValue = parseDateValue(followUpDate)

      const assessmentData = {
        memberInfo,
        isFirstTimeAssessment,
        responses: answers,
        bmiVitals: {
          weightKg,
          heightInches,
          heightCm,
          calculatedBmi,
          bmiCategory,
          bloodPressure,
          bloodGlucose,
          temperatureCelsius,
          respiration,
          painScale: Number(painScale),
          oxygenSaturation,
        },
        medications: normalizedMedications,
        diagnoses: normalizedDiagnoses,
        soapNotes,
        followUpDate: followUpDateValue ? followUpDateValue.toISOString() : null,
        summary: {
          q98OverallAssessmentSummary: summaryText,
          supervisorReview,
          totalRiskScore,
          riskLevel,
        },
        signatures: {
          assessorSignature: signatureBase64,
        },
      }

      const result = await submitAssessment({
        patientId,
        providerId,
        totalRiskScore,
        bmi: calculatedBmi,
        bmiCategory,
        bloodPressure,
        bloodGlucose,
        medications: normalizedMedications,
        diagnoses: normalizedDiagnoses,
        signatureUrl: signatureBase64,
        weightKg: Number.isFinite(weightKgNumber) ? weightKgNumber : undefined,
        heightInches: Number.isFinite(heightInchesNumber) ? heightInchesNumber : undefined,
        soapNotes: soapNotes.trim(),
        followUpDate: followUpDateValue ?? undefined,
        assessmentData,
        revalidatePathname: `/provider/patients/${patientId}`,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(`Assessment submitted successfully. Risk level: ${result.riskLevel}`)
      router.push(`/provider/patients/${patientId}`)
      router.refresh()
    })
  }

  return (
    <>
      <div ref={topAnchorRef} aria-hidden className="h-0 w-0" />
      <div className="sticky top-3 z-20 rounded-2xl border border-emerald-200 bg-emerald-50/95 backdrop-blur p-4 flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Total Risk Score</p>
          <p className="text-2xl font-black text-slate-700">{totalRiskScore}</p>
        </div>
        <Badge className="bg-[#67BA2E] text-white border-transparent px-3 py-1.5">{riskLevel} RISK</Badge>
      </div>

      {!isFirstTimeAssessment ? (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Follow-up assessment: factor tabs (1-11) are hidden because this patient already has prior assessments on record.
        </div>
      ) : null}

      <div
        className={`grid gap-2 mb-8 ${
          wizardSteps.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-6"
        }`}
      >
        {wizardSteps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`rounded-xl px-2 py-2 text-[11px] font-bold transition border whitespace-nowrap overflow-hidden text-ellipsis ${
              index === currentStep
                ? "bg-[#67BA2E] text-white border-[#67BA2E]"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {step}
          </button>
        ))}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6"
      >
        {activeStep === "Member Info" ? (
          <div className="grid md:grid-cols-2 gap-4">
            {memberInfoFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  {field.label}
                  {field.required ? <span className="ml-1 text-rose-500">*</span> : null}
                </Label>
                {field.type === "date" ? (
                  <AssessmentPureDateField
                    value={memberInfo[field.key] ?? ""}
                    onChange={(nextValue) =>
                      setMemberInfo((prev) => ({ ...prev, [field.key]: nextValue }))
                    }
                    placeholder={`Select ${field.label}`}
                  />
                ) : (
                  <Input
                    type="text"
                    value={memberInfo[field.key] ?? ""}
                    onChange={(event) =>
                      setMemberInfo((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                    className="h-11 border-slate-200 text-slate-700"
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}

        {activeStep === "Factors 1-4" ? (
          <div className="space-y-6">
            {step2Sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">{section.title}</h3>
                  {section.description ? <p className="text-sm text-slate-500">{section.description}</p> : null}
                </div>
                {section.questions.map(renderQuestion)}
              </section>
            ))}
          </div>
        ) : null}

        {activeStep === "Factors 5-8" ? (
          <div className="space-y-6">
            {step3Sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700">{section.title}</h3>
                {section.questions.map(renderQuestion)}
              </section>
            ))}
          </div>
        ) : null}

        {activeStep === "Factors 9-11" ? (
          <div className="space-y-6">
            {step4Sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700">{section.title}</h3>
                {section.questions.map(renderQuestion)}
              </section>
            ))}
          </div>
        ) : null}

        {activeStep === "BMI & Vitals" ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-[#67BA2E]" />
                <h3 className="text-lg font-bold text-slate-700">BMI & Physical Health Indicators</h3>
              </div>
              <p className="text-sm text-slate-600">Enter weight in kg and height in inches to auto-calculate BMI and category.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Weight (kg)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="h-11 border-slate-200 text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Height (inches)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="h-11 border-slate-200 text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Calculated BMI</Label>
                  <Input value={calculatedBmi > 0 ? String(calculatedBmi) : ""} readOnly className="h-11 border-slate-200 text-slate-700 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">BMI Category</Label>
                  <Input value={bmiCategory} readOnly className="h-11 border-slate-200 text-slate-700 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Blood Pressure (mmHg)</Label>
                  <Input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="e.g. 120/80" className="h-11 border-slate-200 text-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Blood Glucose</Label>
                  <Input value={bloodGlucose} onChange={(e) => setBloodGlucose(e.target.value)} placeholder="e.g. 6.2 mmol/L" className="h-11 border-slate-200 text-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Temperature (°C)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={temperatureCelsius}
                    onChange={(e) => setTemperatureCelsius(e.target.value)}
                    placeholder="e.g. 36.8"
                    className="h-11 border-slate-200 text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Respiration (breaths/min)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={respiration}
                    onChange={(e) => setRespiration(e.target.value)}
                    placeholder="e.g. 16"
                    className="h-11 border-slate-200 text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Pain Scale (0-10)</Label>
                  <Select value={painScale} onValueChange={setPainScale}>
                    <SelectTrigger className="h-11 border-slate-200 text-slate-700">
                      <SelectValue placeholder="Select pain level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 11 }, (_, value) => (
                        <SelectItem key={value} value={String(value)}>
                          {value} / 10
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Oxygen Saturation (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(e.target.value)}
                    placeholder="e.g. 98"
                    className="h-11 border-slate-200 text-slate-700"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Pill className="size-4 text-[#67BA2E]" />
                  <h3 className="text-lg font-bold text-slate-700">Medications</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMedicationRow}
                  className="h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="size-4 mr-1" />
                  Add Another Medication
                </Button>
              </div>
              <div className="space-y-3">
                {medications.map((medication, index) => (
                  <div
                    key={`medication-${index}`}
                    className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_auto] rounded-xl border border-slate-200 p-3"
                  >
                    <Input
                      value={medication.name}
                      onChange={(event) => updateMedicationField(index, "name", event.target.value)}
                      placeholder="Medication name"
                      className="h-11 border-slate-200"
                    />
                    <Input
                      value={medication.dosageAmount}
                      onChange={(event) => updateMedicationField(index, "dosageAmount", event.target.value)}
                      placeholder="Dosage amount"
                      className="h-11 border-slate-200"
                    />
                    <Select
                      value={medication.dosageUnit}
                      onValueChange={(value) =>
                        updateMedicationField(index, "dosageUnit", value as MedicationDosageUnit)
                      }
                    >
                      <SelectTrigger className="h-11 border-slate-200 text-slate-700">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICATION_DOSAGE_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={medication.frequency}
                      onChange={(event) => updateMedicationField(index, "frequency", event.target.value)}
                      placeholder="Frequency (e.g. twice daily)"
                      className="h-11 border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeMedicationRow(index)}
                      className="h-11 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      aria-label={`Remove medication ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-4 text-[#67BA2E]" />
                  <h3 className="text-lg font-bold text-slate-700">Diagnoses</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDiagnosisRow}
                  className="h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="size-4 mr-1" />
                  Add Another Diagnosis
                </Button>
              </div>
              <div className="space-y-3">
                {diagnoses.map((diagnosis, index) => (
                  <div
                    key={`diagnosis-${index}`}
                    className="grid gap-3 md:grid-cols-[1fr_auto] rounded-xl border border-slate-200 p-3"
                  >
                    <Input
                      value={diagnosis.name}
                      onChange={(event) => updateDiagnosisField(index, event.target.value)}
                      placeholder="Diagnosis"
                      className="h-11 border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeDiagnosisRow(index)}
                      className="h-11 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      aria-label={`Remove diagnosis ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="text-lg font-bold text-slate-700">Follow-up Plan</h3>
              <div className="max-w-sm">
                <AssessmentPureDateField
                  value={followUpDate}
                  onChange={setFollowUpDate}
                  placeholder="Select follow-up date"
                  minDate={FOLLOW_UP_MIN_DATE}
                  maxDate={FOLLOW_UP_MAX_DATE}
                />
              </div>
            </section>

            <section className="space-y-4">{step5Questions.filter((q) => q.id !== "q94").map(renderQuestion)}</section>
          </div>
        ) : null}

        {activeStep === "Summary & Sign" ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4">
              <h3 className="text-lg font-bold text-slate-700">Assessment Conclusion & Risk Score Summary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Total Risk Score</p>
                  <p className="text-3xl font-black text-slate-700">{totalRiskScore}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Risk Level</p>
                  <p className="text-3xl font-black text-[#67BA2E]">{riskLevel}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4">
              <h3 className="text-lg font-bold text-slate-700">SOAP Notes</h3>
              <Textarea
                value={soapNotes}
                onChange={(event) => setSoapNotes(event.target.value)}
                className="min-h-28 border-slate-200 text-slate-700"
                placeholder="Subjective, Objective, Assessment, and Plan notes."
              />
            </section>

            <section className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-700">Q98 Case Manager Overall Assessment Summary</h3>
                {!isCaseManager ? (
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                    <ShieldAlert className="size-3.5" />
                    Read only for non-Case Manager
                  </div>
                ) : null}
              </div>
              <Textarea
                value={summaryText}
                onChange={(event) => setSummaryText(event.target.value)}
                disabled={!isCaseManager}
                className="min-h-32 border-slate-200 text-slate-700"
                placeholder="Overall assessment summary and recommended care plan actions."
              />
              <Textarea
                value={supervisorReview}
                onChange={(event) => setSupervisorReview(event.target.value)}
                disabled={!isCaseManager}
                className="min-h-24 border-slate-200 text-slate-700"
                placeholder="Supervisor review notes."
              />
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <AlertCircle className="size-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">Final submission requires digital signature capture before the assessment is saved.</p>
            </section>
          </div>
        ) : null}
      </motion.div>

      <div className="sticky bottom-3 mt-8 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-3 py-1.5 w-fit">
          Step {currentStep + 1} / {wizardSteps.length}: {wizardSteps[currentStep]}
        </Badge>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSubmitting} className="w-full sm:w-auto h-11">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>

          {currentStep < wizardSteps.length - 1 ? (
            <Button type="button" onClick={handleNext} disabled={isSubmitting} className="w-full sm:w-auto h-11 bg-[#67BA2E] hover:bg-[#5aa827] text-white">
              Next
              <ArrowRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 bg-[#67BA2E] hover:bg-[#5aa827] text-white"
            >
              {isSubmitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSave}
      />
    </>
  )
}

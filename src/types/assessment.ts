import type { z } from "zod"
import type {
  AssessmentBmiVitalsSchema,
  AssessmentDataSchema,
  AssessmentDiagnosisSchema,
  AssessmentFormSchema,
  AssessmentMedicationSchema,
  AssessmentMemberInfoSchema,
  AssessmentResponsesSchema,
  AssessmentSignaturesSchema,
  AssessmentSummarySchema,
  CaregiverStatusSchema,
  CognitiveEmotionalSchema,
  EliminationSchema,
  FallRiskLevelSchema,
  FallRiskMobilitySchema,
  FunctionalStatusAdlsSchema,
  HomeEnvironmentSchema,
  MedicationManagementSchema,
  NutritionHydrationSchema,
  PainAssessmentSchema,
  ReassessmentSignOffSchema,
  RoutineHomeVisitReassessmentSchema,
  VisitInfoSchema,
  WoundSkinDeviceCareSchema,
} from "@/lib/validations/assessment"

export type FallRiskLevel = z.infer<typeof FallRiskLevelSchema>

export type AssessmentMemberInfo = z.infer<typeof AssessmentMemberInfoSchema>
export type AssessmentBmiVitals = z.infer<typeof AssessmentBmiVitalsSchema>
export type AssessmentMedication = z.infer<typeof AssessmentMedicationSchema>
export type AssessmentDiagnosis = z.infer<typeof AssessmentDiagnosisSchema>
export type AssessmentSummary = z.infer<typeof AssessmentSummarySchema>
export type AssessmentSignatures = z.infer<typeof AssessmentSignaturesSchema>
export type AssessmentResponses = z.infer<typeof AssessmentResponsesSchema>

export type VisitInfo = z.infer<typeof VisitInfoSchema>
export type MedicationManagement = z.infer<typeof MedicationManagementSchema>
export type PainAssessment = z.infer<typeof PainAssessmentSchema>
export type WoundSkinDeviceCare = z.infer<typeof WoundSkinDeviceCareSchema>
export type FunctionalStatusAdls = z.infer<typeof FunctionalStatusAdlsSchema>
export type FallRiskMobility = z.infer<typeof FallRiskMobilitySchema>
export type NutritionHydration = z.infer<typeof NutritionHydrationSchema>
export type Elimination = z.infer<typeof EliminationSchema>
export type CognitiveEmotional = z.infer<typeof CognitiveEmotionalSchema>
export type CaregiverStatus = z.infer<typeof CaregiverStatusSchema>
export type HomeEnvironment = z.infer<typeof HomeEnvironmentSchema>
export type ReassessmentSignOff = z.infer<typeof ReassessmentSignOffSchema>
export type RoutineHomeVisitReassessment = z.infer<typeof RoutineHomeVisitReassessmentSchema>

export type AssessmentData = z.infer<typeof AssessmentDataSchema>
export type AssessmentFormData = z.infer<typeof AssessmentFormSchema>

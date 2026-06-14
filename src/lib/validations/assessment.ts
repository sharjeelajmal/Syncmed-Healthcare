import { z } from "zod"
import { MEDICATION_DOSAGE_UNITS } from "@/lib/assessment-risk-score"

// --- Shared helpers ---

const optionalString = z.string().optional()
const optionalBoolean = z.boolean().optional()

export const FallRiskLevelSchema = z.enum(["low", "moderate", "high"])

// --- Existing assessment structure ---

export const AssessmentMemberInfoSchema = z.object({
  fullName: optionalString,
  memberId: optionalString,
  dateOfBirth: optionalString,
  gender: optionalString,
  stateOfResidence: optionalString,
  lga: optionalString,
  phoneNumber: optionalString,
  preferredLanguage: optionalString,
  assessorCaseManager: optionalString,
  assessmentDate: optionalString,
  facility: optionalString,
  nhiaNumber: optionalString,
})

export const AssessmentBmiVitalsSchema = z.object({
  weightKg: z.union([z.string(), z.number()]).optional(),
  heightInches: z.union([z.string(), z.number()]).optional(),
  heightCm: z.union([z.string(), z.number()]).optional(),
  calculatedBmi: z.union([z.string(), z.number()]).optional(),
  bmiCategory: optionalString,
  bloodPressure: optionalString,
  bloodGlucose: optionalString,
  temperatureCelsius: optionalString,
  respiration: optionalString,
  painScale: z.union([z.string(), z.number()]).optional(),
  oxygenSaturation: optionalString,
})

export const AssessmentMedicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  dosageAmount: optionalString,
  dosageUnit: z.enum(MEDICATION_DOSAGE_UNITS).optional(),
})

export const AssessmentDiagnosisSchema = z.object({
  name: z.string(),
})

export const AssessmentSummarySchema = z.object({
  q98OverallAssessmentSummary: optionalString,
  supervisorReview: optionalString,
  totalRiskScore: z.number().optional(),
  riskLevel: optionalString,
})

export const AssessmentSignaturesSchema = z.object({
  assessorSignature: optionalString,
})

export const AssessmentResponsesSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())])
)

// --- Routine Home Visit Reassessment (from SyncMed document) ---

export const VisitInfoSchema = z.object({
  clientName: optionalString,
  clientFolderId: optionalString,
  dateOfVisit: optionalString,
  timeIn: optionalString,
  timeOut: optionalString,
  addressCommunity: optionalString,
  lgaState: optionalString,
  primaryDiagnosis: optionalString,
  nhiaHmoNo: optionalString,
  visitNumber: optionalString,
  visitFrequency: optionalString,
  rnChewConductingVisit: optionalString,
  designationLicenseNo: optionalString,
  primaryCaregiverPresent: optionalBoolean,
  relationshipToClient: optionalString,
})

export const MedicationManagementSchema = z.object({
  takingMedicationsAsPrescribed: optionalBoolean,
  missedDosesSinceLastVisit: optionalBoolean,
  missedDosesCountAndReason: optionalString,
  medicationSupplyAdequate: optionalBoolean,
  sideEffectsOrAdverseReactions: optionalBoolean,
  sideEffectsDetails: optionalString,
  newMedicationsWithoutProviderInput: optionalBoolean,
  newMedicationsDetails: optionalString,
  storageConditionsAppropriate: optionalBoolean,
  storageConditionsNotes: optionalString,
  ableToStateDoseTimeAndPurpose: optionalBoolean,
})

export const PainAssessmentSchema = z.object({
  painPresentAtVisit: optionalBoolean,
  locationAndCharacter: optionalString,
  intensityScale0To10: optionalString,
  painManagementPlanEffective: optionalBoolean,
  newPainOrChangeInPattern: optionalBoolean,
  newPainDetails: optionalString,
})

export const WoundSkinDeviceCareSchema = z.object({
  woundsPresentLocationAndStatus: optionalString,
  signsOfInfection: optionalBoolean,
  signsOfInfectionDetails: optionalString,
  dressingChangedPerCarePlanAndSuppliesAdequate: optionalBoolean,
  pressureInjuryRiskAreasChecked: optionalBoolean,
  deviceSiteAssessment: optionalString,
})

export const FunctionalStatusAdlsSchema = z.object({
  changeInBathingDressingGrooming: optionalString,
  changeInToiletingAndContinence: optionalString,
  changeInTransferringAndAmbulation: optionalString,
  changeInEatingFeedingAbility: optionalString,
  fallsOrNearFallsSinceLastVisit: optionalBoolean,
  fallsCircumstancesAndOutcome: optionalString,
})

export const FallRiskMobilitySchema = z.object({
  currentFallRiskLevel: FallRiskLevelSchema.optional(),
  environmentalHazardsObserved: optionalBoolean,
  environmentalHazardsDetails: optionalString,
  footwearAppropriateAndGoodCondition: optionalBoolean,
  assistiveDevicesGoodConditionAndUsedCorrectly: optionalBoolean,
})

export const NutritionHydrationSchema = z.object({
  appetiteChangeSinceLastVisit: optionalString,
  adequateFoodAccessAndIntake: optionalBoolean,
  foodAccessNotes: optionalString,
  signsOfDehydration: optionalBoolean,
  dehydrationSignsDetails: optionalString,
  adherenceToSpecialDiet: optionalBoolean,
  specialDietNotes: optionalString,
  weightChangeSinceLastVisit: optionalString,
})

export const EliminationSchema = z.object({
  bowelPattern: optionalString,
  urinaryPattern: optionalString,
  catheterOstomyCare: optionalString,
})

export const CognitiveEmotionalSchema = z.object({
  orientationToPersonPlaceAndTime: optionalString,
  moodSigns: optionalString,
  behaviouralChangesSinceLastVisit: optionalString,
  sleepPattern: optionalString,
  safetyConcernsExpressed: optionalBoolean,
  safetyConcernsDetails: optionalString,
})

export const CaregiverStatusSchema = z.object({
  primaryCaregiverPresentAndAvailable: optionalBoolean,
  caregiverCopingAndStressLevel: optionalString,
  caregiverCompetencyWithCareTasks: optionalString,
  returnDemonstrationIfNewTaskTaught: optionalBoolean,
  respiteOrAdditionalSupportNeeded: optionalBoolean,
  respiteSupportDetails: optionalString,
  extendedSupportInvolvement: optionalString,
})

export const HomeEnvironmentSchema = z.object({
  generalLivingConditions: optionalString,
  lightingAdequateForSafeMovement: optionalBoolean,
  fireAndCarbonMonoxideHazards: optionalBoolean,
  fireHazardsDetails: optionalString,
  pestSanitationOrWasteConcerns: optionalBoolean,
  pestSanitationDetails: optionalString,
  householdSecurityConcerns: optionalBoolean,
  securityConcernsDetails: optionalString,
})

export const ReassessmentSignOffSchema = z.object({
  clinicianNameAndSignature: optionalString,
  signOffDate: optionalString,
})

export const RoutineHomeVisitReassessmentSchema = z.object({
  visitInfo: VisitInfoSchema.optional(),
  medicationManagement: MedicationManagementSchema.optional(),
  painAssessment: PainAssessmentSchema.optional(),
  woundSkinDeviceCare: WoundSkinDeviceCareSchema.optional(),
  functionalStatusAdls: FunctionalStatusAdlsSchema.optional(),
  fallRiskMobility: FallRiskMobilitySchema.optional(),
  nutritionHydration: NutritionHydrationSchema.optional(),
  elimination: EliminationSchema.optional(),
  cognitiveEmotional: CognitiveEmotionalSchema.optional(),
  caregiverStatus: CaregiverStatusSchema.optional(),
  homeEnvironment: HomeEnvironmentSchema.optional(),
  additionalNotes: optionalString,
  signOff: ReassessmentSignOffSchema.optional(),
})

// --- Root assessment data (stored as Prisma JSON) ---

export const AssessmentDataSchema = z.object({
  memberInfo: AssessmentMemberInfoSchema.optional(),
  isFirstTimeAssessment: z.boolean().optional(),
  responses: AssessmentResponsesSchema.optional(),
  bmiVitals: AssessmentBmiVitalsSchema.optional(),
  medications: z.array(AssessmentMedicationSchema).optional(),
  diagnoses: z.array(AssessmentDiagnosisSchema).optional(),
  soapNotes: optionalString,
  followUpDate: z.string().nullable().optional(),
  summary: AssessmentSummarySchema.optional(),
  signatures: AssessmentSignaturesSchema.optional(),
  routineHomeVisitReassessment: RoutineHomeVisitReassessmentSchema.optional(),
})

export const AssessmentFormSchema = AssessmentDataSchema

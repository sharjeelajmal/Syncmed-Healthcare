export type ReassessmentFieldType = "text" | "textarea" | "boolean" | "select" | "time" | "date"

export interface ReassessmentSelectOption {
  label: string
  value: string
}

export interface ReassessmentFieldDefinition {
  sectionKey: string
  fieldKey: string
  label: string
  type: ReassessmentFieldType
  placeholder?: string
  helperText?: string
  options?: ReassessmentSelectOption[]
  showWhen?: {
    sectionKey: string
    fieldKey: string
    equals: boolean | string
  }
}

export const ROUTINE_REASSESSMENT_WIZARD_STEPS = [
  "Visit Info",
  "Medication",
  "Pain",
  "Clinical Review",
  "Nutrition",
  "Bowel & Bladder",
  "Cognitive & Emotional",
  "Caregiver",
  "Home Environment",
] as const

export type RoutineReassessmentWizardStep = (typeof ROUTINE_REASSESSMENT_WIZARD_STEPS)[number]

export const reassessmentFieldsByStep: Record<
  RoutineReassessmentWizardStep,
  ReassessmentFieldDefinition[]
> = {
  "Visit Info": [
    { sectionKey: "visitInfo", fieldKey: "clientName", label: "Client Name", type: "text" },
    { sectionKey: "visitInfo", fieldKey: "clientFolderId", label: "Client / Folder ID", type: "text" },
    { sectionKey: "visitInfo", fieldKey: "dateOfVisit", label: "Date of Visit", type: "date" },
    { sectionKey: "visitInfo", fieldKey: "timeIn", label: "Time In", type: "time" },
    { sectionKey: "visitInfo", fieldKey: "timeOut", label: "Time Out", type: "time" },
    { sectionKey: "visitInfo", fieldKey: "addressCommunity", label: "Address / Community", type: "text" },
    { sectionKey: "visitInfo", fieldKey: "lgaState", label: "LGA / State", type: "text" },
    { sectionKey: "visitInfo", fieldKey: "primaryDiagnosis", label: "Primary Diagnosis", type: "text" },
    { sectionKey: "visitInfo", fieldKey: "nhiaHmoNo", label: "NHIA / HMO No.", type: "text" },
    { sectionKey: "visitInfo", fieldKey: "visitNumber", label: "Visit Number", type: "text" },
    {
      sectionKey: "visitInfo",
      fieldKey: "visitFrequency",
      label: "Visit Frequency",
      type: "text",
      placeholder: "e.g. 3x/wk",
    },
    {
      sectionKey: "visitInfo",
      fieldKey: "rnChewConductingVisit",
      label: "RN / CHEW Conducting Visit",
      type: "text",
    },
    {
      sectionKey: "visitInfo",
      fieldKey: "designationLicenseNo",
      label: "Designation / License No.",
      type: "text",
    },
    {
      sectionKey: "visitInfo",
      fieldKey: "primaryCaregiverPresent",
      label: "Primary Caregiver Present",
      type: "boolean",
    },
    {
      sectionKey: "visitInfo",
      fieldKey: "relationshipToClient",
      label: "Relationship to Client",
      type: "text",
      showWhen: { sectionKey: "visitInfo", fieldKey: "primaryCaregiverPresent", equals: true },
    },
  ],
  Medication: [
    {
      sectionKey: "medicationManagement",
      fieldKey: "takingMedicationsAsPrescribed",
      label: "Is the client taking medications as prescribed?",
      type: "boolean",
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "missedDosesSinceLastVisit",
      label: "Any missed doses since last visit?",
      type: "boolean",
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "missedDosesCountAndReason",
      label: "Number of doses and reason",
      type: "textarea",
      showWhen: { sectionKey: "medicationManagement", fieldKey: "missedDosesSinceLastVisit", equals: true },
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "medicationSupplyAdequate",
      label: "Medication supply adequate until next visit?",
      type: "boolean",
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "sideEffectsOrAdverseReactions",
      label: "Any side effects or adverse reactions noted?",
      type: "boolean",
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "sideEffectsDetails",
      label: "Side effects / adverse reaction details",
      type: "textarea",
      showWhen: { sectionKey: "medicationManagement", fieldKey: "sideEffectsOrAdverseReactions", equals: true },
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "newMedicationsWithoutProviderInput",
      label: "Any new medications, herbal/traditional remedies, or chemist-bought drugs started without provider input?",
      type: "boolean",
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "newMedicationsDetails",
      label: "New medication details",
      type: "textarea",
      showWhen: { sectionKey: "medicationManagement", fieldKey: "newMedicationsWithoutProviderInput", equals: true },
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "storageConditionsAppropriate",
      label: "Storage conditions appropriate (heat, humidity, sunlight; refrigeration for cold-chain drugs)?",
      type: "boolean",
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "storageConditionsNotes",
      label: "Storage conditions notes",
      type: "textarea",
      showWhen: { sectionKey: "medicationManagement", fieldKey: "storageConditionsAppropriate", equals: false },
    },
    {
      sectionKey: "medicationManagement",
      fieldKey: "ableToStateDoseTimeAndPurpose",
      label: "Caregiver/client able to correctly state dose, time, and purpose of each medication?",
      type: "boolean",
    },
  ],
  Pain: [
    {
      sectionKey: "painAssessment",
      fieldKey: "painPresentAtVisit",
      label: "Pain present at this visit?",
      type: "boolean",
    },
    {
      sectionKey: "painAssessment",
      fieldKey: "locationAndCharacter",
      label: "Location and character",
      type: "textarea",
      showWhen: { sectionKey: "painAssessment", fieldKey: "painPresentAtVisit", equals: true },
    },
    {
      sectionKey: "painAssessment",
      fieldKey: "intensityScale0To10",
      label: "Pain intensity (0–10 scale)",
      type: "select",
      options: Array.from({ length: 11 }, (_, value) => ({
        label: `${value} / 10`,
        value: String(value),
      })),
      showWhen: { sectionKey: "painAssessment", fieldKey: "painPresentAtVisit", equals: true },
    },
    {
      sectionKey: "painAssessment",
      fieldKey: "painManagementPlanEffective",
      label: "Is current pain management plan effective?",
      type: "boolean",
      showWhen: { sectionKey: "painAssessment", fieldKey: "painPresentAtVisit", equals: true },
    },
    {
      sectionKey: "painAssessment",
      fieldKey: "newPainOrChangeInPattern",
      label: "Any new pain or change in pattern since last visit?",
      type: "boolean",
    },
    {
      sectionKey: "painAssessment",
      fieldKey: "newPainDetails",
      label: "New pain / pattern change details",
      type: "textarea",
      showWhen: { sectionKey: "painAssessment", fieldKey: "newPainOrChangeInPattern", equals: true },
    },
  ],
  "Clinical Review": [
    {
      sectionKey: "woundSkinDeviceCare",
      fieldKey: "woundsPresentLocationAndStatus",
      label: "Wound(s) present — location and healing status (improving / unchanged / worsening)",
      type: "textarea",
    },
    {
      sectionKey: "woundSkinDeviceCare",
      fieldKey: "signsOfInfection",
      label: "Signs of infection — redness, warmth, odour, drainage",
      type: "boolean",
    },
    {
      sectionKey: "woundSkinDeviceCare",
      fieldKey: "signsOfInfectionDetails",
      label: "Infection details",
      type: "textarea",
      showWhen: { sectionKey: "woundSkinDeviceCare", fieldKey: "signsOfInfection", equals: true },
    },
    {
      sectionKey: "woundSkinDeviceCare",
      fieldKey: "dressingChangedPerCarePlanAndSuppliesAdequate",
      label: "Dressing changed per care plan and supplies adequate",
      type: "boolean",
    },
    {
      sectionKey: "woundSkinDeviceCare",
      fieldKey: "pressureInjuryRiskAreasChecked",
      label: "Pressure injury risk areas checked (sacrum, heels, elbows)",
      type: "boolean",
    },
    {
      sectionKey: "woundSkinDeviceCare",
      fieldKey: "deviceSiteAssessment",
      label: "Catheter, feeding tube, ostomy, or other device site assessment",
      type: "textarea",
    },
    {
      sectionKey: "functionalStatusAdls",
      fieldKey: "changeInBathingDressingGrooming",
      label: "Change in ability to bathe, dress, groom since last visit",
      type: "textarea",
    },
    {
      sectionKey: "functionalStatusAdls",
      fieldKey: "changeInToiletingAndContinence",
      label: "Change in toileting and continence",
      type: "textarea",
    },
    {
      sectionKey: "functionalStatusAdls",
      fieldKey: "changeInTransferringAndAmbulation",
      label: "Change in transferring (bed/chair) and ambulation",
      type: "textarea",
    },
    {
      sectionKey: "functionalStatusAdls",
      fieldKey: "changeInEatingFeedingAbility",
      label: "Change in eating/feeding ability",
      type: "textarea",
    },
    {
      sectionKey: "functionalStatusAdls",
      fieldKey: "fallsOrNearFallsSinceLastVisit",
      label: "Any falls or near-falls since last visit?",
      type: "boolean",
    },
    {
      sectionKey: "functionalStatusAdls",
      fieldKey: "fallsCircumstancesAndOutcome",
      label: "Circumstances and outcome",
      type: "textarea",
      showWhen: { sectionKey: "functionalStatusAdls", fieldKey: "fallsOrNearFallsSinceLastVisit", equals: true },
    },
    {
      sectionKey: "fallRiskMobility",
      fieldKey: "currentFallRiskLevel",
      label: "Current fall risk level",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Moderate", value: "moderate" },
        { label: "High", value: "high" },
      ],
    },
    {
      sectionKey: "fallRiskMobility",
      fieldKey: "environmentalHazardsObserved",
      label: "Environmental hazards observed (loose mats, poor lighting, wet surfaces, etc.)",
      type: "boolean",
    },
    {
      sectionKey: "fallRiskMobility",
      fieldKey: "environmentalHazardsDetails",
      label: "Environmental hazard details",
      type: "textarea",
      showWhen: { sectionKey: "fallRiskMobility", fieldKey: "environmentalHazardsObserved", equals: true },
    },
    {
      sectionKey: "fallRiskMobility",
      fieldKey: "footwearAppropriateAndGoodCondition",
      label: "Footwear appropriate and in good condition",
      type: "boolean",
    },
    {
      sectionKey: "fallRiskMobility",
      fieldKey: "assistiveDevicesGoodConditionAndUsedCorrectly",
      label: "Assistive devices (cane, walker, wheelchair) in good condition and used correctly",
      type: "boolean",
    },
  ],
  Nutrition: [
    {
      sectionKey: "nutritionHydration",
      fieldKey: "appetiteChangeSinceLastVisit",
      label: "Appetite — any change since last visit",
      type: "textarea",
    },
    {
      sectionKey: "nutritionHydration",
      fieldKey: "adequateFoodAccessAndIntake",
      label: "Adequate food access and intake",
      type: "boolean",
    },
    {
      sectionKey: "nutritionHydration",
      fieldKey: "foodAccessNotes",
      label: "Food access notes (household food security, ability to prepare meals)",
      type: "textarea",
    },
    {
      sectionKey: "nutritionHydration",
      fieldKey: "signsOfDehydration",
      label: "Signs of dehydration (dry mucous membranes, reduced urine output, dizziness)",
      type: "boolean",
    },
    {
      sectionKey: "nutritionHydration",
      fieldKey: "dehydrationSignsDetails",
      label: "Dehydration details",
      type: "textarea",
      showWhen: { sectionKey: "nutritionHydration", fieldKey: "signsOfDehydration", equals: true },
    },
    {
      sectionKey: "nutritionHydration",
      fieldKey: "adherenceToSpecialDiet",
      label: "Adherence to special diet (diabetic, low-salt, renal, etc.)",
      type: "boolean",
    },
    {
      sectionKey: "nutritionHydration",
      fieldKey: "specialDietNotes",
      label: "Special diet notes",
      type: "textarea",
    },
    {
      sectionKey: "nutritionHydration",
      fieldKey: "weightChangeSinceLastVisit",
      label: "Weight change since last visit",
      type: "text",
    },
  ],
  "Bowel & Bladder": [
    {
      sectionKey: "elimination",
      fieldKey: "bowelPattern",
      label: "Bowel pattern — frequency, consistency; any constipation or diarrhoea",
      type: "textarea",
    },
    {
      sectionKey: "elimination",
      fieldKey: "urinaryPattern",
      label: "Urinary pattern — frequency, incontinence, retention, burning",
      type: "textarea",
    },
    {
      sectionKey: "elimination",
      fieldKey: "catheterOstomyCare",
      label: "Catheter/ostomy care (if applicable) — site condition, output, supplies",
      type: "textarea",
    },
  ],
  "Cognitive & Emotional": [
    {
      sectionKey: "cognitiveEmotional",
      fieldKey: "orientationToPersonPlaceAndTime",
      label: "Orientation to person, place, and time",
      type: "textarea",
    },
    {
      sectionKey: "cognitiveEmotional",
      fieldKey: "moodSigns",
      label: "Mood — any signs of low mood, anxiety, withdrawal, or irritability",
      type: "textarea",
    },
    {
      sectionKey: "cognitiveEmotional",
      fieldKey: "behaviouralChangesSinceLastVisit",
      label: "Behavioural changes since last visit",
      type: "textarea",
    },
    {
      sectionKey: "cognitiveEmotional",
      fieldKey: "sleepPattern",
      label: "Sleep pattern — quality and any disturbances",
      type: "textarea",
    },
    {
      sectionKey: "cognitiveEmotional",
      fieldKey: "safetyConcernsExpressed",
      label: "Any expressions of hopelessness, self-harm, or safety concerns?",
      type: "boolean",
      helperText: "Escalate immediately per protocol if present.",
    },
    {
      sectionKey: "cognitiveEmotional",
      fieldKey: "safetyConcernsDetails",
      label: "Safety concern details",
      type: "textarea",
      showWhen: { sectionKey: "cognitiveEmotional", fieldKey: "safetyConcernsExpressed", equals: true },
    },
  ],
  Caregiver: [
    {
      sectionKey: "caregiverStatus",
      fieldKey: "primaryCaregiverPresentAndAvailable",
      label: "Primary caregiver present and available for this visit",
      type: "boolean",
    },
    {
      sectionKey: "caregiverStatus",
      fieldKey: "caregiverCopingAndStressLevel",
      label: "Caregiver coping and stress level",
      type: "textarea",
    },
    {
      sectionKey: "caregiverStatus",
      fieldKey: "caregiverCompetencyWithCareTasks",
      label: "Caregiver competency with required care tasks",
      type: "textarea",
    },
    {
      sectionKey: "caregiverStatus",
      fieldKey: "returnDemonstrationIfNewTaskTaught",
      label: "Return demonstration if new task taught",
      type: "boolean",
    },
    {
      sectionKey: "caregiverStatus",
      fieldKey: "respiteOrAdditionalSupportNeeded",
      label: "Respite or additional support needed",
      type: "boolean",
    },
    {
      sectionKey: "caregiverStatus",
      fieldKey: "respiteSupportDetails",
      label: "Respite / support details",
      type: "textarea",
      showWhen: { sectionKey: "caregiverStatus", fieldKey: "respiteOrAdditionalSupportNeeded", equals: true },
    },
    {
      sectionKey: "caregiverStatus",
      fieldKey: "extendedSupportInvolvement",
      label: "Extended family, neighbour, faith community, or CHW involvement",
      type: "textarea",
    },
  ],
  "Home Environment": [
    {
      sectionKey: "homeEnvironment",
      fieldKey: "generalLivingConditions",
      label: "General living conditions — cleanliness, ventilation, overcrowding",
      type: "textarea",
    },
    {
      sectionKey: "homeEnvironment",
      fieldKey: "lightingAdequateForSafeMovement",
      label: "Lighting adequate for safe movement, especially at night",
      type: "boolean",
    },
    {
      sectionKey: "homeEnvironment",
      fieldKey: "fireAndCarbonMonoxideHazards",
      label: "Fire and carbon monoxide hazards (kerosene stoves, generator exhaust, gas cylinders)",
      type: "boolean",
    },
    {
      sectionKey: "homeEnvironment",
      fieldKey: "fireHazardsDetails",
      label: "Fire / CO hazard details",
      type: "textarea",
      showWhen: { sectionKey: "homeEnvironment", fieldKey: "fireAndCarbonMonoxideHazards", equals: true },
    },
    {
      sectionKey: "homeEnvironment",
      fieldKey: "pestSanitationOrWasteConcerns",
      label: "Pest, sanitation, or waste disposal concerns",
      type: "boolean",
    },
    {
      sectionKey: "homeEnvironment",
      fieldKey: "pestSanitationDetails",
      label: "Pest / sanitation details",
      type: "textarea",
      showWhen: { sectionKey: "homeEnvironment", fieldKey: "pestSanitationOrWasteConcerns", equals: true },
    },
    {
      sectionKey: "homeEnvironment",
      fieldKey: "householdSecurityConcerns",
      label: "Household security concerns affecting visit safety or client wellbeing",
      type: "boolean",
    },
    {
      sectionKey: "homeEnvironment",
      fieldKey: "securityConcernsDetails",
      label: "Security concern details",
      type: "textarea",
      showWhen: { sectionKey: "homeEnvironment", fieldKey: "householdSecurityConcerns", equals: true },
    },
  ],
}

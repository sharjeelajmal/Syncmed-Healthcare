export type QuestionType = "text" | "textarea" | "single" | "multi" | "date"

export interface OptionDefinition {
  label: string
  value: string
  score?: number
}

export interface QuestionDefinition {
  id: string
  prompt: string
  type: QuestionType
  required?: boolean
  caseManagerOnly?: boolean
  options?: OptionDefinition[]
  placeholder?: string
}

export interface SectionDefinition {
  title: string
  description?: string
  questions: QuestionDefinition[]
}

interface MemberInfoField {
  key: string
  label: string
  required?: boolean
  type?: "date" | "text"
}

export const WIZARD_STEPS = [
  "Member Info",
  "Factors 1-4",
  "Factors 5-8",
  "Factors 9-11",
  "BMI & Vitals",
  "Summary & Sign",
] as const

export const FOLLOW_UP_WIZARD_STEPS = [
  "Member Info",
  "BMI & Vitals",
  "Summary & Sign",
] as const

export function getWizardSteps(isFirstTimeAssessment: boolean) {
  return isFirstTimeAssessment ? WIZARD_STEPS : FOLLOW_UP_WIZARD_STEPS
}

interface MemberInfoField {
  key: string
  label: string
  required?: boolean
  type?: "date" | "text"
}

export const memberInfoFields: MemberInfoField[] = [
  { key: "fullName", label: "Full Name", required: true },
  { key: "memberId", label: "Member ID / Policy No.", required: true },
  { key: "dateOfBirth", label: "Date of Birth", required: true, type: "date" as const },
  { key: "gender", label: "Gender", required: true },
  { key: "stateOfResidence", label: "State of Residence", required: true },
  { key: "lga", label: "Local Government Area (LGA)", required: true },
  { key: "phoneNumber", label: "Phone Number", required: true },
  { key: "preferredLanguage", label: "Preferred Language", required: true },
  { key: "assessorCaseManager", label: "Assessor / Case Manager", required: true },
  { key: "assessmentDate", label: "Assessment Date", required: true, type: "date" as const },
  { key: "facility", label: "Health Facility / HMO", required: true },
  { key: "nhiaNumber", label: "NHIA/HMO Number", required: true },
]

export const step2Sections: SectionDefinition[] = [
  {
    title: "Factor 1 & 2: Identification & Care Management",
    questions: [
      { id: "q1", prompt: "Q1 Information on the event or diagnosis that led to identification for Care Management", type: "textarea", required: true },
      {
        id: "q2",
        prompt: "Q2 How would you rate your overall health?",
        type: "single",
        required: true,
        options: [
          { label: "Excellent", value: "excellent", score: 1 },
          { label: "Very Good", value: "very_good", score: 2 },
          { label: "Good", value: "good", score: 3 },
          { label: "Fair", value: "fair", score: 4 },
          { label: "Poor", value: "poor", score: 5 },
        ],
      },
      { id: "q3", prompt: "Q3 What is your main health concern?", type: "textarea", required: true },
      {
        id: "q4",
        prompt: "Q4 Have you ever been told by a healthcare provider that you had or have any of these conditions? (Check all that apply)",
        type: "multi",
        required: true,
        options: [
          { label: "Hypertension (High Blood Pressure)", value: "hypertension" },
          { label: "Diabetes (Type 1 or Type 2)", value: "diabetes" },
          { label: "Sickle Cell Disease / Trait", value: "sickle_cell" },
          { label: "Malaria (Recurrent / Chronic)", value: "malaria_recurrent" },
          { label: "Tuberculosis (TB)", value: "tb" },
          { label: "HIV/AIDS", value: "hiv" },
          { label: "Hepatitis B or C", value: "hepatitis" },
          { label: "Heart Disease / Coronary Artery Disease", value: "heart_disease" },
          { label: "Stroke / TIA (Mini-Stroke)", value: "stroke" },
          { label: "Asthma / COPD / Respiratory Disease", value: "respiratory" },
          { label: "Kidney Disease (CKD / Renal Failure)", value: "kidney" },
          { label: "Cancer (specify in comments)", value: "cancer" },
          { label: "Epilepsy / Seizure Disorder", value: "epilepsy" },
          { label: "Mental Health Disorder", value: "mental_health" },
          { label: "Typhoid Fever (Recurrent)", value: "typhoid" },
          { label: "Other (specify below)", value: "other" },
        ],
      },
      { id: "q5", prompt: "Q5 If you answered 'Other', what condition were you told that you had?", type: "text" },
      { id: "q6", prompt: "Q6 [Case Manager] Summarize the condition(s) being treated now, diagnosis date, and treatment provided. Also document if 'none'.", type: "textarea", caseManagerOnly: true, required: true },
      { id: "q7", prompt: "Q7 [Case Manager] Summarize past condition(s), diagnosis/resolution timeline, and medications/treatment. Also document if 'none'.", type: "textarea", caseManagerOnly: true },
      {
        id: "q8",
        prompt: "Q8 How many times have you used urgent care in the past 30 days?",
        type: "single",
        required: true,
        options: [
          { label: "0 times", value: "0", score: 0 },
          { label: "1 time", value: "1", score: 2 },
          { label: "2 times", value: "2", score: 3 },
          { label: "3 times", value: "3", score: 4 },
          { label: "4 or more times", value: "4_plus", score: 5 },
        ],
      },
      {
        id: "q9",
        prompt: "Q9 How many times have you been admitted to the hospital in the past 30 days?",
        type: "single",
        required: true,
        options: [
          { label: "0 times", value: "0", score: 0 },
          { label: "1 time", value: "1", score: 3 },
          { label: "2 times", value: "2", score: 4 },
          { label: "3 or more times", value: "3_plus", score: 5 },
        ],
      },
      { id: "q10", prompt: "Q10 [Case Manager] Factors 1 & 2 conclusion (health status, barriers, and gaps).", type: "textarea", caseManagerOnly: true },
      { id: "q11", prompt: "Q11 [Case Manager] Date of conclusion (Factors 1 & 2).", type: "date", caseManagerOnly: true },
    ],
  },
  {
    title: "Factor 3: ADL / IADL Functional Status",
    questions: [
      {
        id: "q12",
        prompt: "Q12 Do you need help with bathing?",
        type: "single",
        required: true,
        options: [
          { label: "No assistance needed", value: "none", score: 0 },
          { label: "Some assistance needed", value: "some", score: 2 },
          { label: "Full assistance needed", value: "full", score: 4 },
        ],
      },
      {
        id: "q13",
        prompt: "Q13 Do you need help with dressing?",
        type: "single",
        required: true,
        options: [
          { label: "No assistance needed", value: "none", score: 0 },
          { label: "Some assistance needed", value: "some", score: 2 },
          { label: "Full assistance needed", value: "full", score: 4 },
        ],
      },
      {
        id: "q14",
        prompt: "Q14 Do you need help with eating?",
        type: "single",
        required: true,
        options: [
          { label: "No assistance needed", value: "none", score: 0 },
          { label: "Some assistance needed", value: "some", score: 2 },
          { label: "Full assistance needed", value: "full", score: 4 },
        ],
      },
      {
        id: "q15",
        prompt: "Q15 Do you need help with transferring?",
        type: "single",
        required: true,
        options: [
          { label: "No assistance needed", value: "none", score: 0 },
          { label: "Some assistance needed", value: "some", score: 2 },
          { label: "Full assistance needed", value: "full", score: 4 },
        ],
      },
      {
        id: "q16",
        prompt: "Q16 Do you need help with using the toilet?",
        type: "single",
        required: true,
        options: [
          { label: "No assistance needed", value: "none", score: 0 },
          { label: "Some assistance needed", value: "some", score: 2 },
          { label: "Full assistance needed", value: "full", score: 4 },
        ],
      },
      {
        id: "q17",
        prompt: "Q17 Do you need help with any of these daily activities?",
        type: "multi",
        options: [
          { label: "Meal preparation / cooking", value: "meal_prep" },
          { label: "Managing medications", value: "medications" },
          { label: "Managing finances / bills", value: "finances" },
          { label: "Shopping for food or household items", value: "shopping" },
          { label: "Using a mobile phone or internet", value: "mobile_internet" },
          { label: "Housework / cleaning", value: "housework" },
          { label: "Transportation to appointments", value: "transportation" },
          { label: "None of the above", value: "none" },
        ],
      },
      {
        id: "q18",
        prompt: "Q18 Do you currently need assistance with ADL/IADLs?",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Yes - informal (family/friends)", value: "informal", score: 1 },
          { label: "Yes - formal (paid caregiver)", value: "formal", score: 2 },
          { label: "Yes - both informal and formal", value: "both", score: 3 },
        ],
      },
      {
        id: "q19",
        prompt: "Q19 Are you currently using any of these assistive devices?",
        type: "multi",
        options: [
          { label: "Walking stick / cane", value: "cane" },
          { label: "Walker / Zimmer frame", value: "walker" },
          { label: "Wheelchair", value: "wheelchair" },
          { label: "Hospital bed", value: "hospital_bed" },
          { label: "Grab rails / bathroom aids", value: "grab_rails" },
          { label: "Hearing aid", value: "hearing_aid" },
          { label: "Spectacles / corrective lenses", value: "spectacles" },
          { label: "Oxygen concentrator", value: "oxygen" },
          { label: "None", value: "none" },
        ],
      },
      {
        id: "q20",
        prompt: "Q20 Are there any medical supplies you need assistance obtaining?",
        type: "single",
        options: [
          { label: "No", value: "no" },
          { label: "Yes - please specify below", value: "yes" },
        ],
      },
      { id: "q20_detail", prompt: "Q20 Additional details", type: "text" },
      {
        id: "q21",
        prompt: "Q21 Do you have pain?",
        type: "single",
        required: true,
        options: [
          { label: "No pain (0)", value: "none", score: 0 },
          { label: "Mild pain (1-3/10)", value: "mild", score: 1 },
          { label: "Moderate pain (4-6/10)", value: "moderate", score: 2 },
          { label: "Severe pain (7-10/10)", value: "severe", score: 4 },
        ],
      },
      { id: "q22", prompt: "Q22 [Case Manager] ADL/IADL Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q23", prompt: "Q23 [Case Manager] Date of conclusion (Factor 3)", type: "date", caseManagerOnly: true },
    ],
  },
  {
    title: "Factor 4: Behavioral Health Status & Cognitive Function",
    description: "PHQ-2 Screening",
    questions: [
      {
        id: "q24",
        prompt: "Q24 Little interest or pleasure in doing things?",
        type: "single",
        required: true,
        options: [
          { label: "Not at all", value: "not_at_all", score: 0 },
          { label: "Several days", value: "several_days", score: 1 },
          { label: "More than half the days", value: "more_than_half", score: 2 },
          { label: "Nearly every day", value: "nearly_every_day", score: 3 },
        ],
      },
      {
        id: "q25",
        prompt: "Q25 Feeling down, depressed, or hopeless?",
        type: "single",
        required: true,
        options: [
          { label: "Not at all", value: "not_at_all", score: 0 },
          { label: "Several days", value: "several_days", score: 1 },
          { label: "More than half the days", value: "more_than_half", score: 2 },
          { label: "Nearly every day", value: "nearly_every_day", score: 3 },
        ],
      },
      {
        id: "q26",
        prompt: "Q26 Are you currently seeing a behavioral healthcare provider?",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Yes - government/public facility", value: "public", score: 1 },
          { label: "Yes - private facility", value: "private", score: 1 },
          { label: "Yes - faith-based counselling", value: "faith", score: 1 },
        ],
      },
      {
        id: "q27",
        prompt: "Q27 Stress level in everyday life",
        type: "single",
        required: true,
        options: [
          { label: "No stress", value: "none", score: 0 },
          { label: "Low stress", value: "low", score: 1 },
          { label: "Moderate stress", value: "moderate", score: 2 },
          { label: "High stress", value: "high", score: 3 },
          { label: "Overwhelming stress", value: "overwhelming", score: 4 },
        ],
      },
      {
        id: "q28",
        prompt: "Q28 Memory or recall problems",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Occasionally", value: "occasionally", score: 1 },
          { label: "Frequently", value: "frequently", score: 2 },
          { label: "Always", value: "always", score: 3 },
        ],
      },
      {
        id: "q29",
        prompt: "Q29 Confusion while finishing tasks or orientation",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Occasionally", value: "occasionally", score: 1 },
          { label: "Frequently", value: "frequently", score: 2 },
        ],
      },
      {
        id: "q30",
        prompt: "Q30 [Case Manager] Ability to understand basic health information",
        type: "single",
        caseManagerOnly: true,
        options: [
          { label: "Yes - fully capable", value: "fully_capable", score: 0 },
          { label: "Partially - needs support", value: "needs_support", score: 2 },
          { label: "No - requires surrogate decision maker", value: "surrogate", score: 4 },
        ],
      },
      {
        id: "q31",
        prompt: "Q31 [Case Manager] Member cognitive functioning category",
        type: "single",
        caseManagerOnly: true,
        options: [
          { label: "Intact - no impairment", value: "intact", score: 0 },
          { label: "Mild impairment", value: "mild", score: 1 },
          { label: "Moderate impairment", value: "moderate", score: 2 },
          { label: "Severe impairment", value: "severe", score: 4 },
        ],
      },
      {
        id: "q32",
        prompt: "Q32 Recreational drug use or misuse",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Occasionally", value: "occasionally", score: 2 },
          { label: "Regularly", value: "regularly", score: 4 },
        ],
      },
      {
        id: "q33",
        prompt: "Q33 FOR MEN: frequency of heavy alcohol use in past month",
        type: "single",
        options: [
          { label: "Never", value: "never", score: 0 },
          { label: "1-2 times", value: "1_2", score: 1 },
          { label: "3-5 times", value: "3_5", score: 2 },
          { label: "More than 5 times", value: "5_plus", score: 3 },
        ],
      },
      {
        id: "q34",
        prompt: "Q34 FOR WOMEN: frequency of heavy alcohol use in past month",
        type: "single",
        options: [
          { label: "Never", value: "never", score: 0 },
          { label: "1-2 times", value: "1_2", score: 1 },
          { label: "3-5 times", value: "3_5", score: 2 },
          { label: "More than 5 times", value: "5_plus", score: 3 },
        ],
      },
      { id: "q35", prompt: "Q35 [Case Manager] Behavioral Health Status Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q36", prompt: "Q36 [Case Manager] Cognitive Functions Status Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q37", prompt: "Q37 [Case Manager] Date of conclusion (Factor 4)", type: "date", caseManagerOnly: true },
    ],
  },
]

export const step3Sections: SectionDefinition[] = [
  {
    title: "Factor 5: Tobacco, Lifestyle & Social Determinants of Health",
    questions: [
      {
        id: "q38",
        prompt: "Q38 Do you currently use tobacco or e-cigarettes with nicotine products?",
        type: "multi",
        required: true,
        options: [
          { label: "No - never used", value: "never" },
          { label: "Cigarettes", value: "cigarettes" },
          { label: "Snuff / Oral tobacco", value: "snuff" },
          { label: "Shisha / Hookah", value: "shisha" },
          { label: "E-cigarettes / Vaping", value: "vaping" },
          { label: "Chewing tobacco", value: "chewing" },
        ],
      },
      {
        id: "q39",
        prompt: "Q39 Did you ever use tobacco products?",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Yes - quit less than 1 year ago", value: "quit_lt_1y", score: 1 },
          { label: "Yes - quit 1-5 years ago", value: "quit_1_5y", score: 1 },
          { label: "Yes - quit more than 5 years ago", value: "quit_gt_5y", score: 0 },
          { label: "Currently using", value: "current", score: 2 },
        ],
      },
      {
        id: "q40",
        prompt: "Q40 Current working status",
        type: "single",
        required: true,
        options: [
          { label: "Employed (formal sector)", value: "employed", score: 0 },
          { label: "Self-employed / Trader / Artisan", value: "self_employed", score: 0 },
          { label: "Subsistence farmer", value: "farmer", score: 0 },
          { label: "Unemployed - seeking work", value: "unemployed_seeking", score: 2 },
          { label: "Unemployed - not seeking work", value: "unemployed_not_seeking", score: 2 },
          { label: "Retired", value: "retired", score: 0 },
          { label: "Unable to work due to disability/illness", value: "unable_to_work", score: 3 },
          { label: "Student", value: "student", score: 0 },
        ],
      },
      {
        id: "q41",
        prompt: "Q41 Sources of income (check all that apply)",
        type: "multi",
        required: true,
        options: [
          { label: "Salary / wages", value: "salary" },
          { label: "Business / trade income", value: "business" },
          { label: "Farming / agricultural income", value: "farming" },
          { label: "Pension / retirement benefit", value: "pension" },
          { label: "Family remittances", value: "remittances" },
          { label: "Government social grant / welfare", value: "welfare" },
          { label: "No regular income", value: "none" },
          { label: "Other", value: "other" },
        ],
      },
      {
        id: "q42",
        prompt: "Q42 Healthy nutrition familiarity and practice",
        type: "single",
        required: true,
        options: [
          { label: "Yes - practicing consistently", value: "consistent", score: 0 },
          { label: "Somewhat - partially practicing", value: "partial", score: 1 },
          { label: "No - not familiar", value: "not_familiar", score: 2 },
          { label: "No - aware but not practicing", value: "aware_not_practicing", score: 2 },
        ],
      },
      {
        id: "q43",
        prompt: "Q43 Household food insufficiency in the past month",
        type: "single",
        required: true,
        options: [
          { label: "Never", value: "never", score: 0 },
          { label: "Rarely (1-2 times)", value: "rarely", score: 1 },
          { label: "Sometimes (weekly)", value: "sometimes", score: 3 },
          { label: "Often (most days)", value: "often", score: 4 },
        ],
      },
      {
        id: "q44",
        prompt: "Q44 Primary source of drinking water",
        type: "single",
        required: true,
        options: [
          { label: "Treated pipe-borne water", value: "treated_pipe", score: 0 },
          { label: "Borehole / well (treated)", value: "well_treated", score: 1 },
          { label: "Borehole / well (untreated)", value: "well_untreated", score: 2 },
          { label: "Sachet / bottled water", value: "sachet_bottled", score: 0 },
          { label: "River / stream / pond", value: "river_stream", score: 4 },
          { label: "Rainwater collection", value: "rainwater", score: 2 },
        ],
      },
      {
        id: "q45",
        prompt: "Q45 Primary household toilet/sanitation facility",
        type: "single",
        required: true,
        options: [
          { label: "Flush toilet (private indoor)", value: "flush_private", score: 0 },
          { label: "Improved pit latrine (covered)", value: "pit_improved", score: 1 },
          { label: "Shared flush toilet", value: "flush_shared", score: 1 },
          { label: "Unimproved pit latrine", value: "pit_unimproved", score: 3 },
          { label: "Open defecation", value: "open_defecation", score: 5 },
        ],
      },
      {
        id: "q46",
        prompt: "Q46 How often do you visit a dentist?",
        type: "single",
        required: true,
        options: [
          { label: "At least once a year", value: "yearly", score: 0 },
          { label: "Every 2 years", value: "two_years", score: 1 },
          { label: "Rarely - only when in pain", value: "rarely", score: 2 },
          { label: "Never", value: "never", score: 3 },
        ],
      },
      { id: "q47", prompt: "Q47 [Case Manager] Social Determinants Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q48", prompt: "Q48 [Case Manager] Date of conclusion (Factor 5)", type: "date", caseManagerOnly: true },
    ],
  },
  {
    title: "Factor 6: Cultural & Linguistic Needs",
    questions: [
      {
        id: "q49",
        prompt: "Q49 Preferred language",
        type: "single",
        required: true,
        options: [
          { label: "English", value: "english" },
          { label: "Yoruba", value: "yoruba" },
          { label: "Igbo", value: "igbo" },
          { label: "Hausa", value: "hausa" },
          { label: "Pidgin English", value: "pidgin" },
          { label: "Fulfulde", value: "fulfulde" },
          { label: "Ibibio / Efik", value: "ibibio_efik" },
          { label: "Tiv", value: "tiv" },
          { label: "Ijaw", value: "ijaw" },
          { label: "Other (specify)", value: "other" },
        ],
      },
      { id: "q50", prompt: "Q50 If 'Other', specify preferred language", type: "text" },
      {
        id: "q51",
        prompt: "Q51 Cultural/religious beliefs that impact care",
        type: "single",
        options: [
          { label: "No", value: "no" },
          { label: "Yes - please specify below", value: "yes" },
        ],
      },
      { id: "q51_detail", prompt: "Q51 Additional details", type: "textarea" },
      {
        id: "q52",
        prompt: "Q52 Are healthcare providers aware of these preferences?",
        type: "single",
        options: [
          { label: "N/A", value: "na", score: 0 },
          { label: "Yes", value: "yes", score: 0 },
          { label: "No", value: "no", score: 2 },
          { label: "Partially", value: "partially", score: 1 },
        ],
      },
      {
        id: "q53",
        prompt: "Q53 Use of traditional/herbal medicine with conventional treatment",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Occasionally", value: "occasionally", score: 1 },
          { label: "Regularly - and my doctor knows", value: "regular_doctor_knows", score: 1 },
          { label: "Regularly - my doctor does not know", value: "regular_doctor_unknown", score: 3 },
        ],
      },
      { id: "q54", prompt: "Q54 [Case Manager] Cultural Needs Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q55", prompt: "Q55 [Case Manager] Linguistic Needs Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q56", prompt: "Q56 [Case Manager] Date of conclusion (Factor 6)", type: "date", caseManagerOnly: true },
    ],
  },
  {
    title: "Factor 7: Vision & Hearing Needs",
    questions: [
      {
        id: "q57",
        prompt: "Q57 Problems with vision",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Mild difficulty", value: "mild", score: 1 },
          { label: "Moderate difficulty", value: "moderate", score: 2 },
          { label: "Severe difficulty", value: "severe", score: 3 },
        ],
      },
      {
        id: "q58",
        prompt: "Q58 Do you wear glasses or contact lenses?",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Yes - and using them", value: "yes_using", score: 0 },
          { label: "Yes - but not currently using/lost/broken", value: "yes_not_using", score: 2 },
        ],
      },
      {
        id: "q59",
        prompt: "Q59 Are you partially or fully blind?",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Partially blind", value: "partial", score: 3 },
          { label: "Fully blind", value: "full", score: 5 },
        ],
      },
      {
        id: "q60",
        prompt: "Q60 Difficulty hearing",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Mild difficulty", value: "mild", score: 1 },
          { label: "Moderate difficulty", value: "moderate", score: 2 },
          { label: "Severe difficulty", value: "severe", score: 3 },
          { label: "Deaf", value: "deaf", score: 5 },
        ],
      },
      { id: "q61", prompt: "Q61 [Case Manager] Visual Needs Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q62", prompt: "Q62 [Case Manager] Hearing Needs Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q63", prompt: "Q63 [Case Manager] Date of conclusion (Factor 7)", type: "date", caseManagerOnly: true },
    ],
  },
  {
    title: "Factor 8: Caregiver Assistance & Available Benefits",
    questions: [
      {
        id: "q64",
        prompt: "Q64 Do you have a caregiver or someone who regularly assists with health needs?",
        type: "single",
        required: true,
        options: [
          { label: "No caregiver", value: "none", score: 3 },
          { label: "Yes - spouse/partner", value: "spouse", score: 0 },
          { label: "Yes - adult child", value: "adult_child", score: 0 },
          { label: "Yes - sibling or relative", value: "relative", score: 0 },
          { label: "Yes - paid caregiver/home aide", value: "paid", score: 0 },
          { label: "Yes - neighbour/community volunteer", value: "neighbour", score: 1 },
        ],
      },
      {
        id: "q65",
        prompt: "Q65 [Case Manager] If caregiver exists, do they appear strained?",
        type: "single",
        caseManagerOnly: true,
        options: [
          { label: "N/A - no caregiver", value: "na", score: 0 },
          { label: "No - caregiver is coping well", value: "coping", score: 0 },
          { label: "Somewhat strained", value: "somewhat", score: 2 },
          { label: "Very strained / burned out", value: "very", score: 4 },
        ],
      },
      {
        id: "q66",
        prompt: "Q66 Are you currently enrolled in any health insurance scheme?",
        type: "single",
        required: true,
        options: [
          { label: "NHIA / NHIS", value: "nhia", score: 0 },
          { label: "State-level health insurance", value: "state", score: 0 },
          { label: "Private health insurance / HMO", value: "private", score: 0 },
          { label: "Employer-sponsored insurance", value: "employer", score: 0 },
          { label: "No insurance - paying out of pocket", value: "oop", score: 2 },
          { label: "No insurance - cannot afford", value: "cannot_afford", score: 4 },
        ],
      },
      {
        id: "q67",
        prompt: "Q67 Awareness of social protection/welfare programmes",
        type: "single",
        required: true,
        options: [
          { label: "Yes - and currently receiving benefits", value: "receiving", score: 0 },
          { label: "Yes - aware but not enrolled", value: "aware_not_enrolled", score: 1 },
          { label: "No - not aware", value: "not_aware", score: 2 },
          { label: "Not applicable", value: "na", score: 0 },
        ],
      },
      { id: "q68", prompt: "Q68 [Case Manager] Evaluation of Available Benefits Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q69", prompt: "Q69 [Case Manager] Caregiver Assistance Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q70", prompt: "Q70 [Case Manager] Date of conclusion (Factor 8)", type: "date", caseManagerOnly: true },
    ],
  },
]

export const step4Sections: SectionDefinition[] = [
  {
    title: "Factor 9: Community, Mental Health & Transportation",
    questions: [
      {
        id: "q71",
        prompt: "Q71 Referred to specialists/community resources?",
        type: "single",
        options: [
          { label: "No", value: "no" },
          { label: "Yes - please list below", value: "yes" },
        ],
      },
      { id: "q71_detail", prompt: "Q71 Referral details", type: "textarea" },
      {
        id: "q72",
        prompt: "Q72 If referred, have you followed up?",
        type: "single",
        options: [
          { label: "N/A - no referral", value: "na", score: 0 },
          { label: "Yes - fully followed up", value: "full", score: 0 },
          { label: "Partially - some done", value: "partial", score: 1 },
          { label: "No - have not followed up", value: "no", score: 3 },
        ],
      },
      {
        id: "q73",
        prompt: "Q73 Reliable transportation to healthcare appointments?",
        type: "single",
        required: true,
        options: [
          { label: "Yes - own vehicle", value: "own_vehicle", score: 0 },
          { label: "Yes - public transport", value: "public", score: 1 },
          { label: "Depends - sometimes difficult", value: "depends", score: 2 },
          { label: "No - frequently miss appointments", value: "miss", score: 3 },
          { label: "No - no transport available", value: "none", score: 4 },
        ],
      },
      {
        id: "q74",
        prompt: "Q74 Distance to nearest healthcare facility",
        type: "single",
        required: true,
        options: [
          { label: "Less than 1 km", value: "lt_1", score: 0 },
          { label: "1-5 km", value: "1_5", score: 0 },
          { label: "6-15 km", value: "6_15", score: 1 },
          { label: "16-30 km", value: "16_30", score: 2 },
          { label: "More than 30 km", value: "gt_30", score: 4 },
        ],
      },
      {
        id: "q75",
        prompt: "Q75 Access to community mental health services/support groups",
        type: "single",
        required: true,
        options: [
          { label: "Yes - and using them", value: "using", score: 0 },
          { label: "Yes - aware but not using", value: "aware_not_using", score: 1 },
          { label: "No - not available", value: "not_available", score: 3 },
          { label: "Not sure", value: "not_sure", score: 2 },
        ],
      },
      {
        id: "q76",
        prompt: "Q76 Do you feel you are NOT well treated by partner/spouse/family?",
        type: "single",
        required: true,
        options: [
          { label: "No - I feel well treated", value: "well_treated", score: 0 },
          { label: "Sometimes", value: "sometimes", score: 2 },
          { label: "Yes - frequently", value: "frequently", score: 4 },
        ],
      },
      {
        id: "q77",
        prompt: "Q77 Is anyone keeping you from contact with others or activities?",
        type: "single",
        required: true,
        options: [
          { label: "No", value: "no", score: 0 },
          { label: "Occasionally", value: "occasionally", score: 2 },
          { label: "Frequently", value: "frequently", score: 4 },
        ],
      },
      {
        id: "q78",
        prompt: "Q78 Barriers to seeing your provider/getting needed care (check all that apply)",
        type: "multi",
        required: true,
        options: [
          { label: "No barriers", value: "no_barriers" },
          { label: "Cost / cannot afford care", value: "cost" },
          { label: "Long waiting times", value: "waiting_times" },
          { label: "Distance / transport", value: "distance_transport" },
          { label: "No available specialist locally", value: "no_specialist" },
          { label: "Language / communication barrier", value: "language" },
          { label: "Fear or mistrust of healthcare system", value: "mistrust" },
          { label: "Cultural / religious reasons", value: "cultural" },
          { label: "Lack of health information / awareness", value: "awareness" },
          { label: "Power outages affecting facility operations", value: "power_outages" },
          { label: "Drug stockouts at facilities", value: "drug_stockouts" },
        ],
      },
      { id: "q79", prompt: "Q79 [Case Manager] Community Mental Health Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q80", prompt: "Q80 [Case Manager] Transportation Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q81", prompt: "Q81 [Case Manager] Date of conclusion (Factor 9)", type: "date", caseManagerOnly: true },
    ],
  },
  {
    title: "Factor 10: Wellness, Nutritional Support & Palliative Care",
    questions: [
      {
        id: "q82",
        prompt: "Q82 Participation in wellness/health promotion programmes",
        type: "single",
        required: true,
        options: [
          { label: "No - not participating", value: "not_participating", score: 2 },
          { label: "Yes - exercise / fitness programme", value: "exercise", score: 0 },
          { label: "Yes - diabetes/hypertension management group", value: "chronic_group", score: 0 },
          { label: "Yes - HIV/TB support group", value: "hiv_tb_group", score: 0 },
          { label: "Yes - weight management", value: "weight_management", score: 0 },
          { label: "Yes - other health promotion activity", value: "other", score: 0 },
        ],
      },
      {
        id: "q83",
        prompt: "Q83 Current nutritional support or counselling",
        type: "single",
        required: true,
        options: [
          { label: "No - and not needed", value: "no_not_needed", score: 0 },
          { label: "No - but needed", value: "no_needed", score: 3 },
          { label: "Yes - from a dietitian / nutritionist", value: "dietitian", score: 0 },
          { label: "Yes - through a health facility/programme", value: "facility", score: 0 },
          { label: "Yes - through community/NGO programme", value: "community", score: 0 },
        ],
      },
      {
        id: "q84",
        prompt: "Q84 Current palliative or end-of-life care services",
        type: "single",
        required: true,
        options: [
          { label: "No - not applicable", value: "not_applicable", score: 0 },
          { label: "No - but needed", value: "needed", score: 3 },
          { label: "Yes - at home", value: "home", score: 0 },
          { label: "Yes - at a facility", value: "facility", score: 0 },
          { label: "Yes - through hospice", value: "hospice", score: 0 },
        ],
      },
      { id: "q85", prompt: "Q85 [Case Manager] Wellness Program(s) Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q86", prompt: "Q86 [Case Manager] Nutritional Support Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q87", prompt: "Q87 [Case Manager] Palliative Care Conclusion", type: "textarea", caseManagerOnly: true },
      { id: "q88", prompt: "Q88 [Case Manager] Date of conclusion (Factor 10)", type: "date", caseManagerOnly: true },
    ],
  },
  {
    title: "Factor 11: Life Planning & Treatment Decisions",
    questions: [
      {
        id: "q89",
        prompt: "Q89 Life planning documents in place (living will/advance directive/etc.)",
        type: "single",
        required: true,
        options: [
          { label: "Yes - documents are in place", value: "in_place", score: 0 },
          { label: "No - but planning to get them", value: "planning", score: 1 },
          { label: "No - and not planning to", value: "not_planning", score: 2 },
          { label: "Not aware of such documents", value: "not_aware", score: 3 },
        ],
      },
      {
        id: "q90",
        prompt: "Q90 If unable to decide, have you designated a healthcare proxy/POA?",
        type: "single",
        required: true,
        options: [
          { label: "Yes - formally documented", value: "formal", score: 0 },
          { label: "Yes - verbally agreed", value: "verbal", score: 1 },
          { label: "No - have not designated anyone", value: "no", score: 3 },
          { label: "Not applicable", value: "na", score: 0 },
        ],
      },
      {
        id: "q91",
        prompt: "Q91 [Case Manager] If life planning needs are present, how did you help? (check all that apply)",
        type: "multi",
        caseManagerOnly: true,
        options: [
          { label: "Provided information on Advance Directives", value: "advance_directives" },
          { label: "Referred to legal aid / elder law attorney", value: "legal_aid" },
          { label: "Referred to NHIA / insurance officer", value: "nhia_officer" },
          { label: "Referred to hospital social worker", value: "social_worker" },
          { label: "Referred to primary care provider", value: "pcp" },
          { label: "Provided online / community resources", value: "resources" },
          { label: "No action needed", value: "none" },
        ],
      },
      { id: "q92", prompt: "Q92 [Case Manager] Life planning/treatment decisions conclusion and gaps", type: "textarea", caseManagerOnly: true },
      { id: "q93", prompt: "Q93 [Case Manager] Date of conclusion (Factor 11)", type: "date", caseManagerOnly: true },
    ],
  },
]

export const step5Questions: QuestionDefinition[] = [
  { id: "q94", prompt: "Q94 Weight/Height recorded for BMI calculation", type: "text", required: true },
  {
    id: "q95",
    prompt: "Q95 Have you been tested for malaria in the past 3 months?",
    type: "single",
    options: [
      { label: "Yes - negative", value: "negative", score: 0 },
      { label: "Yes - positive (treated)", value: "positive_treated", score: 1 },
      { label: "Yes - positive (not yet treated)", value: "positive_untreated", score: 3 },
      { label: "No", value: "no", score: 1 },
    ],
  },
  {
    id: "q96",
    prompt: "Q96 Have you ever been tested for HIV?",
    type: "single",
    options: [
      { label: "Yes - negative (recent test)", value: "negative", score: 0 },
      { label: "Yes - positive (on treatment)", value: "positive_on_treatment", score: 1 },
      { label: "Yes - positive (not on treatment)", value: "positive_no_treatment", score: 4 },
      { label: "No - never tested", value: "never", score: 2 },
    ],
  },
  {
    id: "q97",
    prompt: "Q97 Are your vaccinations up to date?",
    type: "single",
    options: [
      { label: "Yes - fully vaccinated", value: "full", score: 0 },
      { label: "Partially vaccinated", value: "partial", score: 1 },
      { label: "No - not vaccinated", value: "none", score: 3 },
      { label: "Not sure", value: "not_sure", score: 2 },
    ],
  },
]

export function getScoredQuestionsForAssessment(isFirstTimeAssessment: boolean): QuestionDefinition[] {
  if (isFirstTimeAssessment) {
    return [
      ...step2Sections.flatMap((section) => section.questions),
      ...step3Sections.flatMap((section) => section.questions),
      ...step4Sections.flatMap((section) => section.questions),
      ...step5Questions,
    ]
  }

  return step5Questions
}

import { z } from "zod";

// --- AUTH & USER ---
export const LoginSchema = z.object({
  email: z.string().email("Invalid professional email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

// --- PATIENT ---
export const PatientSchema = z.object({
  firstName: z.string().min(2, "First name is required for clinical records."),
  lastName: z.string().min(2, "Last name is required for clinical records."),
  email: z.string().email("Invalid patient email address."),
  password: z.string().min(8, "Secure password required (min 8 chars)."),
  phone: z.string().min(10, "Valid contact number required."),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid Date of Birth is required.",
  }),
});

// --- PROVIDER ---
export const ProviderSchema = z.object({
  firstName: z.string().min(2, "Legal first name required."),
  lastName: z.string().min(2, "Legal last name required."),
  email: z.string().email("Professional email address required."),
  password: z.string().min(8, "Secure password required."),
  specialty: z.string().min(2, "Medical specialty is mandatory."),
  licenseNumber: z.string().min(5, "Valid medical license number required."),
});

// --- APPOINTMENT ---
export const AppointmentSchema = z.object({
  patientId: z.string().uuid("Invalid Patient ID."),
  providerId: z.string().uuid("Invalid Provider ID."),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid appointment time required.",
  }),
  notes: z.string().optional(),
});
// --- ACCESS CONTROL ---
export const AccessControlSchema = z.object({
  isActive: z.boolean(),
});

// --- ASSESSMENT ---
export {
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
} from "./assessment";

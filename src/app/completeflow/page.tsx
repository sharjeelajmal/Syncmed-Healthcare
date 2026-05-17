"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  Stethoscope, 
  User, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  Workflow, 
  CheckCircle,
  TrendingUp,
  FileCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  CreditCard,
  Laptop,
  FileText,
  Activity,
  X
} from "lucide-react"

// Types for specifications mapping
interface SpecItem {
  id: number
  title: string
  intent: string
  breakdown: string[]
  advantage: string
  icon: any
  tag: string
  route: string
}

interface Phase {
  title: string
  subtitle: string
  icon: any
  description: string
  specs: SpecItem[]
}

const specificationsData: Phase[] = [
  {
    title: "PHASE 1: THE ADMINISTRATOR PORTAL PROTOCOLS",
    subtitle: "Enterprise Governance & Financial Routing",
    icon: Shield,
    description: "The Administrator Portal serves as the operational command center and governance layer of the SyncMed platform. It is engineered to enforce strict financial routing, maintain compliance protocols, mitigate double-booking risks, and optimize enterprise workflow transparently.",
    specs: [
      {
        id: 1,
        title: "1. THE ADVANCED REVENUE & CLINICAL OVERVIEW PANEL (/admin/settings - Overview Tab)",
        route: "/admin/settings - Overview Tab",
        tag: "Analytics & SVG Engine",
        icon: BarChart3,
        intent: "Operational Intent: To deliver instant, un-redacted visibility into the operational and fiscal health of the platform over variable time intervals (7 Days, 30 Days, 1 Year, or a granular Custom Range Matrix) without requiring manual data collation.",
        breakdown: [
          "Live Metrics Grid: Dynamically calculates aggregate data directly from the system's operational tables.",
          "Patient Engagement Tracker: Evaluates active patient growth rates relative to previous chronological baselines.",
          "Appointment Integrity Counter: Quantifies scheduled versus unconfirmed encounters, highlighting system usage.",
          "Net Revenue Monitor: Displays actualized income by checking only VERIFIED financial rows, side-by-side with outstanding, non-liquid collections.",
          "Advanced Visual Canvas (SVG Analytics Engine): Utilizes interactive bezier paths to illustrate daily appointment load trends and animated donut rings to isolate settled versus unsettled financial profiles.",
          "AI Diagnostics Cost Tracker: Synthesizes cumulative prompt and completion token metadata generated during secure patient/provider chat exchanges to calculate the exact computing overhead of the AI system."
        ],
        advantage: "Real-World Advantage: Eliminates data silos. The client can verify platform profitability, locate collection backlogs, and assess AI resource overhead from a single, unified analytical center."
      },
      {
        id: 2,
        title: "2. CORE PATIENT DIRECTORY & CLINICAL ONBOARDING (/admin/patients)",
        route: "/admin/patients",
        tag: "Directory & Medical Registry",
        icon: User,
        intent: "Operational Intent: To manage the secure digital onboarding of patients, handle profile edits, and initialize clinical records under enterprise standards.",
        breakdown: [
          "The Global Roster: Features deep indexing and search filters to isolate patient states, linked account parameters, and verification histories.",
          "Clinical Snapshot Initialization: Allows the Administrator to initialize a patient’s record with historical medical parameters—specifically Active Medications, Allergies, and Chronic Conditions—using comma-separated array strings.",
          "Provider Assignment Engine: Maps specific patients to designated primary physicians, immediately initializing the relational table layer that populates individual provider rosters."
        ],
        advantage: "Real-World Advantage: Ensures seamless onboarding transitions. Doctors never receive a blank slate; the admin initializes the patient's record beforehand so that critical clinical alerts (e.g., severe allergies) are automatically illuminated the moment the provider opens the chart."
      },
      {
        id: 3,
        title: "3. PROVIDER ACCESS CONTROL & FISCAL ENGINE (/admin/providers)",
        route: "/admin/providers",
        tag: "Clearance & Dynam Fee Manager",
        icon: Lock,
        intent: "Operational Intent: To manage the credentials, licensing parameters, access states, and individualized pricing structures for the professional medical team.",
        breakdown: [
          "Dynamic Variable Consultation Fees: Moving away from rigid, platform-wide code rules, this module embeds a live financial parameter inside each provider's record (consultationFee). Administrators can adjust this amount based on seniority, specialization, or contract tiers (e.g., setting Dr. A at $150 and Dr. B at $220).",
          "Security Access Configuration Tool: Allows admins to toggle the functional clearance levels of individual clinicians, review license authentications, and temporarily suspend access if compliance reviews fail."
        ],
        advantage: "Real-World Advantage: Offers maximum commercial agility. If a provider changes their rates or if a new tier of specialized consultants is added to the system, the admin updates the parameter via the UI. The platform's booking wizard immediately adapts to the new rates without requiring code revisions."
      },
      {
        id: 4,
        title: "4. MASTER APPOINTMENT DISPATCH & COMPLIANCE GUARD (/admin/appointments)",
        route: "/admin/appointments",
        tag: "Global Collision Lock",
        icon: Calendar,
        intent: "Operational Intent: To serve as the definitive ledger of clinical calendars, orchestrating booking requests from both internal administration staff and patient interfaces.",
        breakdown: [
          "Global Conflict Lock (Collision Protection): Enforces an ironclad scheduling rule at the database transaction layer. If an admin manually schedules a patient, the system parses the requested time block against the provider's active availability rules and overlapping commitments. If a conflict exists, the process aborts instantly, rendering a clear alert on screen.",
          "Manual Override Clearance: Provides administrative staff with the authority to book special accommodations, cancel non-compliant slots, or re-route emergency triage requests across the provider roster."
        ],
        advantage: "Real-World Advantage: Eliminates scheduling errors. By forcing all internal administrative overrides through the same validation engine used by patients, the system ensures zero clinical over-scheduling, protecting provider sanity and patient trust."
      },
      {
        id: 5,
        title: "5. THE FINANCIAL VERIFICATION GATEWAY (/admin/dashboard - Verification Queue)",
        route: "/admin/dashboard - Verification Queue",
        tag: "Wire Verification Auditing",
        icon: CreditCard,
        intent: "Operational Intent: To prevent revenue leakage by serving as the human-in-the-loop audit check for private bank wire transfers and deposit receipt uploads.",
        breakdown: [
          "The Triage Ledger: Isolates all payment invoices that currently hold a status of VERIFICATION_PENDING.",
          "Receipt Auditing Modal: Pulls the explicit high-resolution transfer receipt uploaded by the patient side-by-side with the expected invoice balance details.",
          "The Strict System Unlock Mechanics:",
          "Rejection Loop: If the transfer receipt is invalid, the admin rejects it, sending the invoice back to the patient’s outstanding column.",
          "Approval Lock Release: The moment the admin clicks \"Verify Payment\", the invoice switches to a state of PAID. This structural database mutation updates the patient’s billing screen, logs the cash asset into the Overview tab, and unlocks the clinical assessment pathway for the doctor."
        ],
        advantage: "Real-World Advantage: Absolute financial security. It stops unauthorized checkups before they can occur. Doctors are completely insulated from verifying payments, while administrators hold tight control over cash collection, ensuring no medical care is delivered for uncollected funds."
      },
      {
        id: 6,
        title: "6. NATIVE WEB APP EXECUTION PLATFORM (PWA Dashboard Header)",
        route: "PWA Dashboard Header",
        tag: "Commission-Free stand-alone",
        icon: Laptop,
        intent: "Operational Intent: To deploy a reliable, commission-free native software installation entry point for administrators running high-throughput daily workflows.",
        breakdown: [
          "The Invisible Banner Rule: Embedded inside the top greeting bar, the \"Install App\" interface remains completely hidden if the administrator is already executing inside a standalone application viewport.",
          "One-Click Chromium Execution: Leverages registered service workers and optimized manifest caching to trigger a clean, native desktop installer prompt for the user, removing browser chrome components for an isolated desktop app experience.",
          "Real-World Advantage: High-speed execution. By running SyncMed as an isolated, standalone app on their machines, admins experience rapid task switching, native window behaviors, and an elite desktop experience optimized for multitasking."
        ],
        advantage: ""
      }
    ]
  },
  {
    title: "PHASE 2: THE PROVIDER (DOCTOR) PORTAL PROTOCOLS",
    subtitle: "Clinical Charting & Revenue Locks Automation",
    icon: Stethoscope,
    description: "Provider Portal ko pure healthcare workspace automation standards par design kiya gaya hai. Iska maqsad doctors ke sar se administrative bojh (cash management, manual scheduling) ko zero karna hai, taake wo apna poora focus accurate charting aur clinical decisions par rakh sakein.",
    specs: [
      {
        id: 1,
        title: "1. THE PAYMENT-LOCKED CLINICAL ROSTER (/provider/dashboard)",
        route: "/provider/dashboard",
        tag: "Direct Payment Locking Gate",
        icon: Lock,
        intent: "Operational Intent: Doctor ke daily triage and workflow queue ko manage karna, aur automatic system execution ke zariye revenue protection lagana.",
        breakdown: [
          "Live Patient Status Grid: Yeh queue direct database transactions se sync hoti hai. Har patient ke clinical profile ke sath ek live security state badge attach hota hai (🟢 CLEARED/PAID ya 🔴 PENDING PAYMENT).",
          "The Strict Operational Gatekeeper (System Lock): Agar naye patient ki payment PENDING ya VERIFICATION_PENDING state mein hai, toh platform backend database level par validation strict kar deta hai. Is state mein doctor ke UI par \"Create New Assessment\" ka button fully disable aur locked ho jata hai."
        ],
        advantage: "Real-World Advantage: System leakage ka risk zero ho jata hai. Doctor ko manually kisi accountant se confirm nahi karna parta ke checkup karein ya nahi. Jab tak payment clear nahi hoti, UI doctor ko checkup record generate karne hi nahi degi, protecting clinical billable time."
      },
      {
        id: 2,
        title: "2. DYNAMIC LIVE AVAILABILITY MANAGER (/provider/schedule)",
        route: "/provider/schedule",
        tag: "Autonomous Calendar Engine",
        icon: Calendar,
        intent: "Operational Intent: Doctor ko administrative interference ke bina apni weekly availability, operational hours, aur off-days ko directly dashboard se control karne ki mukammal autonomy dena.",
        breakdown: [
          "7-Day Structural Matrix Form: Provider portal ka yeh section database ke Availability table se directly loaded hai.",
          "iOS-Style Power Toggles: Doctor har individual day (Monday to Sunday) ko switch ON/OFF kar sakta hai. Day toggled OFF hote hi specific parameters disable ho jate hain, aur database mein isActive: false status map ho jata hai.",
          "Granular Time Inputs: Doctor har operational day ke liye custom Start Time aur End Time ranges set kar sakta hai (e.g., Friday 09:00 AM to 05:00 PM)."
        ],
        advantage: "Real-World Advantage: Automated booking sync. Jab doctor yahan apni working window save karta hai, toh patient side ka calendar aur appointment creation validation logic instantly update ho jata hai. Is ke baad patient ya administrative staff unke working time boundaries ya closed days se bahar chah kar bhi slot book nahi kar sakte."
      },
      {
        id: 3,
        title: "3. IMMUTABLE CLINICAL SNAPSHOT VIEW (/provider/patients/[id])",
        route: "/provider/patients/[id]",
        tag: "Historical Medical Preview",
        icon: User,
        intent: "Operational Intent: Direct assessment checkup shuru karne se pehle doctor ko patient ki historical allergies aur baseline records ka secure preview dena taake high-risk medical alerts avoid kiye ja sakein.",
        breakdown: [
          "Prisma Dynamic Array Mapping: Yeh panel tab chalte hi target user ID ke relational rows check karta hai aur dummy strings ke bajaye actual array strings load karta hai.",
          "Visual Metric Badges: Patient ki key medical identifiers ko separate content wrappers mein convert karta hai:",
          "Active Medications: Currently items prescribed.",
          "Allergies Alert Panel: High-risk chemical/food allergies jo admin ne initialize ki thi.",
          "Chronic Conditions: Long-term diagnosed pathologies."
        ],
        advantage: "Real-World Advantage: Total diagnostic accuracy. Agar patient ko kisi medicine (e.g., Penicillin) se severe allergy hai, toh doctor profile kholte hi screen par text-based standard rows ke bajaye responsive safety tags dekhega, ensuring absolute standard healthcare compliance."
      },
      {
        id: 4,
        title: "4. MEDICAL CHARTING & POST-VISIT EXTRA BILLING (/provider/assessments/new)",
        route: "/provider/assessments/new",
        tag: "Encounters & Invoicing Auto",
        icon: FileText,
        intent: "Operational Intent: Clinical assessment encounter forms execute karna aur checkup ke dauran kiye gaye extra internal procedures ke charges transparently capture karna.",
        breakdown: [
          "Encounters Core Schema: Formal structured medical inputs capture karta hai (Symptoms, Diagnostics Notes, Prescriptions, Care Plans).",
          "Additional Procedure Charges Module: Form submission block se bilkul upar ek secondary billing metric tool embedded hai. Agar doctor visit ke dauran koi additional procedure execute karta hai (e.g., Vitals testing tool charges, ECG execution, specialized swabs), toh doctor wahan custom fee enter karta hai (e.g., $50.00).",
          "Automated Secondary Invoicing Engine: Form submit hote hi server action chalte hi do alag parallel actions trigger hote hain:",
          "Clinical Assessment form save ho kar immutable chart data ban jata hai.",
          "System check karta hai ke agar additionalCharges > 0, toh original paid appointment entry ko touch kiye bina automatically ek brand new 'Secondary Invoice' system generate kar deta hai status PENDING ke sath, jo seedha patient panel par shift ho jati hai."
        ],
        advantage: "Real-World Advantage: Upsell revenue automation without accounting friction. Accounting guidelines ke mutabiq paid invoices edit nahi ho sakti, isliye system bina original bill chhere extra revenue automate karta hai aur cashier job doctor ke darmyan se permanently bypass ho jati hai."
      },
      {
        id: 5,
        title: "5. REGULATORY SECURE RE-AUTHENTICATION (/provider/profile & Security Configuration)",
        route: "/provider/profile & Security Configuration",
        tag: "HIPAA Clearance Credentials",
        icon: Shield,
        intent: "Operational Intent: Direct provider verification lock aur login safety metrics execute rakhna taake clinician identity theft verify ho sake.",
        breakdown: [
          "MFA Orchestrator Framework: Settings and Security panel ke directly built-in module se standard credentials verification logic map hota hai.",
          "Profile Credential Handlers: Form changes complete server state rules validate karte hue dynamic state mutate karte hain, preventing external input injections."
        ],
        advantage: "Real-World Advantage: HIPAA Data protection. Clinical information access absolute restricted rehne ke liye profile controls completely audited hain."
      }
    ]
  },
  {
    title: "PHASE 3: THE PATIENT PORTAL PROTOCOLS",
    subtitle: "Elite Healthcare Concierge & Dynamic Patient Portal",
    icon: User,
    description: "Patient Portal ko ek premium, elite medical concierge portal ke UI/UX principles par design kiya gaya hai. Iska maqsad transparent financial management, effortless booking pathways, aur seamless medical record access ko ensure karta hai, jabki business layer par zero revenue leakage policy ko strictly enforce rakhta hai.",
    specs: [
      {
        id: 1,
        title: "1. INTELLIGENT APPOINTMENT SCHEDULING WIZARD (/patient/doctors & /patient/appointments)",
        route: "/patient/doctors & /patient/appointments",
        tag: "Rate Sync & Collision Lock",
        icon: Calendar,
        intent: "Operational Intent: Patients ko self-service digital booking authority dena, jabki provider operational boundaries aur historical booking logs ko database level par instantly safeguard rakhna.",
        breakdown: [
          "Dynamic Doctor Rate Synchronization: Patient portal ka booking engine kabhi bhi static baseline parameters read nahi karta. Jab patient kisi specific doctor ko select karta hai, system behind-the-scenes live checkup call karke us doctor ka individual profile fee structure (consultationFee) fetch karta hai aur booking form state par inject kar deta hai.",
          "The Weekly Availability Gatekeeper: Calendar view direct doctor ke dynamic schedule table se connected hai. Agar kisi doctor ne apna status Saturday/Sunday ko OFF toggled kiya hai, ya unki shift subha 9 baje se pehle ya sham 5 baje ke baad operational nahi hai, toh patient un slots par click hi nahi kar sakta.",
          "The Strict Collision Protection Lock (Anti-Overlap): Agar patient koi aisi time range select karta hai jo already kisi doosre patient ne secure kar li hai, toh backend database layer par dynamic validation query check karke transaction instantly block kar deti hai aur execution thread cancel karke live UI par solid error message render karti hai."
        ],
        advantage: "Real-World Advantage: System double-booking errors ko permanently impossible bana deta hai. Admin ya coordination staff ke middle-man workflow ke bina patient srf usi window mein book kar sakta hai jahan doctor officially available aur fully vacant ho."
      },
      {
        id: 2,
        title: "2. OUTSTANDING FISCAL RADAR & DYNAMIC REVENUE ALERTS (/patient/layout)",
        route: "/patient/layout",
        tag: "Collection Push Alerts",
        icon: Activity,
        intent: "Operational Intent: Platform ke collection rates ko maximize karna aur billing parameters ko check karne ke liye patient ko constant interactive reminders serve karna.",
        breakdown: [
          "The Persistent Pulse Notification Badge: Patient portal ke dashboard layout navigation element par ek custom, database-driven micro-badge engine system built-in hai.",
          "Live Query Aggregator: Yeh layout state dynamic background count execute karti hai jahan platform database query execute karke specific profile id ke checking record rows check karta hai. Agar patient ki koi bhi invoice status database layer par PENDING state hold karti hai, toh sidebar navigation menu par Billing text ke exactly side-by-side ek round high-visibility red badge animate (animate-pulse) hona shuru ho jata hai."
        ],
        advantage: "Real-World Advantage: Constant compliance push. Patient jab tak pane outstanding statements clear nahi karta, yeh alert badge screen panel se automatic disappear nahi hota, ensuring swift collections for base fees and post-visit procedures alike."
      },
      {
        id: 3,
        title: "3. CONCIERGE BILLING GATEWAY & BANK TRANSFER MANAGER (/patient/billing)",
        route: "/patient/billing",
        tag: "Vault Router & Screenshot Upload",
        icon: CreditCard,
        intent: "Operational Intent: Single portal surface par transparent billing history present karna aur direct cash transfer documentation parameters securely host karna.",
        breakdown: [
          "Unified Invoicing Ledger: Patient billing client panel par dynamic listing map hoti hai jo complete system transactions render karti hai. Isme base consultation fees aur doctor ke assessment form se generate hone wali secondary post-visit invoices alag-alag itemized rows mein transparently display hoti hain.",
          "Premium Offline Bank Settlement Modal: Jab patient \"Upload Receipt\" trigger click karta hai, toh portal structure bypass karke ek isolated UI layer layout call hoti hai. Yeh clean card interface specific configuration content parameters display karta hai:",
          "Official Financial Vault Title: SyncMed Concierge Care",
          "Secure Routing parameters: Chase Premium Banking Network",
          "Unique Vault String: Account parameters exactly mirroring balance requirements.",
          "Receipt Capture Automation: Patient physical cash transfer execution screenshot capture karke dynamic image/PDF component upload handle form execute karta hai, jo system transaction reference status ko switch karke VERIFICATION_PENDING layer par admin queue mein shift kar deta hai."
        ],
        advantage: "Real-World Advantage: Zero merchant transaction fee losses. Secure wire management workflows transparently display ho jate hain, aur itemized structures patient ko exact reason detailed clarify karte hain ke base appointment checkup fees kitni thi aur internal specialized procedural tool usage charges kitne generate hue."
      },
      {
        id: 4,
        title: "4. MULTI-PLATFORM NATIVE APPLICATION PORTABILITY (PWA Layout Header)",
        route: "PWA Layout Header",
        tag: "Chromium Hook & Fallback Dialog",
        icon: Laptop,
        intent: "Operational Intent: Website wrappers permanently clean full-screen experience application shakal mein browser frameworks se alag desktop/mobile surfaces par deliver karna.",
        breakdown: [
          "Responsive Viewport Integration Flex-Row: Desktop monitors, mobile phones, aur iPad/Tablet devices par standard dashboard banner elements force container items apply rakhte hain, keeping tracking data status tag aur naya unified action component row formatting parameters par side-by-side fluid.",
          "Secure Native Chromium Hook (1-Click Desktop): Sahi environments aur browser conditions meet hote hi, engine direct component hooks trigger map processing execute karta hai. Is point par click execution direct OS level browser application standalone prompt engine pull karti hai.",
          "Device Intelligent Fallback Framework: Programmatic prompts natively block hone ki unique edge cases (jaise iPhone iOS ecosystem rules) par manual dialog layer center execution render control call hota hai. Yeh engine system desktop platform detection constraints isolate karke conditional visual instructions print karta hai, preventing workflow deadlocks."
        ],
        advantage: "Real-World Advantage: Desktop/Mobile home screen parity. Jab patient application install execute kar leta hai, toh platform normal website layouts bars and url inputs strip karke 100% full-screen responsive stand-alone premium portal application framework execute karta hai.]"
      }
    ]
  }
]

export default function CompleteFlowPage() {
  const [activeTab, setActiveTab] = React.useState<number>(0)
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [activeSectionId, setActiveSectionId] = React.useState<number>(1)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)

  // Create a ref for the detail panel card to implement auto-scroll
  const activeCardRef = React.useRef<HTMLDivElement | null>(null)

  // Auto-reset selected active section to 1 when changing Phase Tabs
  React.useEffect(() => {
    setActiveSectionId(1)
  }, [activeTab])

  // Filter items in real-time preserving 100% original text structures
  const filteredSpecs = specificationsData[activeTab].specs.filter(spec => {
    const textToSearch = `${spec.title} ${spec.intent} ${spec.advantage} ${spec.breakdown.join(" ")}`.toLowerCase()
    return textToSearch.includes(searchQuery.toLowerCase())
  })

  // Get active spec item based on activeSectionId
  const activeSpec = filteredSpecs.find(spec => spec.id === activeSectionId) || filteredSpecs[0]

  // Calculate dynamic specifications progress bar percentage
  const totalSpecs = filteredSpecs.length
  const activeSpecIndex = filteredSpecs.findIndex(spec => spec.id === (activeSpec?.id || 1))
  const progressPercentage = totalSpecs > 0 ? ((activeSpecIndex + 1) / totalSpecs) * 100 : 0

  // Scroll to header of details card cleanly
  const scrollToHeading = () => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Navigate to Next/Prev protocol cleanly with scroll action
  const handleNext = () => {
    if (activeSpecIndex < totalSpecs - 1) {
      setActiveSectionId(filteredSpecs[activeSpecIndex + 1].id)
      // Small timeout to let content render before scrolling
      setTimeout(scrollToHeading, 50)
    }
  }

  const handlePrev = () => {
    if (activeSpecIndex > 0) {
      setActiveSectionId(filteredSpecs[activeSpecIndex - 1].id)
      setTimeout(scrollToHeading, 50)
    }
  }

  // Complete Lifecycle steps data translated into elegant Human English
  const lifecycleSteps = [
    {
      step: "🔄 STEP 1",
      title: "Platform Initialization (The Admin Setup)",
      subtitle: "The Administrator establishes the structural foundation of the platform to operationalize daily clinical activities.",
      details: [
        {
          label: "Provider Pricing Configuration",
          desc: "The Admin registers new clinicians and customizes their consultation fees (e.g., $150 or $250) based on seniority, specialization, or tier."
        },
        {
          label: "Patient Baseline Charting",
          desc: "The Admin securely registers the patient's profile and initializes their Clinical Snapshot (Allergies, Chronic Conditions). This ensures that primary doctors receive critical clinical alerts on day one."
        }
      ],
      icon: Shield
    },
    {
      step: "🔄 STEP 2",
      title: "The Doctor's Availability Broadcast (Provider Setup)",
      subtitle: "Once initialized, clinicians log into their private dashboard to assert full control over their operational calendar.",
      details: [
        {
          label: "Live Schedule Management",
          desc: "Instead of coordinating with administrative staff manually, providers directly toggle their active working days (Monday–Friday) and set precise shift hours (e.g., 09:00 AM – 05:00 PM)."
        },
        {
          label: "The Result",
          desc: "The booking engine instantly locks these timeframes in the database, preventing patients or coordinators from booking any slots outside the clinician's designated hours."
        }
      ],
      icon: Stethoscope
    },
    {
      step: "🔄 STEP 3",
      title: "The Self-Service Booking (Patient Action)",
      subtitle: "Patients log in securely through their premium Progressive Web App (PWA) portal to reserve care.",
      details: [
        {
          label: "Smart Auto-Pricing",
          desc: "When a patient selects a provider, the booking wizard queries the database to retrieve that doctor's specific consultation fee (e.g., $150) and injects it dynamically into the checkout statement."
        },
        {
          label: "Collision Guard Protocol",
          desc: "The scheduling wizard enforces strict collision prevention. If the selected slot falls outside the provider's active hours, or overlaps with another patient's appointment, the database blocks the transaction and alerts the user. If verified, the booking completes, generating an automated PENDING invoice."
        }
      ],
      icon: Calendar
    },
    {
      step: "🔄 STEP 4",
      title: "The Financial Gatekeeper (Patient ➔ Admin Interaction)",
      subtitle: "The appointment is recorded, but the clinical pathway remains locked until payment is verified.",
      details: [
        {
          label: "Patient Payment Upload",
          desc: "Within the billing dashboard, patients access secure wire transfer details, submit the transfer, and upload a high-resolution deposit receipt."
        },
        {
          label: "Admin Verification Engine",
          desc: "The Admin's queue flags the receipt under a VERIFICATION_PENDING state. The Admin audits the receipt details and clicks 'Verify Payment'."
        },
        {
          label: "The System Trigger",
          desc: "Instantly, the transaction status mutates to PAID, updating the patient's record, adding the cash asset to the aggregate net revenue logs, and unlocking the physician's clinical assessment buttons."
        }
      ],
      icon: CreditCard
    },
    {
      step: "🔄 STEP 5",
      title: "The Clinical Encounter (Doctor Action)",
      subtitle: "The consultation day arrives, and the patient is ready for telehealth or in-person evaluation.",
      details: [
        {
          label: "The Secure Triage",
          desc: "The doctor logs in, verifies the patient's status as 🟢 CLEARED/PAID, and finds the clinical 'Create New Assessment' button fully active (without admin verification, the button remains strictly locked)."
        },
        {
          label: "Immutable Charting",
          desc: "The doctor initializes the encounter. They are greeted by prominent allergy alerts and chronic conditions tags mapped in Step 1. The doctor documents the symptoms, diagnosis, care plan, and prescriptions securely."
        }
      ],
      icon: Stethoscope
    },
    {
      step: "🔄 STEP 6",
      title: "Post-Visit Upsell & Secondary Billing (Doctor ➔ Patient)",
      subtitle: "If the physician administers supplementary procedures (e.g., ECG, rapid swab, or vitals panels) during the visit, secondary billing scales automatically.",
      details: [
        {
          label: "Frictionless Charging",
          desc: "Directly inside the assessment form, the provider enters the custom procedure amount (e.g., $50) before submitting."
        },
        {
          label: "Auto-Secondary Invoice",
          desc: "The platform leaves the original $150 invoice (legally paid) completely untouched. Instead, it generates a fresh, independent secondary PENDING invoice of $50 assigned to the patient."
        },
        {
          label: "The Red Pulse Alert",
          desc: "The patient’s dashboard navigation bar instantly triggers a blinking red notification indicator beside the 'Billing' link, encouraging swift collection."
        }
      ],
      icon: Activity
    },
    {
      step: "🔄 STEP 7",
      title: "Executive Oversight & Enterprise Analytics (The Admin Overview)",
      subtitle: "As the operational lifecycle completes, system data is aggregated instantly into senior management statistics.",
      details: [
        {
          label: "The God's Eye View",
          desc: "The Administrator's dashboard aggregates real-time performance indicators and operational health logs without human latency."
        },
        {
          label: "Live Dashboards",
          desc: "Growth trackers, outstanding collection radars, verified revenue ratios, and the daily appointment SVG curves update automatically to drive expert corporate oversight."
        }
      ],
      icon: BarChart3
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#67BA2E]/20 relative overflow-x-hidden pb-24">
      
      {/* 1. Interactive Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[6px] bg-slate-100 z-[999]">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#67BA2E] to-emerald-500 shadow-[0_3px_12px_rgba(103,186,46,0.6)]"
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        />
      </div>

      {/* 2. Premium Moving Backdrops */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1.5px,transparent_1.5px),linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1.5px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-40 pointer-events-none z-0" />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 0.95, 1],
          x: [0, 45, -35, 0],
          y: [0, -60, 50, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-120px] left-[15%] w-[600px] h-[600px] bg-gradient-to-tr from-[#67BA2E] to-emerald-400 blur-[130px] opacity-[0.09] pointer-events-none z-0 rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 relative z-10">
        
        {/* 3. Hero Spectacular Intro Section */}
        <header className="text-center max-w-4xl mx-auto mb-14 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.div 
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-slate-200/80 text-[#67BA2E] text-[10px] font-black uppercase tracking-[0.25em] shadow-sm shrink-0"
            >
              <Sparkles size={11} className="animate-pulse" />
              SyncMed Focused System Specifications
            </motion.div>

            {/* Master Workflow Premium Tactile Clickable Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#67BA2E] to-emerald-500 hover:from-emerald-500 hover:to-[#67BA2E] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 border border-emerald-400 hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer relative overflow-hidden group z-50 shrink-0"
            >
              {/* Button light sweep glow animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none" />
              <Workflow size={12} className="stroke-[3]" />
              Master Ecosystem Workflow
            </motion.button>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none"
          >
            SYNC_MED EXECUTIVE EMR: <span className="bg-gradient-to-r from-[#67BA2E] to-emerald-500 bg-clip-text text-transparent block md:inline">SYSTEM SPECS</span>
          </motion.h1>

          <motion.p 
            className="text-xs md:text-sm font-semibold text-slate-500 max-w-2xl mx-auto leading-relaxed tracking-wide [word-spacing:0.04em]"
          >
            A high-fidelity architectural specifications panel. Explore strict clinical clearance locks, variable consultant rate engines, global conflict protection, and native execution workflows step-by-step.
          </motion.p>
        </header>

        {/* 4. Tab Navigation and Search Deck */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-100/50 rounded-[2.5rem] p-4 mb-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-row items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-full lg:w-auto overflow-x-auto scrollbar-none">
            {specificationsData.map((phase, idx) => {
              const Icon = phase.icon
              const isActive = activeTab === idx
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(idx)
                    setSearchQuery("")
                  }}
                  className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-[0.12em] transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? "bg-[#67BA2E] text-white shadow-lg shadow-emerald-500/25 scale-[1.02]" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                  }`}
                >
                  <Icon size={13} className={isActive ? "stroke-[2.5]" : ""} />
                  {idx === 0 ? "1. Admin" : idx === 1 ? "2. Doctor" : "3. Patient"}
                </button>
              )
            })}
          </div>

          <div className="relative w-full lg:w-80">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Real-time lookup..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/85 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#67BA2E] tracking-wider transition-all"
            />
          </div>
        </div>

        {/* 5. Clean Grid Layout (Index + Focused Content Card Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-28" ref={activeCardRef}>
          
          {/* LEFT INDEX COLUMN (Desktop Vertical Navigation / Mobile Tactile Sliding Indicator) */}
          <aside className="lg:col-span-4 space-y-4">
            
            {/* Desktop Vertical Focused Indicator (Only showing the currently active item name instead of everything) */}
            <div className="hidden lg:block bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                  Active Protocol
                </h4>
                <span className="text-[10px] font-black text-[#67BA2E]">
                  0{activeSpecIndex + 1} / 0{totalSpecs}
                </span>
              </div>

              {activeSpec ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white text-[#67BA2E] shadow-sm rounded-xl">
                      {React.createElement(activeSpec.icon, { size: 16, className: "stroke-[2.5]" })}
                    </div>
                    <div className="truncate">
                      <p className="text-[9px] font-black text-[#67BA2E] uppercase tracking-[0.15em] leading-none mb-0.5">
                        {activeSpec.tag}
                      </p>
                      <p className="text-xs font-black text-slate-700 truncate max-w-[170px] tracking-wide">
                        {activeSpec.title.replace(/^\d+\.\s*/, "")}
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Linear Steps indicators for quick active checks */}
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {filteredSpecs.map((spec, index) => {
                      const isSectionActive = activeSpec?.id === spec.id
                      return (
                        <button
                          key={spec.id}
                          onClick={() => {
                            setActiveSectionId(spec.id)
                            setTimeout(scrollToHeading, 50)
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isSectionActive 
                              ? "w-8 bg-[#67BA2E]" 
                              : "w-2 bg-slate-200 hover:bg-slate-300"
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {/* MOBILE ONLY: Sliding Tactile Horizontal Indicator / Numbers Deck */}
            <div className="lg:hidden w-full flex flex-col gap-2.5 p-4.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                  Active Protocol Selector
                </span>
                <span className="text-[10px] font-black text-[#67BA2E]">
                  {activeSpecIndex + 1} / {totalSpecs}
                </span>
              </div>
              
              <div className="flex flex-row items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                {filteredSpecs.map((spec, index) => {
                  const isSectionActive = activeSpec?.id === spec.id
                  return (
                    <button
                      key={spec.id}
                      onClick={() => {
                        setActiveSectionId(spec.id)
                        setTimeout(scrollToHeading, 50)
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 border ${
                        isSectionActive 
                          ? "bg-[#67BA2E]/10 text-[#67BA2E] border-[#67BA2E]/30 shadow-sm" 
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <span>0{index + 1}.</span>
                      <span className="text-[10px] font-bold truncate max-w-[120px] tracking-wide">
                        {spec.title.replace(/^\d+\.\s*/, "")}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick status container */}
            <div className="bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded-[2rem] p-5.5 text-left space-y-2">
              <div className="flex items-center gap-2 text-[#67BA2E]">
                <Workflow size={14} className="animate-spin-slow" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Dynamic Sandbox View</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 leading-relaxed tracking-wide [word-spacing:0.04em]">
                Explore the EMR system layer specifications cleanly. Simply click any index to preview its architectural core flow instantly.
              </p>
            </div>
          </aside>

          {/* RIGHT DETAILS COLUMN (Renders ONLY the Single Selected/Active Protocol Specification Card) */}
          <main className="lg:col-span-8">
            
            <AnimatePresence mode="wait">
              {activeSpec ? (
                <motion.div
                  key={`${activeTab}-${activeSpec.id}`}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 150, damping: 18 }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] p-5 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Visual accent lines */}
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#67BA2E]" />
                  <div className="absolute top-0 right-0 w-44 h-44 bg-[#67BA2E]/5 rounded-full blur-3xl opacity-100 pointer-events-none" />

                  <div className="space-y-6 md:space-y-7">
                    {/* Header info bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] shadow-sm shrink-0">
                          {React.createElement(activeSpec.icon, { size: 16, className: "stroke-[2.5]" })}
                        </div>
                        <div>
                          <h3 className="text-sm md:text-lg font-black text-slate-900 tracking-tight leading-snug [word-spacing:0.12em] tracking-wide">
                            {activeSpec.title}
                          </h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                            {activeSpec.tag}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-bold text-slate-500 whitespace-nowrap tracking-wide">
                        {activeSpec.route}
                      </div>
                    </div>

                    {/* Operational Intent */}
                    <div className="bg-[#67BA2E]/5 border-l-4 border-l-[#67BA2E] p-4 md:p-5 rounded-r-2xl">
                      <p className="text-xs font-bold text-slate-700 leading-relaxed tracking-wide [word-spacing:0.06em]">
                        {activeSpec.intent}
                      </p>
                    </div>

                    {/* Architectural Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">
                        Architectural Breakdown:
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {activeSpec.breakdown.map((item, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5 hover:bg-slate-100/50 hover:border-slate-200 transition-all duration-200"
                          >
                            <div className="size-2 rounded-full bg-[#67BA2E] mt-1.5 shrink-0 shadow-[0_0_8px_#67BA2E]" />
                            <p className="text-xs font-semibold text-slate-600 leading-relaxed tracking-wide [word-spacing:0.06em]">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Real-World Advantage */}
                    {activeSpec.advantage && (
                      <div className="bg-blue-50/50 border border-blue-100 p-4.5 rounded-2xl flex items-start gap-3.5">
                        <div className="size-8 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                          <TrendingUp size={13} className="stroke-[2.5]" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed tracking-wide [word-spacing:0.06em]">
                          {activeSpec.advantage}
                        </p>
                      </div>
                    )}

                    {/* Dynamic slide step controls */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
                      <button
                        onClick={handlePrev}
                        disabled={activeSpecIndex === 0}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-[0.12em] transition-all active:scale-95 ${
                          activeSpecIndex === 0 
                            ? "text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed" 
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/50"
                        }`}
                      >
                        <ArrowLeft size={13} className="stroke-[3]" />
                        Back
                      </button>

                      <button
                        onClick={handleNext}
                        disabled={activeSpecIndex === totalSpecs - 1}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-[0.12em] transition-all active:scale-95 ${
                          activeSpecIndex === totalSpecs - 1 
                            ? "text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed" 
                            : "bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white shadow-md shadow-emerald-500/20"
                        }`}
                      >
                        Next
                        <ArrowRight size={13} className="stroke-[3]" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  No specifications matching &quot;{searchQuery}&quot; found in this phase.
                </div>
              )}
            </AnimatePresence>
          </main>

        </div>

        {/* 6. Footer specs verification */}
        <footer className="mt-24 border-t border-slate-200/80 pt-8 text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em]">
            <CheckCircle size={10.5} className="text-[#67BA2E]" />
            SyncMed EMR System Architecture Blueprint Verified
          </div>
          <p className="text-[9px] font-bold text-slate-400 max-w-xl mx-auto uppercase tracking-wide">
            Strict HIPAA-compliant secure engineering data parameters apply. All rights reserved.
          </p>
        </footer>

      </div>

      {/* Render the Master Ecosystem Portal Modal (Rendered inline inside page body for absolute 100% click & execution reliability) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] border border-slate-200"
            >
              {/* Decorative backdrop glow */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-[#67BA2E]/10 rounded-full blur-3xl opacity-80 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl opacity-80 pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-5 shrink-0 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#67BA2E]/10 rounded-full text-[10px] font-black uppercase text-[#67BA2E] tracking-wider mb-2">
                    <Sparkles size={11} />
                    Live Operational Blueprint
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight [word-spacing:0.06em]">
                    SYNC_MED MASTER ECOSYSTEM
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none mt-1">
                    The Complete Lifecycle Workflow
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-2xl transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
                >
                  <X size={15} className="stroke-[3]" />
                </button>
              </div>

              {/* Scrollable Steps Area */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-6 relative z-10">
                
                {/* Introductory statement */}
                <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-4.5 mb-6 text-left">
                  <p className="text-xs font-bold text-slate-600 leading-relaxed tracking-wide [word-spacing:0.04em]">
                    This is the comprehensive, end-to-end operational workflow of the SyncMed platform. It is engineered from the ground up to ensure that every stage—from new patient onboarding, payment clearance, clinical charting, to automated executive analytics—is fully seamless, secured, and deeply interlinked. Presenting this lifecycle demonstrates the true architectural power, financial integrity, and automated security of the ecosystem.
                  </p>
                </div>

                {/* Step list loop */}
                <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
                  {lifecycleSteps.map((stepItem, idx) => {
                    const IconComp = stepItem.icon
                    return (
                      <div key={idx} className="flex gap-4 relative group">
                        {/* Circle icon marker */}
                        <div className="size-12 rounded-2xl bg-white border-2 border-slate-200 text-slate-400 group-hover:border-[#67BA2E] group-hover:text-[#67BA2E] flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 relative z-10">
                          <IconComp size={16} className="stroke-[2.5]" />
                        </div>

                        <div className="space-y-3.5 pt-1 text-left flex-1">
                          <div>
                            <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest block mb-0.5">
                              {stepItem.step}
                            </span>
                            <h4 className="text-sm md:text-lg font-black text-slate-800 tracking-tight leading-snug">
                              {stepItem.title}
                            </h4>
                            <p className="text-[11px] font-bold text-slate-500 mt-1 leading-relaxed tracking-wide [word-spacing:0.03em]">
                              {stepItem.subtitle}
                            </p>
                          </div>

                          {/* Detail points */}
                          <div className="grid grid-cols-1 gap-2.5 pl-1">
                            {stepItem.details.map((detail, dIdx) => (
                              <div key={dIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <h5 className="text-[11px] font-extrabold text-[#67BA2E] tracking-wider uppercase mb-1">
                                  • {detail.label}
                               </h5>
                                <p className="text-xs font-semibold text-slate-600 leading-relaxed tracking-wide [word-spacing:0.04em]">
                                  {detail.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 pt-5 mt-4 flex items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <CheckCircle size={12} className="text-[#67BA2E]" />
                  Ecosystem Lifecycle Validated
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
                >
                  Acknowledge & Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

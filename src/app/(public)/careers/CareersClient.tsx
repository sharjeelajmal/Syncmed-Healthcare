"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Apple,
  Brain,
  Briefcase,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Sparkles,
  Stethoscope,
  Users,
  Activity,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CAREER_ROLES } from "@/lib/lead-types"
import { submitCareerApplicationAction } from "@/app/actions/lead.actions"

type CareerRole = (typeof CAREER_ROLES)[number]

const POSITIONS: { role: CareerRole; icon: LucideIcon; type: string; summary: string }[] = [
  {
    role: "Doctor",
    icon: Stethoscope,
    type: "Full-time · Part-time",
    summary: "Lead concierge consultations, review nurse assessments and own each member's care plan.",
  },
  {
    role: "Registered Nurse",
    icon: HeartPulse,
    type: "Full-time · Home visits",
    summary: "Deliver in-home assessments, vitals monitoring and medication reviews for our members.",
  },
  {
    role: "Physiotherapist",
    icon: Activity,
    type: "Part-time · Contract",
    summary: "Design mobility, fall-prevention and rehabilitation programmes delivered at home.",
  },
  {
    role: "Dietitian",
    icon: Apple,
    type: "Part-time · Contract",
    summary: "Build personalised nutrition plans for chronic-condition and longevity members.",
  },
  {
    role: "Psychologist",
    icon: Brain,
    type: "Part-time · Contract",
    summary: "Provide cognitive and emotional wellbeing support alongside the clinical team.",
  },
  {
    role: "General Clinical Staff",
    icon: Users,
    type: "Full-time",
    summary: "Care coordination, patient intake and clinical operations across our network.",
  },
]

const PERKS = [
  "Flexible scheduling built around home visits",
  "Modern digital charting — no paper",
  "Small caseloads, meaningful patient time",
  "Collaborative doctor–nurse care teams",
]

const INPUT_CLASS =
  "w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] rounded-xl h-12 px-4 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
const LABEL_CLASS = "text-xs font-bold text-slate-600 uppercase tracking-widest block"
// Same Select styling as the admin forms; z-index keeps the list above the dialog.
const SELECT_TRIGGER_CLASS =
  "w-full h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 font-bold text-slate-700 focus:ring-[#67BA2E]"
const SELECT_CONTENT_CLASS = "z-[9999] rounded-xl border-slate-100 bg-white shadow-2xl"
const SELECT_ITEM_CLASS = "cursor-pointer py-3 font-bold text-slate-700 focus:bg-emerald-50 focus:text-[#4A8A1C]"

const EXPERIENCE_OPTIONS = ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"]

export function CareersClient() {
  const [applyRole, setApplyRole] = React.useState<CareerRole | null>(null)

  return (
    <div className="max-w-6xl mx-auto w-full space-y-16">
      {/* Hero */}
      <section className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-[#67BA2E] text-[10px] font-black uppercase tracking-wider">
          <Sparkles size={12} />
          We&apos;re Hiring
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
          Build the future of <span className="text-[#67BA2E]">concierge care</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
          SyncMed brings doctors, nurses and allied health professionals together to deliver
          personal, home-based healthcare. Join a team that puts time with patients first.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {PERKS.map((perk) => (
            <span
              key={perk}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
            >
              <CheckCircle2 className="size-3.5 text-[#67BA2E]" />
              {perk}
            </span>
          ))}
        </div>
      </section>

      {/* Open positions */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Open Positions</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">{POSITIONS.length} roles across our clinical team</p>
          </div>
          <Briefcase className="size-8 text-[#67BA2E]/30 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {POSITIONS.map(({ role, icon: Icon, type, summary }, index) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-100/60 hover:border-[#67BA2E]/40 transition-all"
            >
              <div className="size-12 rounded-xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] group-hover:bg-[#67BA2E] group-hover:text-white transition-colors">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-800 tracking-tight">{role}</h3>
              <p className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest mt-1">{type}</p>
              <p className="text-sm text-slate-500 font-medium mt-3 flex-1">{summary}</p>
              <Button
                onClick={() => setApplyRole(role)}
                className="mt-5 h-11 w-full rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black text-xs uppercase tracking-wider gap-2"
              >
                Apply Now
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* General application */}
      <section className="rounded-3xl bg-gradient-to-br from-[#67BA2E] to-[#4A8A1C] p-8 md:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Don&apos;t see your role?</h2>
          <p className="text-white/80 font-medium mt-2 max-w-xl">
            We&apos;re always glad to hear from talented clinicians. Send a general application and we&apos;ll
            reach out when a fitting role opens.
          </p>
        </div>
        <Button
          onClick={() => setApplyRole("General Clinical Staff")}
          className="h-12 px-8 rounded-xl bg-white text-[#4A8A1C] hover:bg-white/90 font-black text-xs uppercase tracking-wider shrink-0"
        >
          Send Application
        </Button>
      </section>

      <ApplicationDialog role={applyRole} onClose={() => setApplyRole(null)} />
    </div>
  )
}

function ApplicationDialog({ role, onClose }: { role: CareerRole | null; onClose: () => void }) {
  const [isPending, startTransition] = React.useTransition()
  const [selectedRole, setSelectedRole] = React.useState<CareerRole>("Doctor")
  const [experience, setExperience] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  // Sync the picker with the card that opened the dialog.
  const [lastRole, setLastRole] = React.useState<CareerRole | null>(null)
  if (role !== lastRole) {
    setLastRole(role)
    if (role) {
      setSelectedRole(role)
      setExperience("")
      setSubmitted(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set("role", selectedRole)

    if (!experience) {
      toast.error("Please select your years of experience.")
      return
    }
    formData.set("experience", experience)

    const cv = formData.get("cv")
    const hasCv = cv instanceof File && cv.size > 0
    if (hasCv && (cv as File).size > 5 * 1024 * 1024) {
      toast.error("CV must be 5 MB or smaller.")
      return
    }
    if (!hasCv && !String(formData.get("note") ?? "").trim()) {
      toast.error("Please attach your CV or describe your background.")
      return
    }

    startTransition(async () => {
      const res = await submitCareerApplicationAction(formData)
      if (res.success) {
        setSubmitted(true)
        setExperience("")
        form.reset()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={role !== null} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent
        className="w-[calc(100%-1rem)] sm:max-w-[600px] max-h-[92dvh] overflow-y-auto rounded-2xl"
        closeButtonClassName="top-4 right-4 size-8 sm:top-6 sm:right-6 sm:size-9"
      >
        {submitted ? (
          <div className="py-8 px-6 sm:px-10 text-center space-y-4">
            <div className="size-16 rounded-full bg-[#67BA2E]/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8 text-[#67BA2E]" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-800">Application received</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Thank you for applying for {selectedRole}. We&apos;ve emailed you a confirmation and our team will
              be in touch.
            </DialogDescription>
            <Button onClick={onClose} className="h-11 px-8 rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Right padding keeps the title and description clear of the close button. */}
            <DialogHeader className="pr-10 sm:pr-12 text-left">
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Apply to SyncMed</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Tell us about yourself. Attach a PDF CV or describe your background.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Honeypot for bots; hidden from people and screen readers. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="career-role" className={LABEL_CLASS}>Role</label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as CareerRole)}>
                  <SelectTrigger id="career-role" className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className={SELECT_CONTENT_CLASS}>
                    {CAREER_ROLES.map((r) => (
                      <SelectItem key={r} value={r} className={SELECT_ITEM_CLASS}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="career-name" className={LABEL_CLASS}>Full Name</label>
                <input id="career-name" name="name" required maxLength={100} className={INPUT_CLASS} />
              </div>

              <div className="space-y-2">
                <label htmlFor="career-email" className={LABEL_CLASS}>Email</label>
                <input id="career-email" name="email" type="email" required className={INPUT_CLASS} />
              </div>

              <div className="space-y-2">
                <label htmlFor="career-phone" className={LABEL_CLASS}>Phone</label>
                <input id="career-phone" name="phone" type="tel" required maxLength={20} className={INPUT_CLASS} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="career-experience" className={LABEL_CLASS}>Years of Experience</label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger id="career-experience" className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent className={SELECT_CONTENT_CLASS}>
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className={SELECT_ITEM_CLASS}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="career-cv" className={LABEL_CLASS}>
                  CV / Resume <span className="text-[10px] text-slate-400 normal-case italic">(PDF, max 5 MB)</span>
                </label>
                <input
                  id="career-cv"
                  name="cv"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#67BA2E]/10 file:px-4 file:py-2 file:text-xs file:font-black file:text-[#67BA2E] hover:file:bg-[#67BA2E]/20"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="career-note" className={LABEL_CLASS}>
                  About You <span className="text-[10px] text-slate-400 normal-case italic">(required if no CV)</span>
                </label>
                <textarea
                  id="career-note"
                  name="note"
                  maxLength={1500}
                  rows={4}
                  placeholder="Licences, specialties, availability..."
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] rounded-xl p-4 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="sm:col-span-2 h-12 rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black uppercase tracking-wider text-xs gap-2"
              >
                {isPending ? <Loader2 className="size-5 animate-spin" /> : <>Submit Application <ArrowRight className="size-4" /></>}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

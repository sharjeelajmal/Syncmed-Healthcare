"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Activity, 
  Thermometer, 
  Scale, 
  Heart, 
  ClipboardList, 
  Save, 
  Loader2,
  Stethoscope
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createAssessmentAction } from "@/app/actions/assessment.actions"
import { SignatureModal } from "@/components/ui/signature-modal"

interface AssessmentFormProps {
  patientId: string
  providerId: string
}

export function AssessmentForm({ patientId, providerId }: AssessmentFormProps) {
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const [isSignatureModalOpen, setIsSignatureModalOpen] = React.useState(false)
  const [signature, setSignature] = React.useState<string | undefined>(undefined)
  const [formData, setFormData] = React.useState<any>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    
    // Capture form data
    const data = {
      vitals: {
        bloodPressure: form.get("bloodPressure"),
        heartRate: form.get("heartRate"),
        temperature: form.get("temperature"),
        weight: form.get("weight"),
      },
      notes: {
        chiefComplaint: form.get("chiefComplaint"),
        diagnosis: form.get("diagnosis"),
        treatmentPlan: form.get("treatmentPlan"),
      }
    }

    setFormData(data)
    setIsSignatureModalOpen(true) // Open signature modal first
  }

  const handleFinalSubmit = (capturedSignature: string) => {
    setSignature(capturedSignature)
    setIsSignatureModalOpen(false)

    startTransition(async () => {
      const res = await createAssessmentAction(patientId, providerId, formData, capturedSignature)
      if (res?.error) {
        toast.error(res.error)
      }
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Section 1: Vitals */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Activity className="size-5 text-[#67BA2E]" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Biometric Vitals</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Pressure</Label>
              <div className="relative">
                <Input 
                  name="bloodPressure" 
                  placeholder="120/80" 
                  required
                  className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-bold text-slate-700 pl-10" 
                />
                <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heart Rate (BPM)</Label>
              <div className="relative">
                <Input 
                  name="heartRate" 
                  placeholder="72" 
                  required
                  className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-bold text-slate-700 pl-10" 
                />
                <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temp (°F)</Label>
              <div className="relative">
                <Input 
                  name="temperature" 
                  placeholder="98.6" 
                  required
                  className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-bold text-slate-700 pl-10" 
                />
                <Thermometer className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (LBS)</Label>
              <div className="relative">
                <Input 
                  name="weight" 
                  placeholder="150" 
                  required
                  className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-bold text-slate-700 pl-10" 
                />
                <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Notes */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ClipboardList className="size-5 text-[#67BA2E]" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clinical Documentation</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chief Complaint</Label>
              <Textarea 
                name="chiefComplaint"
                placeholder="Primary reason for patient encounter..."
                required
                className="min-h-[100px] rounded-2xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-medium text-slate-700 p-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diagnosis & Observations</Label>
              <Textarea 
                name="diagnosis"
                placeholder="Clinical findings and diagnosis..."
                required
                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-medium text-slate-700 p-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Treatment Plan</Label>
              <Textarea 
                name="treatmentPlan"
                placeholder="Recommended actions, prescriptions, and follow-up..."
                required
                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-medium text-slate-700 p-4"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <Button 
            type="submit" 
            disabled={isPending}
            className="h-12 w-full md:w-auto px-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <Save className="size-5" />
                Complete Assessment & Save
              </>
            )}
          </Button>
        </div>
      </form>

      <SignatureModal 
        isOpen={isSignatureModalOpen} 
        onClose={() => setIsSignatureModalOpen(false)} 
        onSave={handleFinalSubmit}
      />
    </>
  )
}

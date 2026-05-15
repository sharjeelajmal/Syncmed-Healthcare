"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import SignatureCanvas from "react-signature-canvas"
import { toast } from "sonner"
import { Eraser, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { saveSignatureAction } from "@/app/actions/signature.actions"

interface SignaturePadClientProps {
  assessmentId: string
  patientId: string
}

export function SignaturePadClient({ assessmentId, patientId }: SignaturePadClientProps) {
  const sigCanvas = React.useRef<SignatureCanvas>(null)
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const clear = () => {
    sigCanvas.current?.clear()
  }

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Signature pad is empty. Please provide a signature.")
      return
    }

    const signatureBase64 = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png")

    if (!signatureBase64) return

    startTransition(async () => {
      const res = await saveSignatureAction(assessmentId, patientId, signatureBase64)
      if (res.success) {
        toast.success("Electronic signature captured and verified.")
        router.push(`/provider/patients/${patientId}`)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to finalize signature.")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Signature Area */}
      <div className="relative border-2 border-slate-300 rounded-3xl bg-white w-full h-[300px] overflow-hidden shadow-inner touch-none">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="#0F172A"
          canvasProps={{
            className: "w-full h-full cursor-crosshair",
            width: 800, // Fixed width for better resolution
            height: 300
          }}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sign within this boundary</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={clear}
          disabled={isPending}
          className="h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 rounded-xl"
        >
          <Eraser className="size-4" />
          Clear Signature
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black transition-all gap-2 rounded-xl shadow-lg shadow-emerald-100"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Submit Legal Signature
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

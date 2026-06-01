"use client"

import * as React from "react"
import SignatureCanvas from "react-signature-canvas"
import { 
  FileSignature, 
  Eraser, 
  CheckCircle2, 
  X, 
  ShieldCheck,
  AlertCircle
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (signatureBase64: string) => void
}

export function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
  const sigCanvas = React.useRef<SignatureCanvas>(null)
  const canvasContainerRef = React.useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = React.useState(536)
  const canvasHeight = 250

  // Fix for offset bug: clear and resize canvas when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (sigCanvas.current) {
          sigCanvas.current.clear()
        }
      }, 100)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) return

    const updateCanvasSize = () => {
      if (!canvasContainerRef.current) return
      const width = Math.floor(canvasContainerRef.current.clientWidth)
      if (width > 0) setCanvasWidth(width)
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [isOpen])

  const handleClear = () => {
    sigCanvas.current?.clear()
  }

  const handleConfirm = () => {
    if (sigCanvas.current?.isEmpty()) {
      return
    }
    const signatureBase64 = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png")
    if (signatureBase64) {
      onSave(signatureBase64)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-slate-200 p-0 overflow-hidden shadow-2xl" showCloseButton={false}>
        <div className="bg-[#67BA2E] p-8 text-white relative">
           <button 
            onClick={onClose}
            className="absolute top-6 right-6 size-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
           >
             <X className="size-4" />
           </button>
           <DialogHeader>
             <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <FileSignature className="size-7" />
                </div>
                <div className="flex flex-col">
                   <DialogTitle className="text-2xl font-black tracking-tight text-white">Patient Consent</DialogTitle>
                   <DialogDescription className="text-white/80 font-medium text-xs">Acknowledge encounter & treatment plan</DialogDescription>
                </div>
             </div>
           </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-500 text-sm leading-relaxed text-center font-medium">
             &quot;I acknowledge that the information provided in today&apos;s clinical encounter is accurate and I consent to the treatment plan.&quot;
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature Pad</span>
               <div className="flex items-center gap-1 text-[#67BA2E]">
                  <ShieldCheck className="size-3" />
                  <span className="text-[10px] font-bold">Secure Gateway</span>
               </div>
            </div>
            
            <div
              ref={canvasContainerRef}
              className="border-2 border-slate-200 rounded-2xl bg-white w-full h-[250px] overflow-hidden shadow-inner touch-none relative cursor-crosshair"
            >
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#0F172A"
                canvasProps={{
                  className: "w-full h-full",
                  width: canvasWidth,
                  height: canvasHeight,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                 <p className="text-4xl font-black uppercase tracking-[0.5em] text-slate-900 rotate-[-15deg]">Electronic Sign-Off</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 rounded-xl"
                >
                  <Eraser className="size-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black transition-all gap-2 rounded-xl shadow-lg shadow-emerald-100"
                >
                  <CheckCircle2 className="size-4" />
                  Confirm Signature
                </Button>
             </div>
             <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <AlertCircle className="size-3 text-amber-600" />
                <p className="text-[9px] text-amber-700 font-bold uppercase tracking-wider">Legal equivalent of a manual signature</p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

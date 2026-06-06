"use client"

import * as React from "react"
import { Upload, FileText, CheckCircle2, Loader2, Banknote, CloudUpload } from "lucide-react"
import { useDropzone } from "react-dropzone"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { uploadReceiptAction } from "@/app/actions/billing.actions"
import { toast } from "sonner"
import { formatNaira } from "@/lib/currency"

interface ReceiptUploadModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  amountToPay: number
}

export function ReceiptUploadModal({
  isOpen,
  onClose,
  appointmentId,
  amountToPay,
}: ReceiptUploadModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': []
    },
    multiple: false
  })

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!file) {
      toast.error("Please select a file to upload")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadReceiptAction(appointmentId, formData)
      
      if (result.success) {
        toast.success("Receipt uploaded to cloud successfully!")
        router.refresh()
        onClose()
        setFile(null)
        setPreview(null)
      } else {
        toast.error(result.error || "Failed to upload receipt")
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong during upload")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-0 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
                <CloudUpload className="size-5 text-[#67BA2E]" />
             </div>
             Upload Receipt
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-xs">
            Drag and drop or browse your payment proof.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Premium Bank Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Payment Gateway</span>
              <div className="size-2 w-2 rounded-full bg-[#67BA2E] animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-y-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bank Name</span>
                <span className="text-xs font-bold text-slate-700">Chase Premium Banking</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Title</span>
                <span className="text-xs font-bold text-slate-700">SyncMed Concierge Care</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Routing Number</span>
                <span className="text-xs font-bold text-slate-700">021000021</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Number</span>
                <span className="text-xs font-bold text-slate-700">9988776655</span>
              </div>
            </div>
            <div className="pt-2">
               <p className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 rounded-lg p-2 text-center leading-relaxed">
                 Please transfer exactly <span className="text-[#67BA2E] font-black">{formatNaira(amountToPay)}</span> to the account above and upload the confirmation receipt.
               </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</span>
              <span className="text-2xl font-black text-[#67BA2E] tracking-tighter">
                {formatNaira(amountToPay)}
              </span>
            </div>
            <div className="size-10 rounded-xl bg-[#67BA2E] flex items-center justify-center text-white shadow-lg shadow-emerald-100">
               <Banknote className="size-5" />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receipt Document</Label>
            <div 
              {...getRootProps()} 
              className={`
                flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all group
                ${isDragActive ? 'border-[#67BA2E] bg-[#67BA2E]/5' : 'border-slate-200 hover:border-[#67BA2E]/40 hover:bg-slate-50/50'}
              `}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="size-8 text-[#67BA2E]" />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click or drag to change</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#67BA2E] group-hover:bg-[#67BA2E]/10 transition-all">
                    <CloudUpload className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {isDragActive ? 'Drop it here!' : 'Drag & drop or click to browse'}
                  </span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">PDF or Image (Max 5MB)</span>
                </div>
              )}
            </div>
          </div>

          {preview && (
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner max-h-32">
               <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0 flex flex-row gap-3 bg-transparent border-t-0 m-0 shadow-none">
          <Button
            variant="outline"
            onClick={onClose}
            className="md:flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest text-[9px] px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="md:flex-1 h-11 rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest text-[9px] gap-2 border-0 px-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Submit Receipt
                <Upload className="size-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

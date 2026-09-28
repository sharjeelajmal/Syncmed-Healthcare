"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { FileText, FlaskConical, Loader2, Upload, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { uploadLabResultAction } from "@/app/actions/chart.actions"

const MAX_FILE_BYTES = 9 * 1024 * 1024
const FIELD_LABEL = "text-[10px] font-black text-slate-400 uppercase tracking-widest"

export interface LabResultView {
  id: string
  title: string
  fileUrl: string
  notes: string | null
  createdAt: string
  uploadedByName: string
}

export function LabResultsPanel({ patientId, labResults }: { patientId: string; labResults: LabResultView[] }) {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <UploadLabResultDialog patientId={patientId} />
      </div>

      {labResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FlaskConical className="size-10 text-slate-200 mb-3" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No lab results uploaded.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {labResults.map((lab) => (
            <li key={lab.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="size-9 shrink-0 rounded-lg bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-800 text-sm break-words">{lab.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {format(new Date(lab.createdAt), DISPLAY_DATE_TIME_FORMAT)} · {lab.uploadedByName}
                </p>
                {lab.notes ? (
                  <p className="text-xs font-medium text-slate-600 mt-1 whitespace-pre-wrap break-words">{lab.notes}</p>
                ) : null}
              </div>
              <a
                href={lab.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#67BA2E]/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#67BA2E] hover:bg-[#67BA2E]/10"
              >
                <ExternalLink className="size-3" />
                Open PDF
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function UploadLabResultDialog({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [title, setTitle] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setTitle("")
      setNotes("")
      setFile(null)
    }
    setOpen(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Title is required.")
      return
    }
    if (!file) {
      toast.error("Please choose a PDF file.")
      return
    }
    if (file.type && file.type !== "application/pdf") {
      toast.error("Only PDF files can be uploaded.")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("PDF must be 9 MB or smaller.")
      return
    }

    const formData = new FormData()
    formData.set("patientId", patientId)
    formData.set("title", title)
    formData.set("notes", notes)
    formData.set("file", file)

    startTransition(async () => {
      const res = await uploadLabResultAction(formData)
      if (res.success) {
        toast.success("Lab result uploaded.")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-lg font-black text-[10px] uppercase tracking-wider gap-2">
          <Upload className="size-3.5" />
          Upload Lab Result
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Upload Lab Result</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">PDF only, up to 9 MB.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="lab-title" className={FIELD_LABEL}>Title *</Label>
            <Input id="lab-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CBC Panel" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lab-file" className={FIELD_LABEL}>PDF File *</Label>
            <Input
              id="lab-file"
              type="file"
              accept="application/pdf,.pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lab-notes" className={FIELD_LABEL}>Notes</Label>
            <Textarea id="lab-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20 rounded-xl" />
          </div>
          <Button type="submit" disabled={isPending} className="h-12 w-full bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl">
            {isPending ? <Loader2 className="size-5 animate-spin" /> : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

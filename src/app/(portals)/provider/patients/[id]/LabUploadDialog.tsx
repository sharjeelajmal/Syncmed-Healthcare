"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useDropzone, type FileRejection } from "react-dropzone"
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "framer-motion"
import { CheckCircle2, CloudUpload, FileText, Loader2, ShieldCheck, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import type { LabResultView } from "@/lib/lab-results"
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

const MAX_FILE_BYTES = 9 * 1024 * 1024
const FIELD_LABEL = "text-[10px] font-black text-slate-400 uppercase tracking-widest"
const BRAND = "#67BA2E"

/**
 * uploading  – bytes travelling to our server (real % from XHR)
 * processing – server is storing the PDF on Cloudinary and saving the record
 */
type Stage = "idle" | "uploading" | "processing" | "done"

type UploadResponse = { success: true; lab: LabResultView } | { success: false; error: string }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** POSTs the form with XMLHttpRequest, which (unlike fetch) reports upload progress. */
function uploadWithProgress(
  formData: FormData,
  handlers: { onProgress: (loaded: number, total: number) => void; onSent: () => void },
  xhrRef: React.MutableRefObject<XMLHttpRequest | null>
): Promise<UploadResponse | "aborted"> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr
    xhr.open("POST", "/api/lab-results")
    xhr.responseType = "json"
    xhr.upload.onprogress = (e) => e.lengthComputable && handlers.onProgress(e.loaded, e.total)
    xhr.upload.onload = handlers.onSent
    xhr.onload = () => {
      const body = xhr.response as UploadResponse | null
      resolve(body && typeof body === "object" ? body : { success: false, error: "Unexpected server response." })
    }
    xhr.onerror = () => resolve({ success: false, error: "Network error. Check your connection and try again." })
    xhr.onabort = () => resolve("aborted")
    xhr.send(formData)
  })
}

export function LabUploadDialog({
  patientId,
  onUploaded,
}: {
  patientId: string
  onUploaded: (lab: LabResultView) => void
}) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const xhrRef = React.useRef<XMLHttpRequest | null>(null)

  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [dropError, setDropError] = React.useState<string | null>(null)
  // Shakes the drop zone on a rejected file without remounting it.
  const [shakeScope, animateShake] = useAnimate()
  const [stage, setStage] = React.useState<Stage>("idle")
  const [progress, setProgress] = React.useState({ loaded: 0, total: 0 })

  const busy = stage === "uploading" || stage === "processing"
  const percent = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0

  const reset = () => {
    setTitle("")
    setNotes("")
    setFile(null)
    setDropError(null)
    setStage("idle")
    setProgress({ loaded: 0, total: 0 })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && busy) return // cancel explicitly while uploading
    if (next) reset()
    setOpen(next)
  }

  const shake = React.useCallback(() => {
    if (!reduceMotion && shakeScope.current) {
      void animateShake(shakeScope.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 })
    }
  }, [animateShake, reduceMotion, shakeScope])

  const onDrop = React.useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      const code = rejected[0].errors[0]?.code
      setDropError(
        code === "file-too-large"
          ? `That file is ${formatBytes(rejected[0].file.size)}. PDFs must be 9 MB or smaller.`
          : code === "too-many-files"
            ? "Please drop one PDF at a time."
            : "Only PDF files can be uploaded."
      )
      shake()
      return
    }
    if (accepted[0]) {
      setDropError(null)
      setFile(accepted[0])
      // Pre-fill the title from the file name when it's still empty.
      setTitle((current) => current || accepted[0].name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim())
    }
  }, [shake])

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_FILE_BYTES,
    maxFiles: 1,
    multiple: false,
    noClick: Boolean(file),
    noKeyboard: Boolean(file),
    disabled: busy,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Title is required.")
      return
    }
    if (!file) {
      setDropError("Please choose a PDF file.")
      shake()
      return
    }

    const formData = new FormData()
    formData.set("patientId", patientId)
    formData.set("title", title)
    formData.set("notes", notes)
    formData.set("file", file)

    setStage("uploading")
    setProgress({ loaded: 0, total: file.size })
    const result = await uploadWithProgress(
      formData,
      {
        onProgress: (loaded, total) => setProgress({ loaded, total }),
        onSent: () => setStage("processing"),
      },
      xhrRef
    )
    xhrRef.current = null

    if (result === "aborted") {
      setStage("idle")
      toast("Upload cancelled.")
      return
    }
    if (!result.success) {
      setStage("idle")
      toast.error(result.error)
      return
    }

    setStage("done")
    onUploaded(result.lab)
    router.refresh()
    toast.success("Lab result uploaded.")
    // Let the success state register before closing.
    window.setTimeout(() => setOpen(false), 900)
  }

  const cancelUpload = () => xhrRef.current?.abort()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-lg font-black text-[10px] uppercase tracking-wider gap-2">
          <Upload className="size-3.5" />
          Upload Lab Result
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[calc(100%-1rem)] sm:max-w-[540px] max-h-[92dvh] overflow-y-auto rounded-2xl"
        closeButtonClassName={cn(
          "top-4 right-4 size-8 sm:top-6 sm:right-6 sm:size-9",
          // Closing is blocked mid-upload ("Cancel Upload" instead), so show it as disabled.
          busy && "pointer-events-none opacity-40"
        )}
      >
        <DialogHeader className="pr-10 sm:pr-12 text-left">
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Upload Lab Result</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Attach the lab report PDF. It is stored securely and only visible to the care team and the patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drop zone / selected file */}
          <div className="space-y-2">
            <span className={FIELD_LABEL}>PDF File *</span>
            {/* Always mounted so "Choose a different file" can open the picker. */}
            <input {...getInputProps()} />
            <div ref={shakeScope}>
              <AnimatePresence mode="wait" initial={false}>
                {!file ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div
                      {...getRootProps({
                        "aria-label": "Upload PDF: drag and drop or press Enter to browse",
                      })}
                      className={cn(
                        "relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-9 text-center outline-none transition-all duration-200",
                        "focus-visible:ring-2 focus-visible:ring-[#67BA2E]/40",
                        isDragActive
                          ? "scale-[1.01] border-[#67BA2E] bg-emerald-50/80"
                          : dropError
                            ? "border-red-300 bg-red-50/40 hover:border-red-400"
                            : "border-slate-200 bg-slate-50/60 hover:border-[#67BA2E]/60 hover:bg-emerald-50/40"
                      )}
                    >
                      <motion.div
                        animate={
                          reduceMotion
                            ? undefined
                            : isDragActive
                              ? { y: -6, scale: 1.12 }
                              : { y: [0, -4, 0], scale: 1 }
                        }
                        transition={
                          isDragActive
                            ? { type: "spring", stiffness: 400, damping: 18 }
                            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                        }
                        className={cn(
                          "flex size-14 items-center justify-center rounded-2xl transition-colors duration-200",
                          isDragActive ? "bg-[#67BA2E] text-white shadow-lg shadow-emerald-200" : "bg-[#67BA2E]/10 text-[#67BA2E]"
                        )}
                      >
                        <CloudUpload className="size-7" />
                      </motion.div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-700">
                          {isDragActive ? "Drop to attach" : "Drag & drop your PDF here"}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          or <span className="font-bold text-[#67BA2E] underline-offset-2 hover:underline">browse files</span>
                          {" "}· PDF up to 9 MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={cn(
                      "overflow-hidden rounded-2xl border p-4 transition-colors duration-300",
                      stage === "done" ? "border-[#67BA2E]/50 bg-emerald-50/70" : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <FileText className="size-5" />
                        <span className="absolute -bottom-1 rounded bg-red-500 px-1 text-[8px] font-black leading-tight text-white">PDF</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800" title={file.name}>{file.name}</p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {stage === "uploading"
                            ? `${formatBytes(progress.loaded)} of ${formatBytes(progress.total)}`
                            : formatBytes(file.size)}
                        </p>
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        {stage === "done" ? (
                          <motion.span
                            key="done"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="text-[#67BA2E]"
                          >
                            <CheckCircle2 className="size-6" />
                          </motion.span>
                        ) : stage === "idle" ? (
                          <motion.div key="remove" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setFile(null)}
                              aria-label="Remove file"
                              className="size-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <X className="size-4" />
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.span
                            key="pct"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs font-black tabular-nums text-[#67BA2E]"
                          >
                            {stage === "uploading" ? `${percent}%` : <Loader2 className="size-4 animate-spin" />}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Progress */}
                    <AnimatePresence initial={false}>
                      {stage !== "idle" ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2 pt-3"
                        >
                          <div
                            role="progressbar"
                            aria-label="Upload progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={stage === "uploading" ? percent : stage === "done" ? 100 : undefined}
                            className="relative h-2 overflow-hidden rounded-full bg-slate-100"
                          >
                            {stage === "processing" && !reduceMotion ? (
                              // Indeterminate: the file has arrived, the server is storing it.
                              <motion.div
                                className="absolute inset-y-0 w-1/3 rounded-full"
                                style={{ background: `linear-gradient(90deg, transparent, ${BRAND}, transparent)` }}
                                initial={{ x: "-100%" }}
                                animate={{ x: "300%" }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                              />
                            ) : (
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#8fd35a] to-[#67BA2E]"
                                initial={{ width: 0 }}
                                animate={{ width: `${stage === "uploading" ? percent : 100}%` }}
                                transition={{ type: "spring", stiffness: 120, damping: 24 }}
                              />
                            )}
                          </div>
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            {stage === "uploading" ? (
                              <>Uploading…</>
                            ) : stage === "processing" ? (
                              <>
                                <ShieldCheck className="size-3.5 text-[#67BA2E]" />
                                Securing file and saving to the chart…
                              </>
                            ) : (
                              <span className="text-[#67BA2E]">Uploaded successfully</span>
                            )}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {dropError ? (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  role="alert"
                  className="text-xs font-bold text-red-500"
                >
                  {dropError}
                </motion.p>
              ) : null}
            </AnimatePresence>

            {file && stage === "idle" ? (
              <button
                type="button"
                onClick={openFilePicker}
                className="text-xs font-bold text-[#67BA2E] underline-offset-2 hover:underline"
              >
                Choose a different file
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lab-title" className={FIELD_LABEL}>Title *</Label>
            <Input
              id="lab-title"
              required
              maxLength={200}
              disabled={busy || stage === "done"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CBC Panel"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lab-notes" className={FIELD_LABEL}>Notes</Label>
            <Textarea
              id="lab-notes"
              disabled={busy || stage === "done"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="min-h-20 rounded-xl"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {stage === "uploading" ? (
              <Button type="button" variant="outline" onClick={cancelUpload} className="h-12 w-full rounded-xl font-bold sm:w-auto sm:flex-1">
                Cancel Upload
              </Button>
            ) : null}
            <Button
              type="submit"
              disabled={busy || stage === "done"}
              className="h-12 w-full rounded-xl bg-[#67BA2E] font-black text-white hover:bg-[#5aa827] disabled:opacity-80 sm:w-auto sm:flex-1"
            >
              {stage === "uploading" ? (
                <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Uploading {percent}%</span>
              ) : stage === "processing" ? (
                <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Saving…</span>
              ) : stage === "done" ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4" />Uploaded</span>
              ) : (
                <span className="flex items-center gap-2"><Upload className="size-4" />Upload PDF</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

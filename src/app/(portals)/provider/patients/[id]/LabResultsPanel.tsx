"use client"

import * as React from "react"
import { format } from "date-fns"
import { FileText, FlaskConical, Loader2, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteLabResultAction } from "@/app/actions/chart.actions"
import type { LabResultView } from "@/lib/lab-results"
import { LabUploadDialog } from "./LabUploadDialog"

export function LabResultsPanel({ patientId, labResults }: { patientId: string; labResults: LabResultView[] }) {
  // Uploads/deletes show immediately; the server re-render (slow on a cold DB
  // connection) then catches up and replaces these local changes.
  const [added, setAdded] = React.useState<LabResultView[]>([])
  const [removedIds, setRemovedIds] = React.useState<ReadonlySet<string>>(new Set())
  const [newestId, setNewestId] = React.useState<string | null>(null)

  const visible = React.useMemo(() => {
    const serverIds = new Set(labResults.map((l) => l.id))
    return [...added.filter((l) => !serverIds.has(l.id)), ...labResults].filter((l) => !removedIds.has(l.id))
  }, [added, labResults, removedIds])

  const handleUploaded = (lab: LabResultView) => {
    setAdded((prev) => [lab, ...prev])
    setNewestId(lab.id)
  }

  const handleDeleted = (id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id))
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <LabUploadDialog patientId={patientId} onUploaded={handleUploaded} />
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FlaskConical className="size-10 text-slate-200 mb-3" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No lab results uploaded.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((lab) => (
            <LabResultRow key={lab.id} lab={lab} isNew={lab.id === newestId} onDeleted={handleDeleted} />
          ))}
        </ul>
      )}
    </div>
  )
}

function LabResultRow({
  lab,
  isNew,
  onDeleted,
}: {
  lab: LabResultView
  isNew: boolean
  onDeleted: (id: string) => void
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [isDeleting, startDelete] = React.useTransition()

  const handleDelete = () => {
    startDelete(async () => {
      const res = await deleteLabResultAction(lab.id)
      if (res.success) {
        setConfirmOpen(false)
        onDeleted(lab.id)
        toast.success("Lab result deleted.")
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <li
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-3 rounded-xl border p-3 transition-colors duration-700",
        isNew
          ? "border-[#67BA2E]/40 bg-emerald-50/60 animate-in fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none"
          : "border-slate-100 bg-slate-50/60"
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
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
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
        <a
          href={lab.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#67BA2E]/30 px-3 text-[10px] font-black uppercase tracking-wider text-[#67BA2E] transition-colors hover:bg-[#67BA2E]/10"
        >
          <ExternalLink className="size-3" />
          Open PDF
        </a>
        {lab.canDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            aria-label={`Delete ${lab.title}`}
            className="size-8 rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </Button>
        ) : null}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !isDeleting && setConfirmOpen(open)}>
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black text-slate-900">Delete lab result?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">
              <strong className="text-slate-700">{lab.title}</strong> and its PDF will be permanently removed from
              this patient&apos;s chart. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel disabled={isDeleting} className="h-11 flex-1 rounded-xl font-bold">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-11 flex-1 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}

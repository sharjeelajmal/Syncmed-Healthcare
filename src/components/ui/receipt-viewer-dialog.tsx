"use client"

import { ExternalLink, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/** Read-only viewer for an uploaded payment receipt (image or PDF). */
export function ReceiptViewerDialog({ url, onClose }: { url: string | null; onClose: () => void }) {
  const isPdf = url?.toLowerCase().split("?")[0].endsWith(".pdf")

  return (
    <Dialog open={url !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1rem)] sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Payment Receipt</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">Uploaded proof of payment.</DialogDescription>
        </DialogHeader>
        {url ? (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center min-h-[300px] overflow-hidden">
              {isPdf ? (
                <FileText className="size-16 text-slate-300" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="Payment receipt" className="max-h-[60dvh] w-full object-contain" />
              )}
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 h-11 font-bold text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="size-4" />
              {isPdf ? "Open PDF in New Tab" : "Open in New Tab"}
            </a>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ModalPagination } from "@/components/ui/modal-pagination"
import { TABLE_PAGE_SIZE } from "@/lib/pagination"

interface PaginatedListModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: LucideIcon
  items: string[]
  emptyMessage?: string
}

export function PaginatedListModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  items,
  emptyMessage = "No records found",
}: PaginatedListModalProps) {
  const [currentPage, setCurrentPage] = React.useState(1)

  React.useEffect(() => {
    if (isOpen) setCurrentPage(1)
  }, [isOpen, title])

  const pageItems = items.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] md:max-w-lg rounded-3xl border-slate-200 shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="size-10 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] border border-[#67BA2E]/20">
                <Icon className="size-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">
                {title}
              </DialogTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                {items.length} {items.length === 1 ? "Record" : "Records"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 min-h-[120px] max-h-[50vh] overflow-y-auto">
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pageItems.map((item, i) => (
                <Badge
                  key={`${item}-${i}`}
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-sm"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-8">
              {emptyMessage}
            </p>
          )}
        </div>

        <ModalPagination
          currentPage={currentPage}
          totalItems={items.length}
          onPageChange={setCurrentPage}
        />
      </DialogContent>
    </Dialog>
  )
}

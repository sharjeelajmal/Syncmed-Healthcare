"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TABLE_PAGE_SIZE } from "@/lib/pagination"

interface ModalPaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
}

export function ModalPagination({
  currentPage,
  totalItems,
  itemsPerPage = TABLE_PAGE_SIZE,
  onPageChange,
}: ModalPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
      <p className="text-xs font-medium text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-700">
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
        </span>{" "}
        to{" "}
        <span className="font-bold text-slate-700">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        of <span className="font-bold text-slate-700">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 gap-1 rounded-lg border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <span className="min-w-[5rem] text-center text-xs font-bold text-slate-600">
          <span className="text-[#67BA2E]">{currentPage}</span> / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 gap-1 rounded-lg border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { TablePagination } from "@/components/ui/table-pagination"
import { TABLE_PAGE_SIZE } from "@/lib/pagination"

interface ServerTablePaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage?: number
}

export function ServerTablePagination({
  currentPage,
  totalItems,
  itemsPerPage = TABLE_PAGE_SIZE,
}: ServerTablePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <TablePagination
      currentPage={currentPage}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
    />
  )
}

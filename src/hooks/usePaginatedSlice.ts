"use client"

import * as React from "react"

export const TABLE_PAGE_SIZE = 10

type UsePaginatedSliceOptions = {
  itemsPerPage?: number
  resetDeps?: React.DependencyList
}

export function usePaginatedSlice<T>(
  items: T[],
  options?: UsePaginatedSliceOptions
) {
  const itemsPerPage = options?.itemsPerPage ?? TABLE_PAGE_SIZE
  const resetDeps = options?.resetDeps ?? []

  const [currentPage, setCurrentPage] = React.useState(1)
  const [direction, setDirection] = React.useState(1)

  React.useEffect(() => {
    setCurrentPage(1)
    setDirection(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, ...resetDeps])

  const setPage = React.useCallback((page: number) => {
    setCurrentPage((prev) => {
      setDirection(page > prev ? 1 : -1)
      return page
    })
  }, [])

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage)

  return {
    currentPage,
    direction,
    setPage,
    paginatedItems,
    totalItems: items.length,
    itemsPerPage,
  }
}

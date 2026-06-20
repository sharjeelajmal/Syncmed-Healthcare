export const TABLE_PAGE_SIZE = 10
export const HEALTH_LIST_PAGE_SIZE = 10
export const HEALTH_VITALS_PAGE_SIZE = 5

export function parsePageParam(
  value: string | undefined,
  maxPage = Number.POSITIVE_INFINITY
): number {
  const parsed = Number.parseInt(value ?? "1", 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  if (maxPage !== Number.POSITIVE_INFINITY && parsed > maxPage) {
    return maxPage
  }
  return parsed
}

export function paginationSkip(page: number, pageSize = TABLE_PAGE_SIZE): number {
  return (page - 1) * pageSize
}

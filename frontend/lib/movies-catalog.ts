import { DEFAULT_SORT } from "@/config/defaults.config"

export const MOVIE_CATALOG_SORT_VALUES = [
  "-createdAt",
  "-views",
  "-rating",
] as const

export type MovieCatalogSortValue = (typeof MOVIE_CATALOG_SORT_VALUES)[number]

export function normalizeCatalogSort(
  raw: string | undefined | null
): MovieCatalogSortValue {
  const v = raw?.trim()
  if (
    v &&
    (MOVIE_CATALOG_SORT_VALUES as readonly string[]).includes(v)
  ) {
    return v as MovieCatalogSortValue
  }
  return "-createdAt"
}

export function normalizeCatalogYear(
  raw: string | undefined | null
): string | undefined {
  if (raw == null || String(raw).trim() === "") return undefined
  const y = parseInt(String(raw), 10)
  if (Number.isNaN(y) || y < 1900 || y > 2100) return undefined
  return String(y)
}

/** Query segment for pagination links (omit when only defaults apply). */
export function buildFilmiPaginationQuery(
  sort: string,
  year?: string
): string | undefined {
  const parts: string[] = []
  if (sort !== DEFAULT_SORT) parts.push(`sort=${encodeURIComponent(sort)}`)
  if (year) parts.push(`year=${encodeURIComponent(year)}`)
  return parts.length > 0 ? parts.join("&") : undefined
}

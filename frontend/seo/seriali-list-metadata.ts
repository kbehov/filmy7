import { DEFAULT_SORT } from "@/config/defaults.config"
import type { MovieCatalogSortValue } from "@/lib/movies-catalog"
import { buildFilmiPaginationQuery } from "@/lib/movies-catalog"
import { seoBase } from "@/seo/base"
import type { Metadata } from "next"

const CATALOG_BASE = "/seriali"

/** Pagination and canonical paths aligned with `SmartPagination` (`baseUrl="/seriali"`). */
export function serialiListingHref(
  page: number,
  sort: MovieCatalogSortValue,
  year?: string
): string {
  const extraQuery = buildFilmiPaginationQuery(sort, year)
  const path = page <= 1 ? CATALOG_BASE : `${CATALOG_BASE}/${page}`
  return extraQuery ? `${path}?${extraQuery}` : path
}

function sortHumanPl(sort: MovieCatalogSortValue): string {
  switch (sort) {
    case "-views":
      return "według oglądalności"
    case "-rating":
      return "według oceny"
    case "-createdAt":
    default:
      return "ostatnio dodane"
  }
}

function buildListingTitle(
  page: number,
  sort: MovieCatalogSortValue,
  year?: string
): string {
  let t = "Seriale online"
  if (year) t += ` · ${year}`
  if (sort !== DEFAULT_SORT) t += ` · ${sortHumanPl(sort)}`
  if (page > 1) t += ` · strona ${page}`
  return t
}

function seriesCountLine(moviesCount: number): string {
  if (moviesCount <= 0) return ""
  if (moviesCount === 1) return ` Ponad ${moviesCount} serial w katalogu.`
  const mod10 = moviesCount % 10
  const mod100 = moviesCount % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return ` Ponad ${moviesCount} seriale w katalogu.`
  }
  return ` Ponad ${moviesCount} seriali w katalogu.`
}

function buildListingDescription(
  page: number,
  totalPages: number,
  sort: MovieCatalogSortValue,
  year?: string,
  moviesCount?: number
): string {
  const sortLine =
    sort === DEFAULT_SORT
      ? "Sortowanie: ostatnio dodane."
      : `Sortowanie: ${sortHumanPl(sort)}.`
  const yearLine = year ? ` Rok: ${year}.` : ""
  const countLine =
    typeof moviesCount === "number" ? seriesCountLine(moviesCount) : ""
  const pageLine =
    totalPages > 1
      ? page > 1
        ? ` Strona ${page} z ${totalPages}.`
        : ` Łącznie stron: ${totalPages}.`
      : ""
  return `Oglądaj seriale online w HD z polskimi napisami na Filmy7.${yearLine} ${sortLine}${countLine}${pageLine} Wybierz serial i oglądaj bez rejestracji.`.replace(
    /\s+/g,
    " "
  )
}

export function buildSerialiListingMetadata(input: {
  page: number
  sort: MovieCatalogSortValue
  year?: string
  totalPages: number
  moviesCount?: number
}): Metadata {
  const { page, sort, year, totalPages, moviesCount } = input
  const canonicalPath = serialiListingHref(page, sort, year)
  const title = buildListingTitle(page, sort, year)
  const description = buildListingDescription(
    page,
    totalPages,
    sort,
    year,
    moviesCount
  )

  const pagination: { previous?: string; next?: string } = {}
  if (page > 1) {
    pagination.previous = serialiListingHref(page - 1, sort, year)
  }
  if (page < totalPages) {
    pagination.next = serialiListingHref(page + 1, sort, year)
  }
  const hasPaginationRel =
    pagination.previous !== undefined || pagination.next !== undefined

  return {
    title,
    description,
    keywords: [
      "seriale online",
      "oglądaj seriale",
      "seriale w HD",
      "polskie napisy",
      "filmy7",
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      ...seoBase.openGraph,
      url: canonicalPath,
      title,
      description,
    },
    twitter: {
      ...seoBase.twitter,
      title,
      description,
    },
    ...(hasPaginationRel ? { pagination } : {}),
    robots: { index: true, follow: true },
  }
}

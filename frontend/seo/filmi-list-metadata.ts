import { DEFAULT_SORT } from "@/config/defaults.config"
import type { MovieCatalogSortValue } from "@/lib/movies-catalog"
import { buildFilmiPaginationQuery } from "@/lib/movies-catalog"
import { seoBase } from "@/seo/base"
import type { Metadata } from "next"

/** Pagination and canonical paths aligned with `SmartPagination` (`baseUrl="/filmi"`). */
export function filmiListingHref(page: number, extraQuery?: string): string {
  const path = page <= 1 ? "/filmi" : `/filmi/${page}`
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
  let t = "Filmy online"
  if (year) t += ` · ${year}`
  if (sort !== DEFAULT_SORT) t += ` · ${sortHumanPl(sort)}`
  if (page > 1) t += ` · strona ${page}`
  return t
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
    typeof moviesCount === "number" && moviesCount > 0
      ? ` Ponad ${moviesCount} tytułów w katalogu.`
      : ""
  const pageLine =
    totalPages > 1
      ? page > 1
        ? ` Strona ${page} z ${totalPages}.`
        : ` Łącznie stron: ${totalPages}.`
      : ""
  return `Oglądaj filmy online w HD z polskimi napisami na Filmy7.${yearLine} ${sortLine}${countLine}${pageLine} Wybierz film i oglądaj bez rejestracji.`.replace(
    /\s+/g,
    " "
  )
}

export function buildFilmiListingMetadata(input: {
  page: number
  sort: MovieCatalogSortValue
  year?: string
  totalPages: number
  moviesCount?: number
}): Metadata {
  const { page, sort, year, totalPages, moviesCount } = input
  const extraQuery = buildFilmiPaginationQuery(sort, year)
  const canonicalPath = filmiListingHref(page, extraQuery)
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
    pagination.previous = filmiListingHref(page - 1, extraQuery)
  }
  if (page < totalPages) {
    pagination.next = filmiListingHref(page + 1, extraQuery)
  }
  const hasPaginationRel =
    pagination.previous !== undefined || pagination.next !== undefined

  return {
    title,
    description,
    keywords: [
      "filmy online",
      "oglądaj filmy za darmo",
      "filmy w HD",
      "polskie napisy",
      "katalog filmów",
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

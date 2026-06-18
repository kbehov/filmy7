import { seoBase } from "@/seo/base"
import type { Metadata } from "next"

export const TRENDING_LIST_SORT = "-views" as const

const CATALOG_BASE = "/trending"

/** Aligned with `SmartPagination` (`baseUrl="/trending"`). */
export function trendingListingHref(page: number): string {
  return page <= 1 ? CATALOG_BASE : `${CATALOG_BASE}/${page}`
}

export function buildTrendingListingMetadata(input: {
  page: number
  totalPages: number
  moviesCount?: number
}): Metadata {
  const { page, totalPages, moviesCount } = input
  const pageSuffix = page > 1 ? ` · strona ${page}` : ""
  const title = `Popularne filmy${pageSuffix}`
  const countFragment =
    typeof moviesCount === "number" && moviesCount > 0
      ? ` Ponad ${new Intl.NumberFormat("pl-PL").format(moviesCount)} tytułów według oglądalności.`
      : ""
  const pageLine =
    totalPages > 1
      ? page > 1
        ? ` Strona ${page} z ${totalPages}.`
        : ` Łącznie stron: ${totalPages}.`
      : ""
  const description =
    `Najczęściej oglądane filmy na Filmy7 — selekcja według zainteresowania widzów.${countFragment}${pageLine} HD, polskie napisy, bez rejestracji.`.replace(
      /\s+/g,
      " "
    )

  const canonicalPath = trendingListingHref(page)

  const pagination: { previous?: string; next?: string } = {}
  if (page > 1) {
    pagination.previous = trendingListingHref(page - 1)
  }
  if (page < totalPages) {
    pagination.next = trendingListingHref(page + 1)
  }
  const hasPaginationRel =
    pagination.previous !== undefined || pagination.next !== undefined

  return {
    title,
    description,
    keywords: [
      "popularne filmy",
      "top filmów",
      "filmy online",
      "filmy w HD",
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

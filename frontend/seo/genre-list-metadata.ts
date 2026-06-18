import { DEFAULT_SORT } from '@/config/defaults.config'
import type { MovieCatalogSortValue } from '@/lib/movies-catalog'
import { buildFilmiPaginationQuery } from '@/lib/movies-catalog'
import { seoBase } from '@/seo/base'
import type { Metadata } from 'next'

export function genreListingHref(page: number, slug: string, extraQuery?: string): string {
  const path = page <= 1 ? `/genre/${slug}` : `/genre/${slug}/${page}`
  return extraQuery ? `${path}?${extraQuery}` : path
}

function sortHumanPl(sort: MovieCatalogSortValue): string {
  switch (sort) {
    case '-views':
      return 'według oglądalności'
    case '-rating':
      return 'według oceny'
    case '-createdAt':
    default:
      return 'ostatnio dodane'
  }
}

function buildGenreTitle(
  genreName: string,
  page: number,
  sort: MovieCatalogSortValue,
  year?: string,
): string {
  let t = `${genreName} — filmy i seriale`
  if (year) t += ` · ${year}`
  if (sort !== DEFAULT_SORT) t += ` · ${sortHumanPl(sort)}`
  if (page > 1) t += ` · strona ${page}`
  return t
}

function buildGenreDescription(
  genreName: string,
  page: number,
  totalPages: number,
  moviesCount: number,
): string {
  const countLine =
    moviesCount > 0
      ? ` Ponad ${new Intl.NumberFormat('pl-PL').format(moviesCount)} tytułów w tym gatunku.`
      : ''
  const pageLine =
    totalPages > 1
      ? page > 1
        ? ` Strona ${page} z ${totalPages}.`
        : ` Łącznie stron w sekcji: ${totalPages}.`
      : ''
  return `Oglądaj ${genreName} online w HD z polskimi napisami na Filmy7.${countLine}${pageLine} Wybierz film lub serial bez rejestracji.`.replace(
    /\s+/g,
    ' ',
  )
}

export function buildGenreListingMetadata(input: {
  slug: string
  genreName: string
  page: number
  sort: MovieCatalogSortValue
  year?: string
  totalPages: number
  moviesCount: number
}): Metadata {
  const { slug, genreName, page, sort, year, totalPages, moviesCount } = input
  const extraQuery = buildFilmiPaginationQuery(sort, year)
  const canonicalPath = genreListingHref(page, slug, extraQuery)
  const title = buildGenreTitle(genreName, page, sort, year)
  const description = buildGenreDescription(genreName, page, totalPages, moviesCount)

  const pagination: { previous?: string; next?: string } = {}
  if (page > 1) {
    pagination.previous = genreListingHref(page - 1, slug, extraQuery)
  }
  if (page < totalPages) {
    pagination.next = genreListingHref(page + 1, slug, extraQuery)
  }
  const hasPaginationRel =
    pagination.previous !== undefined || pagination.next !== undefined

  return {
    title,
    description,
    keywords: [
      `${genreName} filmy`,
      `${genreName} seriale`,
      'filmy online',
      'filmy w HD',
      'polskie napisy',
      'filmy7',
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

import MovieCard from "@/components/cards/movie-card"
import MovieFilters from "@/components/movies/movie-filters"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import SmartPagination from "@/components/ui/smart-pagination"
import {
  buildFilmiPaginationQuery,
  normalizeCatalogSort,
  normalizeCatalogYear,
} from "@/lib/movies-catalog"
import { buildGenreListingMetadata } from "@/seo/genre-list-metadata"
import { getGenreBySlug } from "@/services/genres.service"
import { getMovies, buildMoviesListQuery } from "@/services/movies.service"
import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { Suspense } from "react"

async function loadGenre(slug: string) {
  try {
    return await getGenreBySlug(slug)
  } catch {
    notFound()
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; num: string }>
  searchParams: Promise<{ sort?: string; year?: string }>
}): Promise<Metadata> {
  const { slug, num } = await params
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const sp = await searchParams
  const genre = await loadGenre(slug)
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const { totalPages, moviesCount } = await getMovies(
    buildMoviesListQuery({
      page: pageNum,
      sort,
      year,
      genres: genre._id,
    }),
  )
  return buildGenreListingMetadata({
    slug,
    genreName: genre.name,
    page: pageNum,
    sort,
    year,
    totalPages,
    moviesCount,
  })
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; num: string }>
  searchParams: Promise<{ sort?: string; year?: string }>
}) {
  const { slug, num } = await params
  const sp = await searchParams
  const genre = await loadGenre(slug)
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const catalogListQuery = buildFilmiPaginationQuery(sort, year)
  const genreBaseHref = catalogListQuery
    ? `/genre/${slug}?${catalogListQuery}`
    : `/genre/${slug}`
  const catalogBase = `/genre/${slug}`
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  if (pageNum <= 1) {
    const qs = catalogListQuery ? `?${catalogListQuery}` : ""
    permanentRedirect(`/genre/${slug}${qs}`)
  }
  const {
    data: movies,
    totalPages,
    page,
  } = await getMovies(
    buildMoviesListQuery({
      page: pageNum,
      sort,
      year,
      genres: genre._id,
    })
  )
  if (pageNum > totalPages) notFound()
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 lg:gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={genreBaseHref}>{genre.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Strona {num}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Suspense fallback={null}>
          <MovieFilters catalogBasePath={catalogBase} />
        </Suspense>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: page, totalPages }}
          baseUrl={catalogBase}
          extraQuery={catalogListQuery}
        />
      </div>
    </div>
  )
}

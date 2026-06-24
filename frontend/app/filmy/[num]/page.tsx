import MovieCard from '@/components/cards/movie-card'
import MovieFilters from '@/components/movies/movie-filters'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import SmartPagination from '@/components/ui/smart-pagination'
import { buildFilmiPaginationQuery, normalizeCatalogSort, normalizeCatalogYear } from '@/lib/movies-catalog'
import { buildFilmiListingMetadata } from '@/seo/filmi-list-metadata'
import { buildMoviesListQuery, getMovies } from '@/services/movies.service'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ num: string }>
  searchParams: Promise<{ sort?: string; year?: string }>
}): Promise<Metadata> {
  const { num } = await params
  const sp = await searchParams
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const { totalPages, moviesCount } = await getMovies(
    buildMoviesListQuery({
      page: pageNum,
      sort,
      year,
    }),
  )
  return buildFilmiListingMetadata({
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
  params: Promise<{ num: string }>
  searchParams: Promise<{ sort?: string; year?: string }>
}) {
  const { num } = await params
  const sp = await searchParams
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const catalogListQuery = buildFilmiPaginationQuery(sort, year)
  const filmiBaseHref = catalogListQuery ? `/filmi?${catalogListQuery}` : '/filmi'
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const {
    data: movies,
    totalPages,
    page,
  } = await getMovies(
    buildMoviesListQuery({
      page: pageNum,
      sort,
      year,
    }),
  )
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 lg:gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={filmiBaseHref}>Filmy</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Strona {num}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Suspense fallback={null}>
          <MovieFilters />
        </Suspense>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {movies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
        <SmartPagination meta={{ currentPage: page, totalPages }} baseUrl="/filmy" extraQuery={catalogListQuery} />
      </div>
    </div>
  )
}

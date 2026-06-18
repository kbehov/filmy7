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
import { buildSerialiListingMetadata } from "@/seo/seriali-list-metadata"
import { buildMoviesListQuery, getMovies } from "@/services/movies.service"
import type { Metadata } from "next"
import { Suspense } from "react"

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
      contentType: "series",
      page: pageNum,
      sort,
      year,
      type: "series",
    })
  )
  return buildSerialiListingMetadata({
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
  const serialiBaseHref = catalogListQuery
    ? `/seriali?${catalogListQuery}`
    : "/seriali"
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const {
    data: series,
    totalPages,
    page,
  } = await getMovies(
    buildMoviesListQuery({
      contentType: "series",
      page: pageNum,
      sort,
      year,
      type: "series",
    })
  )
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 lg:gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={serialiBaseHref}>Seriale</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Strona {num}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Suspense fallback={null}>
          <MovieFilters catalogBasePath="/seriali" />
        </Suspense>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {series.map((item) => (
            <MovieCard key={item._id} movie={item} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: page, totalPages }}
          baseUrl="/seriali"
          extraQuery={catalogListQuery}
        />
      </div>
    </div>
  )
}

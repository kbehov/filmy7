import MovieCard from "@/components/cards/movie-card"
import { FilmiHero } from "@/components/filmi-hero"
import MovieFilters from "@/components/movies/movie-filters"
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
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; year?: string }>
}): Promise<Metadata> {
  const sp = await searchParams
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const { totalPages, moviesCount } = await getMovies(
    buildMoviesListQuery({
      contentType: "series",
      page: 1,
      sort,
      year,
      type: "series",
    })
  )
  return buildSerialiListingMetadata({
    page: 1,
    sort,
    year,
    totalPages,
    moviesCount,
  })
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; year?: string }>
}) {
  const sp = await searchParams
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const {
    data: series,
    totalPages,
    page,
    moviesCount,
    limit,
  } = await getMovies(
    buildMoviesListQuery({
      page: 1,
      sort,
      year,
      type: "series",
      contentType: "series",
    })
  )
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <FilmiHero
          moviesCount={moviesCount}
          pageSize={limit}
          title="Seriale online"
          description="Wszystkie seriale w jednym miejscu: sortuj według daty dodania, oglądalności lub oceny, filtruj po roku i otwórz serial jednym kliknięciem."
          headingId="seriali-catalog-hero-heading"
        />
        <Suspense fallback={null}>
          <MovieFilters catalogBasePath="/seriali" />
        </Suspense>
        <div
          id="seriali-catalog"
          className="grid scroll-mt-28 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          tabIndex={-1}
        >
          {series.map((item) => (
            <MovieCard key={item._id} movie={item} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: page, totalPages }}
          baseUrl="/seriali"
          extraQuery={buildFilmiPaginationQuery(sort, year)}
        />
      </div>
    </div>
  )
}

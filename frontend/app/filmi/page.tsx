import MovieCard from "@/components/cards/movie-card"
import { FilmiHero } from "@/components/filmi-hero"
import MovieFilters from "@/components/movies/movie-filters"
import SmartPagination from "@/components/ui/smart-pagination"
import {
  buildFilmiPaginationQuery,
  normalizeCatalogSort,
  normalizeCatalogYear,
} from "@/lib/movies-catalog"
import { buildFilmiListingMetadata } from "@/seo/filmi-list-metadata"
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
      page: 1,
      sort,
      year,
    })
  )
  return buildFilmiListingMetadata({
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
    data: movies,
    totalPages,
    page,
    moviesCount,
    limit,
  } = await getMovies(
    buildMoviesListQuery({
      page: 1,
      sort,
      year,
    })
  )
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <FilmiHero
          moviesCount={moviesCount}
          pageSize={limit}
          title="Filmy online"
          description="Cały katalog w jednym miejscu: sortuj według daty dodania, oglądalności lub oceny, filtruj po roku i otwórz film jednym kliknięciem."
          headingId="filmi-catalog-hero-heading"
        />
        <Suspense fallback={null}>
          <MovieFilters />
        </Suspense>
        <div
          id="filmi-catalog"
          className="grid scroll-mt-28 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          tabIndex={-1}
        >
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: page, totalPages }}
          baseUrl="/filmi"
          extraQuery={buildFilmiPaginationQuery(sort, year)}
        />
      </div>
    </div>
  )
}

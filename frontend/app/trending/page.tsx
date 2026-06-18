import MovieCard from "@/components/cards/movie-card"
import { FilmiHero } from "@/components/filmi-hero"
import SmartPagination from "@/components/ui/smart-pagination"
import {
  buildTrendingListingMetadata,
  TRENDING_LIST_SORT,
} from "@/seo/trending-list-metadata"
import { buildMoviesListQuery, getMovies } from "@/services/movies.service"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { totalPages, moviesCount } = await getMovies(
    buildMoviesListQuery({
      contentType: "movie",
      page: 1,
      sort: TRENDING_LIST_SORT,
    })
  )
  return buildTrendingListingMetadata({
    page: 1,
    totalPages,
    moviesCount,
  })
}

export default async function Page() {
  const {
    data: movies,
    totalPages,
    page,
    moviesCount,
    limit,
  } = await getMovies(
    buildMoviesListQuery({
      contentType: "movie",
      page: 1,
      sort: TRENDING_LIST_SORT,
    })
  )

  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <FilmiHero
          moviesCount={moviesCount}
          pageSize={limit}
          title="Popularne filmy"
          description="Selekcja według rzeczywistej oglądalności — zobacz, co oglądają inni, i wybierz następny film."
          headingId="trending-hero-heading"
        />
        <div
          className="grid scroll-mt-28 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          tabIndex={-1}
        >
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: page, totalPages }}
          baseUrl="/trending"
        />
      </div>
    </div>
  )
}

import MovieCard from '@/components/cards/movie-card'
import { FilmiHero } from '@/components/filmi-hero'
import MovieFilters from '@/components/movies/movie-filters'
import SmartPagination from '@/components/ui/smart-pagination'
import { buildFilmiPaginationQuery, normalizeCatalogSort, normalizeCatalogYear } from '@/lib/movies-catalog'
import { buildGenreListingMetadata } from '@/seo/genre-list-metadata'
import { getGenreBySlug } from '@/services/genres.service'
import { buildMoviesListQuery, getMovies } from '@/services/movies.service'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

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
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; year?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const genre = await loadGenre(slug)
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const { totalPages, moviesCount } = await getMovies(
    buildMoviesListQuery({
      page: 1,
      sort,
      year,
      genres: genre._id,
    }),
  )
  return buildGenreListingMetadata({
    slug,
    genreName: genre.name,
    page: 1,
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
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; year?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const genre = await loadGenre(slug)
  const sort = normalizeCatalogSort(sp.sort)
  const year = normalizeCatalogYear(sp.year)
  const catalogBase = `/genre/${slug}`
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
      genres: genre._id,
    }),
  )
  const heroDescription = genre.description?.trim() || 'Filmy i seriale tego gatunku online.'

  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <FilmiHero
          moviesCount={moviesCount}
          pageSize={limit}
          title={genre.name}
          description={heroDescription}
          headingId={`genre-hero-${slug}`}
        />
        <Suspense fallback={null}>
          <MovieFilters catalogBasePath={catalogBase} />
        </Suspense>
        <div
          id="genre-catalog"
          className="grid scroll-mt-28 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          tabIndex={-1}
        >
          {movies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: page, totalPages }}
          baseUrl={catalogBase}
          extraQuery={buildFilmiPaginationQuery(sort, year)}
        />
      </div>
    </div>
  )
}

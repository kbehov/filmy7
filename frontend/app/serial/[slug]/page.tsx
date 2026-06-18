import { headlineTitle, isSerialWatch } from '@/components/movie/lib'
import { MovieCast } from '@/components/movie/movie-cast'
import { MovieEpisodes } from '@/components/movie/movie-episodes'
import { MovieHero } from '@/components/movie/movie-hero'
import { MovieInfo } from '@/components/movie/movie-info'
import { MoviePlayers } from '@/components/movie/movie-players'
import SimilarMovies from '@/components/movies/similiar-movies'
import { SeriesPageJumpNav } from '@/components/series/series-page-jump-nav'
import { SeriesSeasonsStrip } from '@/components/series/series-seasons'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { MovieJsonLd } from '@/seo/movie-json-ld'
import { buildMovieMetadata } from '@/seo/movie-metadata'
import { getMovieBySlug, getSeriesSeasons } from '@/services/movies.service'
import type { Movie } from '@/types/movies.types'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

type PageParams = { params: Promise<{ slug: string }> }

function collectSeasons(current: Movie, siblings: Movie[]): Movie[] {
  const byId = new Map<string, Movie>()
  byId.set(current._id, current)
  for (const s of siblings) {
    byId.set(s._id, s)
  }
  return Array.from(byId.values()).sort((a, b) => {
    const sa = a.seasson > 0 ? a.seasson : 9999
    const sb = b.seasson > 0 ? b.seasson : 9999
    return sa - sb
  })
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const movie = await getMovieBySlug(slug)
  if (!movie) notFound()
  if (!isSerialWatch(movie)) redirect(`/film/${slug}`)
  const path = `/serial/${movie.slug}`
  return buildMovieMetadata(movie, {
    canonicalPath: path,
    seasonInTitle: movie.seasson > 0 ? movie.seasson : undefined,
  })
}

export default async function SerialPage({ params }: PageParams) {
  const { slug } = await params
  const movie = await getMovieBySlug(slug)
  if (!movie) notFound()

  if (!isSerialWatch(movie)) {
    redirect(`/film/${slug}`)
  }

  const siblingSeasons = await getSeriesSeasons(movie._id)
  const seasons = collectSeasons(movie, siblingSeasons)

  const title = headlineTitle(movie.title)
  const canonicalPath = `/serial/${movie.slug}`

  const showSeasonNav = seasons.length > 1

  return (
    <article className="min-h-svh bg-background p-6 lg:p-10">
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-0">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Główna</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/seriali">Seriale</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <MovieJsonLd movie={movie} canonicalPath={canonicalPath} totalSeasonCount={seasons.length} />
      <MovieHero movie={movie} />
      <SeriesPageJumpNav showSeasonLink={showSeasonNav} />

      <div className="flex flex-col gap-10 md:gap-12">
        <SeriesSeasonsStrip currentId={movie._id} seasons={seasons} />
        <MoviePlayers
          sources={movie.sources ?? []}
          videoType={movie.videoType}
          tmdb_id={movie.tmdb_id}
          movieCover={movie.coverPhoto ?? ''}
          movieTitle={title}
          embedKind="tv"
        />

        <MovieInfo movie={movie} />
        <MovieEpisodes movie={movie} />
        <MovieCast movie={movie} heading="W obsadzie" />

        <div className="mx-auto w-full max-w-6xl px-6 pt-4 pb-10 md:pb-14">
          <SimilarMovies
            id={movie._id}
            genres={movie.genres.map((genre) => genre._id)}
            year={movie.year}
            rating={movie.rating}
            eyebrow="Więcej"
            title="Podobne seriale"
            description="Selekcja według gatunków i roku — możesz kontynuować oglądanie."
          />
        </div>
      </div>
    </article>
  )
}

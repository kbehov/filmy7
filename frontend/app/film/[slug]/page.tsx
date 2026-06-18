import { headlineTitle, isSerialWatch, isSeriesContent } from '@/components/movie/lib'
import { MovieCast } from '@/components/movie/movie-cast'
import { MovieEpisodes } from '@/components/movie/movie-episodes'
import { MovieHero } from '@/components/movie/movie-hero'
import { MovieInfo } from '@/components/movie/movie-info'
import { MoviePlayers } from '@/components/movie/movie-players'
import SimilarMovies from '@/components/movies/similiar-movies'
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
import { getMovieBySlug, viewMovie } from '@/services/movies.service'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

type PageParams = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const movie = await getMovieBySlug(slug)
  if (!movie) notFound()
  if (isSerialWatch(movie)) redirect(`/serial/${movie.slug}`)
  return buildMovieMetadata(movie)
}

export default async function FilmPage({ params }: PageParams) {
  const { slug } = await params
  const movie = await getMovieBySlug(slug)
  if (!movie) notFound()
  if (isSerialWatch(movie)) redirect(`/serial/${movie.slug}`)

  const title = headlineTitle(movie.title)
  const series = isSeriesContent(movie)

  await viewMovie(movie._id)

  return (
    <article className="min-h-svh p-4 lg:p-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Główna</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={series ? '/seriali' : '/filmi'}>{series ? 'Seriale' : 'Filmy'}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <MovieJsonLd movie={movie} />
      <MovieHero movie={movie} />
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:py-10">
        <div className="flex flex-col gap-8 md:gap-10">
          <MoviePlayers
            sources={movie.sources ?? []}
            videoType={movie.videoType}
            tmdb_id={movie.tmdb_id}
            movieCover={movie.coverPhoto ?? ''}
            movieTitle={title}
          />

          <MovieInfo movie={movie} />
          <MovieEpisodes movie={movie} />
          <MovieCast movie={movie} />
          <SimilarMovies
            id={movie._id}
            genres={movie.genres.map(genre => genre._id)}
            year={movie.year}
            rating={movie.rating}
          />
        </div>
      </div>
    </article>
  )
}

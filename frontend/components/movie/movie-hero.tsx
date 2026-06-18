import { tmdbPosterUrlForGrid } from '@/lib/tmdb-image'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movies.types'
import { Star, Tv } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatRuntime, headlineTitle, isSeriesContent } from './lib'

export function MovieHero({ movie }: { movie: Movie }) {
  const series = isSeriesContent(movie)
  const headline = headlineTitle(movie.title)
  const original = movie.original_title
  const runtime = formatRuntime(movie.movieLength)
  const imdbScore = typeof movie.rating === 'number' && movie.rating > 0 ? movie.rating.toFixed(1) : null
  const genres = movie.genres?.slice(0, 4) ?? []
  const seasonNum = series && movie.seasson > 0 ? movie.seasson : null
  const backdrop = movie.coverPhoto || movie.movieImage
  const posterSrc = tmdbPosterUrlForGrid(movie.movieImage, 'w500')

  return (
    <section className="relative isolate overflow-hidden">
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {backdrop && <Image src={backdrop} alt="" fill sizes="100vw" priority className="object-cover object-center" />}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.9)_100%)]" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/50 to-transparent" />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pt-8 pb-4 md:flex-row md:items-end">
        {/* Poster */}
        <div
          className={cn(
            'relative aspect-2/3 w-40 shrink-0 overflow-hidden rounded-xl',
            'shadow-[0_12px_48px_rgba(0,0,0,0.65)] ring-1 ring-white/10',
            'md:w-56 lg:w-64',
          )}
        >
          <Image
            src={posterSrc}
            alt={`${headline}${movie.year > 0 ? ` (${movie.year})` : ''}`}
            fill
            sizes="(max-width: 768px) 160px, 256px"
            priority
            className="object-cover object-top"
          />
        </div>

        {/* Text block */}
        <div className="min-w-0 flex-1 space-y-5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            <Tv className="size-3" aria-hidden />
            {series ? 'Serial' : 'Film'}
            {movie.year > 0 && (
              <>
                <span className="text-border" aria-hidden>
                  ·
                </span>
                <span>{movie.year}</span>
              </>
            )}
            {runtime && (
              <>
                <span className="text-border" aria-hidden>
                  ·
                </span>
                <span className="tracking-normal normal-case">{runtime}</span>
              </>
            )}
          </p>

          {series && seasonNum != null ? (
            <p className="pt-1">
              <span
                className={cn(
                  'inline-flex items-center rounded-lg border border-primary/40 bg-primary/15 px-3 py-1.5',
                  'text-sm font-semibold tracking-tight text-foreground shadow-sm backdrop-blur-sm',
                )}
              >
                Sezon {seasonNum}
              </span>
            </p>
          ) : null}

          <div className="space-y-2">
            <h1
              id="movie-hero-heading"
              className="text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground md:text-5xl lg:text-6xl"
            >
              {headline}
            </h1>
            <p className="text-sm text-muted-foreground">{original}</p>

            <p className="line-clamp-4 max-w-3xl text-sm">{movie.description}</p>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {imdbScore && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1',
                  'border border-amber-500/30 bg-black/60 text-amber-300',
                  'text-xs font-bold backdrop-blur-md',
                )}
                aria-label={`Ocena IMDb ${imdbScore}`}
              >
                <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                {imdbScore}
                <span className="text-amber-300/60">/10</span>
              </span>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {genres.map(g => (
                <li key={g.slug}>
                  <Link
                    href={`/genre/${g.slug}`}
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1',
                      'text-xs font-medium',
                      'border border-white/10 bg-white/5 text-foreground/90 backdrop-blur-sm',
                      'transition-colors hover:border-white/30 hover:bg-white/10',
                    )}
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

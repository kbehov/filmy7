import { isTmdbImageUrl, tmdbPosterUrlForGrid } from '@/lib/tmdb-image'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movies.types'
import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRuntime(minutes: number): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} godz`
  return `${h} godz ${m} min`
}

const NEW_EPISODE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function getLastAddedEpisodeTime(value: Date | string | null | undefined): number | null {
  if (value == null) return null
  const t = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isNaN(t) ? null : t
}

function hasNewEpisodeSince(isSeries: boolean, lastAdded: Date | string | null | undefined): boolean {
  if (!isSeries) return false
  const added = getLastAddedEpisodeTime(lastAdded)
  if (added == null) return false
  const now = Date.now()
  if (added > now) return false
  return now - added <= NEW_EPISODE_MAX_AGE_MS
}

function isSeriesContent(movie: Movie): boolean {
  if (movie.episodesCount > 0) return true
  return Array.isArray(movie.episodes) && movie.episodes.length > 0
}

/** Prefer localized segment after " / " (common "original / BG" pattern); otherwise first segment. */
function headlineTitle(rawTitle: string): string {
  const parts = rawTitle
    .split('/')
    .map(s => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) return parts[1]!
  return parts[0] ?? rawTitle.trim()
}

function posterAltText(movie: Movie, headline: string, series: boolean): string {
  const kind = series ? 'serial' : 'film'
  const year = movie.year > 0 ? ` (${movie.year})` : ''
  return `Plakat: ${headline}${year} — ${kind}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type MovieCardProps = {
  movie: Movie
  className?: string
  priority?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

const MovieCard = ({ movie, className, priority }: MovieCardProps) => {
  const isSeries = isSeriesContent(movie)
  const title = headlineTitle(movie.title)
  const genres = movie.genres?.slice(0, 2).map(g => g.name) ?? []
  const imdbScore = typeof movie.rating === 'number' && movie.rating > 0 ? movie.rating.toFixed(1) : null
  const runtime = formatRuntime(movie.movieLength)

  const posterAlt = posterAltText(movie, title, isSeries)
  const showNewEpisode = hasNewEpisodeSince(isSeries, movie.lastAddedEpisodeDate)

  const posterSrc = tmdbPosterUrlForGrid(movie.movieImage)
  const tmdbPoster = isTmdbImageUrl(movie.movieImage)

  const seasonLabel = isSeries && movie.seasson > 0 ? `S${movie.seasson}` : null
  const episodesLabel = isSeries && movie.episodesCount > 0 ? `${movie.episodesCount} odc.` : null

  return (
    <Link
      href={isSeries ? `/serial/${movie.slug}` : `/film/${movie.slug}`}
      className={cn(
        'group relative block outline-none',
        'rounded-xl focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        className,
      )}
      title={title}
    >
      {/* ── Poster container ──────────────────────────────────────────── */}
      <div
        className={cn(
          'relative aspect-2/3 w-full overflow-hidden rounded-xl',
          'transition-all duration-300 ease-out',
          'group-hover:scale-[1.025]',
        )}
      >
        {/* Poster image */}
        <Image
          src={posterSrc}
          alt={posterAlt}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
          priority={priority}
          unoptimized={tmdbPoster}
          className={cn(
            'object-cover object-top',
            'transition-transform duration-500 ease-out',
            'group-hover:scale-[1.04]',
          )}
        />

        {/* Base vignette — always visible, darkens corners & bottom */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 z-1',
            'bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(0,0,0,0.45)_100%)]',
            'transition-opacity duration-300 group-hover:opacity-80',
          )}
        />

        {/* Bottom scrim for text legibility */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-2 h-3/5 bg-linear-to-t from-black/95 via-black/50 to-transparent"
        />

        {/* ── Top-left: type badge ───────────────────────────────────── */}
        <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1.5">
          {/* Series / Film pill */}
          {isSeries && (
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5',
                'text-[0.6rem] font-bold tracking-widest uppercase',
                'border backdrop-blur-md',
                'bg-black/60 text-white',
              )}
            >
              {movie.seasson ? `Sezon ${movie.seasson}` : 'Serial'}
            </span>
          )}

          {/* New episode pulse badge */}
          {showNewEpisode && (
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5',
                'text-[0.6rem] font-bold tracking-widest uppercase',
                'border bg-red-600/90 text-white',
                'backdrop-blur-md',
              )}
            >
              <span className="inline-block size-1.5 rounded-full bg-white" aria-hidden />
              Nowe odcinki
            </span>
          )}
        </div>

        {/* ── Top-right: IMDb score ──────────────────────────────────── */}
        {imdbScore && (
          <div className="absolute top-2 right-2 z-10">
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5',
                'text-[0.6rem] font-bold',
                'border border-yellow-500/25 bg-black/60 text-yellow-300',
                'backdrop-blur-md',
              )}
              aria-label={`Ocena IMDb ${imdbScore}`}
            >
              <Star className="size-2.5 fill-amber-400 text-amber-400" aria-hidden strokeWidth={1.5} />
              {imdbScore}
            </span>
          </div>
        )}

        {/* ── Bottom overlay: quality + audio + series meta ─────────── */}
        <div className="absolute inset-x-0 bottom-0 z-10 space-y-1.5 p-2.5">
          {/* Series season/ep */}
          {(seasonLabel || episodesLabel) && (
            <p className="text-[0.65rem] font-semibold tracking-wide text-white/70">
              {[seasonLabel, episodesLabel].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* ── Text below poster ─────────────────────────────────────────── */}
      <div className="mt-2.5 min-w-0 space-y-0.5 px-0.5">
        <p
          className={cn(
            'text-md line-clamp-2 leading-snug font-medium tracking-tight',
            'text-foreground transition-colors duration-100',
            'group-hover:text-muted-foreground',
          )}
        >
          {title}
        </p>

        {/* Year · runtime · genres */}
        <p className="flex flex-wrap items-center gap-x-1 text-[0.7rem] leading-snug text-zinc-500">
          {movie.year > 0 && <span className="font-medium text-zinc-400">{movie.year}</span>}
          {runtime && (
            <>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <span>{runtime}</span>
            </>
          )}
          {genres.length > 0 && (
            <>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <span className="truncate">{genres.join(' / ')}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  )
}

export default MovieCard

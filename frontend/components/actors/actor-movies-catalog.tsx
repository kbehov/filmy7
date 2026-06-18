import MovieCard from '@/components/cards/movie-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SmartPagination from '@/components/ui/smart-pagination'
import { DEFAULT_SORT } from '@/config/defaults.config'
import { buildFilmiPaginationQuery, MovieCatalogSortValue } from '@/lib/movies-catalog'
import { cn } from '@/lib/utils'
import type { Actor } from '@/types/actor.types'
import type { Movie } from '@/types/movies.types'
import type { ReactNode } from 'react'

function formatCount(n: number): string {
  return new Intl.NumberFormat('pl-PL').format(n)
}

function rangeLabel(page: number, limit: number, moviesCount: number): string {
  if (moviesCount <= 0) return '0 tytułów'
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, moviesCount)
  return `${formatCount(start)}–${formatCount(end)} z ${formatCount(moviesCount)}`
}

function moviesCountHeadline(count: number): string {
  if (count === 0) return 'Nie znaleziono filmów'
  if (count === 1) return '1 tytuł'
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${formatCount(count)} tytuły`
  }
  return `${formatCount(count)} tytułów`
}

export function ActorMoviesCatalog({
  slug,
  actor,
  movies,
  page,
  totalPages,
  moviesCount,
  limit,
  breadcrumb,
}: {
  slug: string
  actor: Actor
  movies: Movie[]
  page: number
  totalPages: number
  moviesCount: number
  limit: number
  breadcrumb: ReactNode
}) {
  const initials = actor.name
    .split(' ')
    .slice(0, 2)
    .map(n => n.charAt(0))
    .join('')

  const headingId = `actor-hero-${slug}`

  return (
    <div className="min-h-svh">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/5">
        {/* Subtle ambient glow behind avatar — purely decorative */}
        <div
          aria-hidden
          className="bg-white/3-3xl pointer-events-none absolute -top-32 left-0 h-96 w-96 rounded-full"
        />

        <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
          {/* Breadcrumb */}
          <div className="mb-8">{breadcrumb}</div>

          {/* Identity block: avatar + info side by side */}
          {page === 1 && (
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:gap-8">
              {/* Avatar — large, with layered ring effect */}
              <div className="relative shrink-0 self-start sm:self-end">
                {/* Outer glow ring */}
                <div
                  aria-hidden
                  className="absolute inset-[-3px] rounded-full bg-linear-to-br from-white/20 via-white/5 to-transparent"
                />
                {/* Ambient blur halo */}
                <div aria-hidden className="absolute -inset-4 rounded-full bg-white/5 blur-2xl" />
                <Avatar
                  size="lg"
                  className={cn(
                    'relative size-28! ring-1 ring-white/15 md:size-36!',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
                  )}
                >
                  <AvatarImage src={actor.avatar} alt={actor.name} className="object-cover object-top" />
                  <AvatarFallback className="text-2xl font-semibold tracking-wide">{initials}</AvatarFallback>
                </Avatar>
              </div>

              {/* Text info */}
              <div className="min-w-0 flex-1 space-y-3 pb-1">
                {/* Label */}
                <p className="text-[0.65rem] font-bold tracking-[0.22em] text-muted-foreground uppercase">
                  Aktor · Filmografia
                </p>

                {/* Name */}
                <h1
                  id={headingId}
                  className="text-3xl leading-[1.05] font-bold tracking-tight text-balance text-foreground md:text-4xl lg:text-5xl"
                >
                  {actor.name}
                </h1>

                {/* Description */}
                <p className="max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground md:text-[0.93rem]">
                  Filmy i seriale z udziałem {actor.name} — dostępne w katalogu Filmy7 do oglądania online w
                  jakości HD z polskimi napisami.
                </p>

                {/* Stats row */}
                {moviesCount > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                    {/* Count chip */}
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
                        'text-[0.65rem] font-bold tracking-[0.16em] uppercase',
                        'border border-white/10 bg-white/5 text-muted-foreground',
                      )}
                    >
                      <span className="inline-block size-1.5 rounded-full bg-white/40" />
                      {moviesCountHeadline(moviesCount)}
                    </span>

                    {/* Range */}
                    <span className="text-[0.72rem] text-muted-foreground tabular-nums">
                      {rangeLabel(page, limit, moviesCount)}
                    </span>
                  </div>
                )}

                {moviesCount === 0 && <p className="text-[0.8rem] text-muted-foreground">Brak tytułów</p>}
              </div>
            </div>
          )}
          {/* goest to hero page */}
        </div>

        {/* Bottom fade into page */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent"
        />
      </div>

      {/* ── Catalog grid ──────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-6xl min-w-0 px-6 py-10 lg:px-10 lg:py-12">
        {movies.length > 0 ? (
          <div
            id="actor-movies-grid"
            className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {movies.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} priority={index < 5} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-4xl opacity-20">🎬</p>
            <p className="text-sm text-muted-foreground">Brak tytułów</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <SmartPagination
              meta={{ currentPage: page, totalPages }}
              baseUrl={`/actor/${slug}`}
              extraQuery={buildFilmiPaginationQuery(DEFAULT_SORT as MovieCatalogSortValue, undefined) ?? undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}

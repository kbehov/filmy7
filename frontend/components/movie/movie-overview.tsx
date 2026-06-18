import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movies.types'
import { headlineTitle, isSeriesContent } from './lib'

export function MovieOverview({ movie }: { movie: Movie }) {
  const description = movie.description?.trim()
  if (!description) return null

  const title = headlineTitle(movie.title)
  const series = isSeriesContent(movie)

  return (
    <div id="overview" aria-labelledby="movie-overview-heading" className="scroll-mt-24">
      <p
        id="movie-overview-heading"
        className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase"
      >
        Fabuła
      </p>
      <p
        className={cn(
          'mt-4 max-w-3xl text-pretty',
          'text-[15px] leading-relaxed text-foreground/90 md:text-base md:leading-[1.75]',
        )}
      >
        {description}
      </p>
      <p className="sr-only">
        {title} — {series ? 'serial' : 'film'} do oglądania online na Filmi9.
      </p>
    </div>
  )
}

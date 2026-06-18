import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movies.types'
import Link from 'next/link'

function seasonsCountLabel(count: number): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n1 === 1 && n !== 11) return `${count} sezon`
  if (n1 >= 2 && n1 <= 4 && (n < 10 || n >= 20)) return `${count} sezony`
  return `${count} sezonów`
}

export function SeriesSeasonsStrip({ currentId, seasons }: { currentId: string; seasons: Movie[] }) {
  if (seasons.length <= 1) return null

  const chipLink = cn(
    'inline-flex items-center rounded-full border border-border/70 bg-card/50 px-3.5 py-1.5',
    'text-sm font-medium text-foreground/90 transition-colors',
    'hover:border-primary/30 hover:bg-card/90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  )

  return (
    <section
      id="seasons"
      aria-labelledby="series-seasons-heading"
      className="scroll-mt-28 rounded-2xl border border-border/50 bg-card/35 p-4 shadow-sm backdrop-blur-sm md:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="series-seasons-heading"
          className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase"
        >
          Sezony
        </h2>
        <p className="text-xs text-muted-foreground tabular-nums">{seasonsCountLabel(seasons.length)}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {seasons.map(s => {
          console.log(s)
          const active = s._id === currentId
          const n = s.seasson ? s.seasson : s.title
          const label = `Sezon ${n}`
          return active ? (
            <span
              key={s._id}
              className={cn(
                'inline-flex items-center rounded-full border border-primary/50 bg-primary/15 px-3.5 py-1.5',
                'text-sm font-medium text-foreground ',
              )}
              aria-current="page"
            >
              {label}
            </span>
          ) : (
            <Link key={s._id} href={`/serial/${s.slug}`} className={chipLink}>
              {label}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

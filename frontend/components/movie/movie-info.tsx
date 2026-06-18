import { countryName, productionCompanyLogoPath, productionCompanyName, tmdbImageUrl } from '@/lib/tmdb'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movies.types'
import Image from 'next/image'
import Link from 'next/link'
import { LANGUAGE_LABEL, formatMoney, formatRuntime } from './lib'

type Row = { label: string; value: React.ReactNode }

export function MovieInfo({ movie }: { movie: Movie }) {
  const rows: Row[] = []

  if (movie.year > 0) {
    rows.push({ label: 'Rok', value: movie.year })
  }
  if (movie.movieLength > 0) {
    rows.push({ label: 'Czas trwania', value: formatRuntime(movie.movieLength) })
  }
  if (movie.director?.trim()) {
    rows.push({ label: 'Reżyser', value: movie.director })
  }
  if (movie.genres?.length > 0) {
    rows.push({
      label: 'Gatunki',
      value: (
        <span className="flex flex-wrap gap-x-1 gap-y-0.5">
          {movie.genres.map((g, i) => (
            <span key={g.slug}>
              <Link href={`/genre/${g.slug}`} className="text-foreground underline-offset-4 hover:underline">
                {g.name}
              </Link>
              {i < movie.genres.length - 1 && (
                <span className="text-border" aria-hidden>
                  {' '}
                  ·{' '}
                </span>
              )}
            </span>
          ))}
        </span>
      ),
    })
  }
  if (movie.countries?.length > 0) {
    rows.push({
      label: 'Kraj',
      value: movie.countries.map(countryName).join(', '),
    })
  }
  if (movie.language) {
    rows.push({
      label: 'Język',
      value: LANGUAGE_LABEL[movie.language] ?? movie.language,
    })
  }
  if (movie.production_companies?.length > 0) {
    const list = movie.production_companies.slice(0, 3)
    rows.push({
      label: 'Produkcja',
      value: (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {list.map((c, i) => {
            const name = productionCompanyName(c)
            const logoUrl = tmdbImageUrl(productionCompanyLogoPath(c) ?? null, 'w92')
            return (
              <span key={i} className="inline-flex max-w-full items-center gap-2">
                {logoUrl ? (
                  <span className="relative h-6 w-18 shrink-0">
                    <Image src={logoUrl} alt="" fill sizes="90px" className="object-contain object-left" />
                  </span>
                ) : null}
                <span className="min-w-0 wrap-break-word">
                  {name}
                  {i < list.length - 1 ? (
                    <span className="text-border" aria-hidden>
                      {' '}
                      ·{' '}
                    </span>
                  ) : null}
                </span>
              </span>
            )
          })}
        </span>
      ),
    })
  }
  const budget = formatMoney(movie.budget)
  if (budget) rows.push({ label: 'Budżet', value: budget })
  const revenue = formatMoney(movie.revenue)
  if (revenue) rows.push({ label: 'Przychód', value: revenue })

  if (rows.length === 0) return null

  return (
    <div id="info" className="scroll-mt-28">
      <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">Informacje</p>
      <dl className={cn('mt-4 grid grid-cols-1 gap-x-10 gap-y-3 text-sm', 'sm:grid-cols-2 md:text-[15px]')}>
        {rows.map(row => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 border-b border-border/60 pb-3 sm:flex-row sm:items-baseline sm:gap-3 sm:border-b-0 sm:pb-0"
          >
            <dt className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:w-28 sm:text-[11px]">
              {row.label}
            </dt>
            <dd className="min-w-0 text-foreground/90">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

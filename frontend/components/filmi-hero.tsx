import { cn } from '@/lib/utils'
import Image from 'next/image'

export type FilmiHeroProps = {
  className?: string
  moviesCount: number
  pageSize: number
  title?: string
  description?: string
  headingId?: string
  backgroundImage?: string
}

function formatCount(n: number): string {
  return new Intl.NumberFormat('pl-PL').format(n)
}

function titlesCountLabel(count: number): string {
  if (count === 1) return '1 tytuł'
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${formatCount(count)} tytuły`
  }
  return `${formatCount(count)} tytułów`
}

export function FilmiHero({
  className,
  moviesCount,
  title = 'Filmy online',
  description = 'Przeglądaj katalog i wybierz tytuł do oglądania.',
  headingId = 'filmi-hero-heading',
  backgroundImage,
}: FilmiHeroProps) {
  const hasBackground = !!backgroundImage

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'relative w-full overflow-hidden',
        // Height: taller when we have a BG image, compact otherwise
        hasBackground ? 'min-h-[280px] md:min-h-[340px]' : 'py-4',
        className,
      )}
    >
      {/* ── Background image ──────────────────────────────────────────── */}
      {hasBackground && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Deep cinematic veil — heavier at bottom where content lives */}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/30"
          />

          {/* Left-side darkening so text is always legible */}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-r from-background/90 via-background/40 to-transparent"
          />

          {/* Film grain overlay — SVG feTurbulence noise baked as a data URI */}
          {}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
            }}
          />
        </>
      )}

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative z-10 flex h-full flex-col justify-end',
          hasBackground ? 'px-4 pt-20 pb-10 md:px-8 md:pb-14' : 'px-0',
        )}
      >
        {/* Count chip — floats above the title */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
              'text-[0.65rem] font-bold tracking-[0.18em] uppercase',
              'border border-border bg-background/5 text-muted-foreground',
              'backdrop-blur-sm',
            )}
          >
            {/* Pulsing dot */}
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-background/40 opacity-75 duration-2000" />
              <span className="relative inline-flex size-1.5 rounded-full bg-background/60" />
            </span>
            {titlesCountLabel(moviesCount)}
          </span>
        </div>

        {/* Title */}
        <h1
          id={headingId}
          className={cn('text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl', 'leading-[1.05]')}
        >
          {title}
        </h1>

        {/* Description */}
        <p className={cn('mt-3 max-w-md text-[0.9rem] leading-relaxed md:text-[0.95rem]', 'text-muted-foreground')}>
          {description}
        </p>
      </div>

      {/* ── Bottom border / fade-into-page ───────────────────────────── */}
      {hasBackground && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent"
        />
      )}
    </section>
  )
}

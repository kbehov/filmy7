import { cn } from '@/lib/utils'
import type { Genre } from '@/types/genre.types'
import Link from 'next/link'

function moviesCountLabel(count: number): string {
  if (count === 1) return '1 film'
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} filmy`
  }
  return `${count} filmów`
}

export type GenreCardProps = {
  genre: Genre
  className?: string
  priority?: boolean
}

const GenreCard = ({ genre, className }: GenreCardProps) => {
  const countLabel =
    typeof genre.moviesCount === 'number' && genre.moviesCount > 0 ? moviesCountLabel(genre.moviesCount) : null

  const hasDescription = !!genre.description?.trim()

  return (
    <Link
      href={`/genre/${genre.slug}`}
      className={cn(
        'group relative block outline-none',
        'rounded-2xl focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        className,
      )}
      title={hasDescription ? genre.description : genre.name}
    >
      {/* ── Card frame ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl',
          // Landscape ratio — genre tiles read better as wider tiles
          'aspect-video',
          // Subtle resting border
          'ring-1 ring-white/8',
          // Lift on hover
          'transition-all duration-350 ease-out',
          'group-hover:ring-white/20',
          'group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.65)]',
          'group-hover:scale-[1.025]',
        )}
      >
        {/* Background image — zooms slightly on hover */}
        {/* <Image
          src={genre.coverPhoto}
          alt={`Gatunek: ${genre.name}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
          priority={priority}
          className={cn(
            "object-cover object-center",
            "transition-transform duration-600 ease-out",
            "group-hover:scale-[1.07]"
          )}
        /> */}

        {/* Base darkening layer — always present */}
        <div
          aria-hidden
          className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/20"
        />

        {/* Left-to-right directional scrim — makes the name pop */}
        <div aria-hidden className="bg-linear-to-rrom-black/80 absolute inset-0 via-black/25 to-transparent" />

        {/* Bottom fade — anchors the name */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />

        {/* ── Movie count — top right ──────────────────────────────────── */}
        {countLabel && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-1',
                'text-[0.6rem] font-bold tracking-widest uppercase tabular-nums',
                'border border-white/10 bg-black/50 text-white/60',
                'backdrop-blur-md',
                'transition-colors duration-200 group-hover:border-white/20 group-hover:text-white/80',
              )}
            >
              {countLabel}
            </span>
          </div>
        )}

        {/* ── Name + description — bottom left ────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          {/* Description — hidden at rest, slides up on hover */}
          {hasDescription && (
            <p
              className={cn(
                'mb-1.5 line-clamp-2 max-w-[85%] text-[0.72rem] leading-snug text-white/70',
                // Translate + fade in on hover
                'translate-y-1 opacity-0 transition-all duration-300 ease-out',
                'group-hover:translate-y-0 group-hover:opacity-100',
              )}
            >
              {genre.description!.trim()}
            </p>
          )}

          <div className="flex items-end justify-between gap-2">
            <p
              className={cn(
                'line-clamp-2 text-lg leading-tight font-bold tracking-tight text-balance',
                'text-white',
                // Very subtle lift on hover
                'transition-transform duration-300 ease-out group-hover:-translate-y-px',
              )}
            >
              {genre.name}
            </p>

            {/* Arrow indicator — slides in from left on hover */}
            <span
              aria-hidden
              className={cn(
                'mb-0.5 shrink-0 text-white/0 transition-all duration-300 ease-out',
                'group-hover:translate-x-0 group-hover:text-white/60',
                '-translate-x-1',
              )}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="stroke-current"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </div>

          {/* Thin accent underline that expands on hover */}
          <div
            aria-hidden
            className={cn(
              'mt-2 h-px rounded-full bg-white/25',
              'origin-left scale-x-0 transition-transform duration-400 ease-out',
              'group-hover:scale-x-100',
            )}
          />
        </div>

        {/* Top-edge shimmer on hover */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-x-0 top-0 z-20 h-px',
            'bg-linear-to-r from-transparent via-white/20 to-transparent',
            'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          )}
        />
      </div>
    </Link>
  )
}

export default GenreCard

'use client'

import type { Movie } from '@/types/movies.types'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel'

// ─── utils ────────────────────────────────────────────────────────────────────

function formatRuntime(minutes: number): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} godz`
  return `${h} godz ${m} min`
}

// ─── empty state ──────────────────────────────────────────────────────────────

function EmptyCarousel() {
  return (
    <section
      aria-labelledby="featured-empty-heading"
      className="relative overflow-hidden rounded-[28px] border border-white/8 bg-zinc-950"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(220,38,38,0.15), transparent 55%)',
        }}
      />
      <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-3 px-8 py-16 text-center md:min-h-[420px]">
        <h2 id="featured-empty-heading" className="text-lg font-semibold tracking-tight text-white">
          Brak polecanych filmów
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
          Sprawdź ponownie później — selekcja jest regularnie aktualizowana.
        </p>
      </div>
    </section>
  )
}

// ─── constants ────────────────────────────────────────────────────────────────

const AUTOPLAY_INTERVAL = 5000

// ─── main component ───────────────────────────────────────────────────────────

const HomeCarousel = ({ movies }: { movies: Movie[] }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  // Tracks elapsed ms within the current slide to animate the progress bar
  const [progress, setProgress] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isHoveredRef = useRef(false)

  // ── helpers ──────────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
    intervalRef.current = null
    progressRef.current = null
  }, [])

  const startTimers = useCallback(() => {
    if (!api || !isPlaying) return
    clearTimers()
    setProgress(0)

    const tick = 50 // ms between progress ticks
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + (tick / AUTOPLAY_INTERVAL) * 100, 100))
    }, tick)

    intervalRef.current = setInterval(() => {
      if (!isHoveredRef.current) {
        api.scrollNext()
      }
    }, AUTOPLAY_INTERVAL)
  }, [api, isPlaying, clearTimers])

  // ── carousel sync ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap())
      setProgress(0)
    }
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  // ── autoplay lifecycle ────────────────────────────────────────────────────

  useEffect(() => {
    if (!api) return
    if (isPlaying) {
      setTimeout(() => startTimers(), 100)
    } else {
      setTimeout(() => clearTimers(), 100)
    }
    return () => clearTimers()
  }, [api, isPlaying, startTimers, clearTimers])

  // Pause when the tab is not visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        clearTimers()
      } else if (isPlaying) {
        startTimers()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [isPlaying, startTimers, clearTimers])

  // Keyboard navigation
  useEffect(() => {
    if (!api) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') api.scrollPrev()
      if (e.key === 'ArrowRight') api.scrollNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [api])

  if (!movies.length) return <EmptyCarousel />

  // ── interaction handlers ──────────────────────────────────────────────────

  const handleMouseEnter = () => {
    isHoveredRef.current = true
    clearTimers()
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    if (isPlaying) startTimers()
  }

  const handleFocus = () => {
    isHoveredRef.current = true
    clearTimers()
  }

  const handleBlur = () => {
    isHoveredRef.current = false
    if (isPlaying) startTimers()
  }

  // ── render ────────────────────────────────────────────────────────────────

  const activeMovie = movies[activeIndex]

  return (
    <section
      aria-label="Polecane filmy"
      className="w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Accessible live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeMovie ? `Slajd ${activeIndex + 1} z ${movies.length}: ${activeMovie.title}` : null}
      </div>

      <div className="relative w-full rounded-[28px]">
        <Carousel className="w-full" opts={{ loop: true, align: 'start' }} setApi={setApi}>
          <CarouselContent className="ml-0">
            {movies.map((movie, index) => {
              const genres =
                movie.genres
                  ?.slice(0, 2)
                  .map(g => g.name)
                  .join(' · ') ?? 'Akcja'
              const imdbScore = typeof movie.rating === 'number' ? movie.rating.toFixed(1) : '—'
              const metaParts = [movie.year > 0 ? String(movie.year) : null, formatRuntime(movie.movieLength)].filter(
                Boolean,
              )

              return (
                <CarouselItem key={movie._id} className="cursor-grab pl-0">
                  <div className="group relative h-[min(72vh,520px)] min-h-[380px] overflow-hidden rounded-[28px]">
                    {/* Poster */}
                    <Image
                      src={movie.coverPhoto || movie.movieImage}
                      alt={`Plakat: ${movie.title}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, min(1152px, 100vw)"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-[1.1s] motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
                    />

                    {/* Overlays */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-r from-black via-black/55 to-transparent"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/40"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.45)]"
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10 lg:p-12">
                      <div className="max-w-2xl space-y-5">
                        <p className="text-[11px] font-semibold tracking-[0.35em] text-red-400/90 uppercase">
                          Polecane
                        </p>

                        <div className="space-y-2">
                          <p className="text-3xl leading-[1.05] font-black tracking-[-0.02em] text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                            {movie.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-200/95">
                            {metaParts.length > 0 && (
                              <span className="font-medium text-zinc-100">{metaParts.join(' · ')}</span>
                            )}
                            <span className="hidden text-zinc-500 sm:inline" aria-hidden>
                              |
                            </span>
                            <span className="text-zinc-300">{genres}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/35 bg-amber-400/10 px-2 py-1 text-xs font-bold tracking-wide text-amber-100">
                            <span className="text-[10px] font-black text-amber-300/90">IMDb</span>
                            {imdbScore}
                          </span>
                          {movie.hasSubtitles && (
                            <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-zinc-200">
                              Napisy
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <Button
                            asChild
                            size="lg"
                            className="h-11 gap-2 rounded-2xl bg-red-600 px-6 text-white shadow-[0_12px_40px_-8px_rgba(220,38,38,0.55)] hover:bg-red-500"
                          >
                            <Link href={`/film/${movie.slug}`}>
                              <Play className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                              Oglądaj teraz
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>

        {/* ── Controls overlay ── */}
        <div className="pointer-events-none absolute inset-0 z-20 rounded-[28px]">
          {/* Pause / play toggle — top right */}
          <button
            aria-label={isPlaying ? 'Wstrzymaj automatyczne przewijanie' : 'Wznów automatyczne przewijanie'}
            onClick={() => setIsPlaying(p => !p)}
            className="pointer-events-auto absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65"
          >
            {isPlaying ? (
              <Pause className="size-3.5" strokeWidth={2} aria-hidden />
            ) : (
              <Play className="size-3.5" strokeWidth={2} aria-hidden />
            )}
          </button>

          {/* Prev / next — bottom right */}
          <div className="pointer-events-auto absolute right-4 bottom-5 flex items-center gap-2">
            <button
              aria-label="Poprzedni slajd"
              onClick={() => api?.scrollPrev()}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65 disabled:opacity-35"
            >
              <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
            </button>
            <button
              aria-label="Następny slajd"
              onClick={() => api?.scrollNext()}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65 disabled:opacity-35"
            >
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
            </button>
          </div>

          {/* Dot indicators — bottom center */}
          <div
            role="tablist"
            aria-label="Slajdy"
            className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
          >
            {movies.map((movie, i) => (
              <button
                key={movie._id}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Slajd ${i + 1}: ${movie.title}`}
                onClick={() => api?.scrollTo(i)}
                className={`h-[3px] cursor-pointer rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/65'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Autoplay progress bar — bottom edge ── */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 z-20 h-[2px] w-full overflow-hidden rounded-b-[28px] bg-white/10"
        >
          <div className="h-full bg-red-500 transition-none" style={{ width: `${isPlaying ? progress : 0}%` }} />
        </div>
      </div>
    </section>
  )
}

export default HomeCarousel

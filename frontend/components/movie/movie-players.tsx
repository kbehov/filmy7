'use client'

import { cn } from '@/lib/utils'
import type { Sources, VideoType } from '@/types/movies.types'
import { ChevronLeft, Play } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '../ui/button'
import { episodePlaybackUrl } from './lib'
import { isPlayEpisodeEvent, PLAY_EPISODE_EVENT } from './series-watch-events'

type MoviePlayersProps = {
  sources: Sources[]
  videoType: VideoType
  tmdb_id: number
  movieCover: string
  /** Used for cover image alt text and iframe title (accessibility). */
  movieTitle?: string
  /** Affects the default vsembed embed URL (TMDB movie vs TV). */
  embedKind?: 'movie' | 'tv'
}

export function MoviePlayers({
  sources,
  videoType,
  tmdb_id,
  movieCover,
  movieTitle,
  embedKind = 'movie',
}: MoviePlayersProps) {
  const fallbackSource = useMemo<Sources>(
    () => ({
      name: 'vsembed',
      url:
        embedKind === 'tv'
          ? `https://vsembed.su/embed/tv?tmdb=${tmdb_id}&ds_lang=bg`
          : `https://vsembed.su/embed/movie?tmdb=${tmdb_id}&ds_lang=bg`,
      _id: 'vsembed',
    }),
    [tmdb_id, embedKind],
  )

  const sourcesWithFallback = useMemo(() => [...sources, fallbackSource], [sources, fallbackSource])

  const [selectedSource, setSelectedSource] = useState<Sources>(() => {
    return sources[0] ?? fallbackSource
  })
  const [showPlayers, setShowPlayers] = useState(false)
  /** When set, iframe/video uses this URL (episode picked from list). */
  const [episodePlayback, setEpisodePlayback] = useState<{ url: string; episodeNumber: number } | null>(null)

  useEffect(() => {
    setEpisodePlayback(null)
  }, [tmdb_id, embedKind])

  useEffect(() => {
    const onPlayEpisode = (e: Event) => {
      if (!isPlayEpisodeEvent(e)) return
      const { episode, season, tmdbId } = e.detail
      const url = episodePlaybackUrl(episode, { tmdb_id: tmdbId, seasson: season }, embedKind)
      if (!url) return
      setEpisodePlayback({ url, episodeNumber: episode.episodeNumber })
      setShowPlayers(true)
      queueMicrotask(() => {
        document.getElementById('watch')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
    window.addEventListener(PLAY_EPISODE_EVENT, onPlayEpisode)
    return () => window.removeEventListener(PLAY_EPISODE_EVENT, onPlayEpisode)
  }, [embedKind])

  const coverAlt = movieTitle ? `Okładka: ${movieTitle}` : 'Okładka filmu'

  const iframeTitle = movieTitle
    ? `Odtwarzacz: ${movieTitle} — ${selectedSource.name}`
    : `Odtwarzacz online — ${selectedSource.name}`

  const handleSelectSource = useCallback((source: Sources) => {
    setEpisodePlayback(null)
    setSelectedSource(source)
    setShowPlayers(true)
  }, [])

  const handlePlay = useCallback(() => {
    setEpisodePlayback(null)
    setShowPlayers(true)
  }, [])

  const handleShowCover = useCallback(() => {
    setEpisodePlayback(null)
    setShowPlayers(false)
  }, [])

  const activeMediaUrl = episodePlayback?.url ?? selectedSource.url
  const activeMediaKey = episodePlayback ? `episode-${episodePlayback.episodeNumber}` : selectedSource._id

  return (
    <section id="watch" className="scroll-mt-28 space-y-4 md:space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
          Oglądaj online
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          Wybierz źródło za pomocą przycisków poniżej.
        </p>
        <p className="text-xs text-muted-foreground">
          Jeśli napisy się nie wyświetlają, naciśnij <strong>CC</strong>, aby wybrać napisy w języku polskim.
        </p>
      </div>

      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        role="toolbar"
        aria-label="Wybór źródła wideo"
      >
        <div className="flex min-h-9 flex-wrap gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sourcesWithFallback.map(source => {
            const selected = selectedSource._id === source._id
            return (
              <Button
                key={source._id}
                type="button"
                size="sm"
                variant={selected ? 'default' : 'outline'}
                aria-pressed={selected}
                className="shrink-0"
                onClick={() => handleSelectSource(source)}
              >
                {source.name}
              </Button>
            )
          })}
        </div>
        {showPlayers && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 self-start sm:self-auto"
            onClick={handleShowCover}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Wróć do okładki
          </Button>
        )}
      </div>

      <div
        className={cn(
          'relative isolate w-full overflow-hidden rounded-xl border-2 border-border bg-muted/20 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)] ring-1 ring-primary/15',
          'aspect-video max-h-[min(72vh,920px)]',
        )}
      >
        {!showPlayers && movieCover ? (
          <>
            <Image
              src={movieCover}
              alt={coverAlt}
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, min(1152px, 100vw)"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/40" aria-hidden />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Button
                type="button"
                size="lg"
                className="h-14 gap-2 rounded-full px-8 text-base shadow-lg"
                onClick={handlePlay}
              >
                <Play className="size-6 fill-current" aria-hidden />
                Odtwórz wideo
              </Button>
              <p className="max-w-sm text-sm text-pretty text-white/90">
                Źródło wybrane powyżej — kliknij, aby załadować odtwarzacz.
              </p>
            </div>
          </>
        ) : !showPlayers ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-4 bg-muted p-6 text-center">
            <p className="text-sm text-muted-foreground">Brak okładki do podglądu.</p>
            <Button type="button" size="lg" className="gap-2" onClick={handlePlay}>
              <Play className="size-5 fill-current" aria-hidden />
              Odtwórz wideo
            </Button>
          </div>
        ) : videoType === 'video' ? (
          <video
            key={activeMediaKey}
            className="h-full w-full bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            src={activeMediaUrl}
          >
            Ta przeglądarka nie obsługuje osadzonego wideo.
          </video>
        ) : (
          <iframe
            key={activeMediaKey}
            title={
              episodePlayback && movieTitle ? `${movieTitle} — odcinek ${episodePlayback.episodeNumber}` : iframeTitle
            }
            src={activeMediaUrl}
            className="h-full w-full bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
    </section>
  )
}

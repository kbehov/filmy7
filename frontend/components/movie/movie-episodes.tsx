"use client"

import { cn } from "@/lib/utils"
import type { Episode, Movie } from "@/types/movies.types"
import { Captions, Play } from "lucide-react"
import { formatEpisodeCount, isSeriesContent } from "./lib"
import { PLAY_EPISODE_EVENT } from "./series-watch-events"

export function MovieEpisodes({ movie }: { movie: Movie }) {
  if (!isSeriesContent(movie)) return null
  const episodes = (movie.episodes ?? []).slice().sort(
    (a, b) => a.episodeNumber - b.episodeNumber
  )
  if (episodes.length === 0) return null

  const season = movie.seasson > 0 ? movie.seasson : null
  const seasonForEmbed = movie.seasson > 0 ? movie.seasson : 1

  const handleEpisodeActivate = (episode: Episode) => {
    const detail = {
      episode,
      season: seasonForEmbed,
      tmdbId: movie.tmdb_id,
    }
    window.dispatchEvent(new CustomEvent(PLAY_EPISODE_EVENT, { detail }))
  }

  return (
    <section
      aria-labelledby="movie-episodes-heading"
      id="episodes"
      className="scroll-mt-28"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="movie-episodes-heading"
          className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase"
        >
          Odcinki
          {season !== null && (
            <span className="ml-2 font-normal tracking-normal text-muted-foreground/80 normal-case">
              · Sezon {season}
            </span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatEpisodeCount(episodes.length)}
        </p>
      </div>

      <ul
        className={cn(
          "mt-4 grid grid-cols-1 gap-2",
          "md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {episodes.map((ep) => {
          const hasSubs = (ep.subtitles?.length ?? 0) > 0
          return (
            <li key={ep.episodeNumber}>
              <button
                type="button"
                onClick={() => handleEpisodeActivate(ep)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-left",
                  "transition-colors hover:border-white/20 hover:bg-card/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "cursor-pointer"
                )}
              >
                <div
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md",
                    "border border-white/10 bg-black/40 text-foreground/80",
                    "transition-colors group-hover:border-primary/60 group-hover:text-primary"
                  )}
                >
                  <Play className="size-4 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    Odcinek {ep.episodeNumber}
                  </p>
                  {hasSubs && (
                    <p className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-muted-foreground">
                      <Captions className="size-3" aria-hidden />
                      Napisy
                    </p>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

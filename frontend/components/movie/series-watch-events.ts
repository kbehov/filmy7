import type { Episode } from '@/types/movies.types'

export const PLAY_EPISODE_EVENT = 'filmy7:play-episode' as const

export type PlayEpisodeDetail = {
  episode: Episode
  /** Season number used for embed URLs (minimum 1). */
  season: number
  tmdbId: number
}

export function isPlayEpisodeEvent(e: Event): e is CustomEvent<PlayEpisodeDetail> {
  return e.type === PLAY_EPISODE_EVENT && 'detail' in e && e.detail != null
}

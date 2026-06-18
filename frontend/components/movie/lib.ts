import type { Episode, Movie, Quality } from "@/types/movies.types"

/** Prefer the localized segment after " / " (common "original / BG" title pattern). */
export function headlineTitle(rawTitle: string): string {
  const parts = rawTitle
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) return parts[1]!
  return parts[0] ?? rawTitle.trim()
}

/** The "original" segment before " / " if present (otherwise null). */
export function originalTitle(rawTitle: string): string | null {
  const parts = rawTitle
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length >= 2 ? (parts[0] ?? null) : null
}

export function isSeriesContent(movie: Movie): boolean {
  if (movie.episodesCount > 0) return true
  return Array.isArray(movie.episodes) && movie.episodes.length > 0
}

/** Canonical URL `/serial/[slug]` — matches logic on serial/[slug]/page and film→serial redirect. */
export function isSerialWatch(movie: Movie): boolean {
  if (movie.contentType === 'series') return true
  return isSeriesContent(movie)
}

export function formatRuntime(minutes: number): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} godz`
  return `${h} godz ${m} min`
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("pl-PL").format(n)
}

/** Polish plural for “N odcinek/odcinki/odcinków”. */
export function formatEpisodeCount(n: number): string {
  const num = formatCount(n)
  const lastTwo = n % 100
  const last = n % 10
  if (last === 1 && lastTwo !== 11) return `${num} odcinek`
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return `${num} odcinki`
  return `${num} odcinków`
}

/**
 * URL for playing an episode: direct URL from API, or TV embed with season/episode.
 */
export function episodePlaybackUrl(
  episode: Episode,
  movie: Pick<Movie, "tmdb_id" | "seasson">,
  embedKind: "movie" | "tv",
): string | null {
  const direct = episode.videoUrl?.trim()
  if (direct) return direct
  for (const s of episode.sources ?? []) {
    const u = typeof s === "string" ? s.trim() : ""
    if (u.startsWith("http")) return u
  }
  if (embedKind === "tv" && movie.tmdb_id > 0) {
    const season = movie.seasson > 0 ? movie.seasson : 1
    return `https://vsembed.su/embed/tv?tmdb=${movie.tmdb_id}&season=${season}&episode=${episode.episodeNumber}&ds_lang=bg`
  }
  return null
}

export function formatMoney(usd: number): string | null {
  if (!usd || usd <= 0) return null
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd)
}

export const QUALITY_LABEL: Record<Quality, string> = {
  hd: "HD",
  cam: "CAM",
  ts: "TS",
  sd: "SD",
}

export const QUALITY_CLASS: Record<Quality, string> = {
  hd: "text-emerald-300 border-emerald-500/40 bg-emerald-950/60",
  cam: "text-amber-300 border-amber-500/40 bg-amber-950/60",
  ts: "text-yellow-300 border-yellow-500/40 bg-yellow-950/60",
  sd: "text-zinc-300 border-zinc-600/40 bg-zinc-900/60",
}

export const LANGUAGE_LABEL: Record<Movie["language"], string> = {
  en: "Angielski",
  bg: "Bułgarski",
  ru: "Rosyjski",
}

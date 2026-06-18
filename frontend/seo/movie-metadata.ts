import { headlineTitle, isSerialWatch } from '@/components/movie/lib'
import { seoBase, siteOrigin } from '@/seo/base'
import type { Movie } from '@/types/movies.types'
import type { Metadata } from 'next'

function buildTitle(movie: Movie): string {
  return `${movie.title} (${movie.year})`.trim()
}

function buildSeoTitle(movie: Movie, seasonInTitle?: number): string {
  const base = buildTitle(movie)
  if (seasonInTitle != null && seasonInTitle > 0) {
    return `${base} - Sezon ${seasonInTitle}`
  }
  return base
}

function buildDescription(movie: Movie, series: boolean): string {
  const raw = movie.description?.trim()
  if (raw) {
    const clean = raw.replace(/\s+/g, ' ')
    return clean.length > 220 ? `${clean.slice(0, 217).trimEnd()}…` : clean
  }
  const kind = series ? 'serial' : 'film'
  return `Oglądaj ${kind} «${movie.title}» online w HD z polskimi napisami na Filmy7 — bez rejestracji.`
}

function buildKeywords(movie: Movie, series: boolean): string[] {
  const head = headlineTitle(movie.title)
  const base = [head, `${head} online`, `${head} ${series ? 'serial' : 'film'}`, `${head} polskie napisy`, 'filmy7']
  const extra = (movie.keywords ?? []).filter(Boolean).slice(0, 10)
  const genres = (movie.genres ?? []).map(g => g.name).filter(Boolean)
  return Array.from(new Set([...base, ...extra, ...genres]))
}

export type BuildMovieMetadataOptions = {
  /** Defaults to `/film/${movie.slug}` */
  canonicalPath?: string
  /** When set, document title is `{title} (year) - season {n}` */
  seasonInTitle?: number
}

export function buildMovieMetadata(movie: Movie, options?: BuildMovieMetadataOptions): Metadata {
  const series = isSerialWatch(movie)
  const seasonInTitle = options?.seasonInTitle
  const title = buildSeoTitle(movie, seasonInTitle)
  const description = buildDescription(movie, series)
  const canonicalPath = options?.canonicalPath ?? `/film/${movie.slug}`
  const ogImage = movie.coverPhoto || movie.movieImage
  const head = headlineTitle(movie.title)
  const seasonKeywords =
    seasonInTitle != null && seasonInTitle > 0 ? [`${head} Sezon ${seasonInTitle}`, `Sezon ${seasonInTitle}`] : []

  return {
    title,
    description,
    keywords: Array.from(new Set([...buildKeywords(movie, series), ...seasonKeywords])),
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      ...seoBase.openGraph,
      type: series ? 'video.tv_show' : 'video.movie',
      url: `${siteOrigin}${canonicalPath}`,
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: [
                head,
                movie.year > 0 ? `(${movie.year})` : null,
                seasonInTitle != null && seasonInTitle > 0 ? `season ${seasonInTitle}` : null,
              ]
                .filter(Boolean)
                .join(' '),
            },
          ]
        : seoBase.openGraph?.images,
    },
    twitter: {
      ...seoBase.twitter,
      title,
      description,
      images: ogImage ? [{ url: ogImage, alt: head }] : seoBase.twitter?.images,
    },
    robots: { index: true, follow: true },
  }
}

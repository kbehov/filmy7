import { headlineTitle, isSerialWatch } from "@/components/movie/lib"
import { countryName, productionCompanyName } from "@/lib/tmdb"
import { siteOrigin } from "@/seo/base"
import type { Movie } from "@/types/movies.types"

/** ISO 8601 duration (e.g. 125 min -> PT2H5M). */
function isoDurationFromMinutes(minutes: number): string | undefined {
  if (!minutes || minutes <= 0) return undefined
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `PT${m}M`
  if (m === 0) return `PT${h}H`
  return `PT${h}H${m}M`
}

function resolveTrailerUrl(movie: Movie): string | undefined {
  const u = (movie.trailerUrl || movie.tailerUrl || "").trim()
  return u || undefined
}

function datePublishedValue(movie: Movie): string | undefined {
  if (movie.createdAt) {
    const d = new Date(movie.createdAt)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  if (movie.year > 0) return `${movie.year}-01-01`
  return undefined
}

export function MovieJsonLd({
  movie,
  canonicalPath,
  totalSeasonCount,
}: {
  movie: Movie
  /** e.g. `/serial/my-show-s2` — defaults to `/film/${slug}` */
  canonicalPath?: string
  /** Distinct seasons for this show (from API siblings); omit when unknown. */
  totalSeasonCount?: number
}) {
  const series = isSerialWatch(movie)
  const path = canonicalPath ?? `/film/${movie.slug}`
  const url = `${siteOrigin}${path}`
  const name = headlineTitle(movie.title)
  const images = [movie.coverPhoto, movie.movieImage].filter(Boolean)

  const actors = (movie.actors ?? []).map((a) => ({
    "@type": "Person",
    name: a.name,
    ...(a.avatar ? { image: a.avatar } : {}),
  }))

  const genres = (movie.genres ?? []).map((g) => g.name).filter(Boolean)

  const trailerResolved = resolveTrailerUrl(movie)

  const base = {
    "@context": "https://schema.org",
    "@type": series ? "TVSeries" : "Movie",
    "@id": `${url}#${series ? "series" : "movie"}`,
    url,
    name,
    alternateName: movie.title !== name ? movie.title : undefined,
    description: movie.description?.trim() || undefined,
    copyrightYear: movie.year,
    image: images.length > 0 ? images : undefined,
    inLanguage: "pl-PL",
    genre: genres.length > 0 ? genres : undefined,
    datePublished: datePublishedValue(movie),
    ...(trailerResolved
      ? {
          trailer: {
            "@type": "VideoObject",
            name: `${movie.title} — zwiastun`,
            description: `Zwiastun: ${movie.title}`,
            thumbnailUrl: movie.movieImage || movie.coverPhoto,
            uploadDate: movie.createdAt
              ? new Date(movie.createdAt).toISOString()
              : undefined,
            contentUrl: trailerResolved,
            embedUrl: trailerResolved,
          },
        }
      : {}),
    countryOfOrigin:
      movie.countries?.length > 0
        ? movie.countries.map((c) => ({
            "@type": "Country",
            name: countryName(c),
          }))
        : undefined,
    director: movie.director
      ? { "@type": "Person", name: movie.director }
      : undefined,
    actor: actors.length > 0 ? actors : undefined,
    productionCompany:
      movie.production_companies?.length > 0
        ? movie.production_companies.map((c) => ({
            "@type": "Organization",
            name: productionCompanyName(c),
          }))
        : undefined,
    keywords: movie.keywords?.length ? movie.keywords.join(", ") : undefined,
    ...(series
      ? {
          numberOfEpisodes:
            movie.episodesCount > 0 ? movie.episodesCount : undefined,
          ...(typeof totalSeasonCount === "number" && totalSeasonCount > 0
            ? { numberOfSeasons: totalSeasonCount }
            : {}),
        }
      : {
          duration: isoDurationFromMinutes(movie.movieLength),
        }),
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Główna",
        item: `${siteOrigin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: series ? "Seriale" : "Filmy",
        item: `${siteOrigin}${series ? "/seriali" : "/filmi"}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: `${siteOrigin}${path}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(base) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  )
}

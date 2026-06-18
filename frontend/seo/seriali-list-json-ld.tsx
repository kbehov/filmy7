import type { MovieCatalogSortValue } from "@/lib/movies-catalog"
import { siteOrigin } from "@/seo/base"
import { serialiListingHref } from "@/seo/seriali-list-metadata"
import type { Movie } from "@/types/movies.types"

function listMovieTitle(raw: string): string {
  const parts = raw
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) return parts[1]!
  return parts[0] ?? raw.trim()
}

function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${siteOrigin}${p}`
}

type SerialiListJsonLdProps = {
  movies: Movie[]
  page: number
  limit: number
  moviesCount: number
  sort: MovieCatalogSortValue
  year?: string
}

export function SerialiListJsonLd({
  movies,
  page,
  limit,
  moviesCount,
  sort,
  year,
}: SerialiListJsonLdProps) {
  const selfPath = serialiListingHref(page, sort, year)
  const selfUrl = absoluteUrl(selfPath)

  const breadcrumbItems: Record<string, unknown>[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Główna",
      item: absoluteUrl("/"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Seriale",
      item: absoluteUrl(serialiListingHref(1, sort, year)),
    },
  ]
  if (page > 1) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: `Strona ${page}`,
      item: selfUrl,
    })
  }

  const itemListElement = movies.map((m, i) => ({
    "@type": "ListItem",
    position: (page - 1) * limit + i + 1,
    item: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/serial/${m.slug}`),
      url: absoluteUrl(`/serial/${m.slug}`),
      name: listMovieTitle(m.title),
    },
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${selfUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
      {
        "@type": "CollectionPage",
        "@id": `${selfUrl}#collection`,
        url: selfUrl,
        name: "Seriale online",
        isPartOf: {
          "@type": "WebSite",
          name: "Filmy7",
          url: absoluteUrl("/"),
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: moviesCount,
          itemListElement,
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

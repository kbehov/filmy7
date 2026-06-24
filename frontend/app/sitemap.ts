import { siteOrigin } from '@/seo/base'
import { getSiteMap } from '@/services/movies.service'
import type { MetadataRoute } from 'next'

export const revalidate = 86400

const STATIC_PATHS: MetadataRoute.Sitemap = [
  { url: `${siteOrigin}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: `${siteOrigin}/filmy`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${siteOrigin}/seriale`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${siteOrigin}/trending`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${siteOrigin}/actors`, changeFrequency: 'weekly', priority: 0.8 },
  { url: `${siteOrigin}/genres`, changeFrequency: 'weekly', priority: 0.8 },
]

function lastMod(m: { updatedAt?: string | Date | null; createdAt?: string | Date | null }): Date {
  const raw = m.updatedAt ?? m.createdAt
  if (raw == null) return new Date()
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const movies = await getSiteMap()

    const filmEntries: MetadataRoute.Sitemap = movies
      .map(row => {
        const slug = row.slug?.trim()
        if (!slug) return null
        return {
          url: `${siteOrigin}/film/${slug}`,
          lastModified: lastMod(row),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }
      })
      .filter((e): e is NonNullable<typeof e> => e != null)

    return [...STATIC_PATHS, ...filmEntries]
  } catch {
    return STATIC_PATHS
  }
}

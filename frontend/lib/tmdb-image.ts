const TMDB_IMAGE_HOST = 'image.tmdb.org'

/** TMDB "w*" sizes; w500 is a good balance for grid posters (~2× typical card width). */
export function tmdbPosterUrlForGrid(url: string, size: 'w342' | 'w500' = 'w500'): string {
  if (!url) return url
  try {
    const u = new URL(url, `https://${TMDB_IMAGE_HOST}`)
    if (u.hostname !== TMDB_IMAGE_HOST) return url
    const segments = u.pathname.split('/').filter(Boolean)
    if (segments.length < 4 || segments[0] !== 't' || segments[1] !== 'p') return url
    segments[2] = size
    u.pathname = `/${segments.join('/')}`
    return u.href
  } catch {
    return url
  }
}

export function isTmdbImageUrl(url: string): boolean {
  if (!url) return false
  try {
    return new URL(url).hostname === TMDB_IMAGE_HOST
  } catch {
    return false
  }
}

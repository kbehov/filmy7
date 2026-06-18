import apiClient from '@/api/client'
import { MOVIES_ROUTES } from '@/api/routes'
import { DEFAULT_LIMIT, DEFAULT_SORT, DEFAULT_TYPE } from '@/config/defaults.config'
import type { GetMoviesResponse, Movie } from '@/types/movies.types'

export type MoviesListQueryInput = {
  /** Defaults to `movie` when omitted (matches `buildMoviesListQuery`). */
  contentType?: 'movie' | 'series'
  page: number
  limit?: number
  sort?: string
  type?: string
  year?: string | number | null | undefined
  /** Genre document id for `GET /movies?genres=...` */
  genres?: string
  /** When true, requests `isBgAudio=true` (Bulgarian audio). */
  isBgAudio?: boolean
}

export type ActorMoviesListQueryInput = {
  actorId: string
  page: number
  limit?: number
}

/** Query string for `GET /movies` filtered by actor (`actors` id). */
export function buildActorMoviesListQuery(input: ActorMoviesListQueryInput): string {
  const limit = input.limit ?? DEFAULT_LIMIT
  const page = Math.max(1, Number(input.page) || 1)

  const id = input.actorId.trim()
  const params = new URLSearchParams()
  params.set('actors', id)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return `?${params.toString()}`
}

/** Builds the query string for `GET /movies` (page, limit, sort, type, optional year). */
export function buildMoviesListQuery(input: MoviesListQueryInput): string {
  const limit = input.limit ?? DEFAULT_LIMIT
  const sort = (input.sort?.trim() || DEFAULT_SORT) as string
  const type = input.type ?? DEFAULT_TYPE
  const page = Math.max(1, Number(input.page) || 1)
  const contentType = input.contentType ?? 'movie'
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  params.set('sort', sort)
  params.set('type', type)
  params.set('contentType', contentType)
  if (input.year != null && String(input.year).trim() !== '') {
    const y = typeof input.year === 'number' ? input.year : parseInt(String(input.year), 10)
    if (!Number.isNaN(y)) params.set('year', String(y))
  }
  const gid = input.genres?.trim()
  if (gid) params.set('genres', gid)
  if (input.isBgAudio) params.set('isBgAudio', 'true')
  return `?${params.toString()}`
}

export const getMovies = async (query: string): Promise<GetMoviesResponse> => {
  const response = await apiClient.get(MOVIES_ROUTES.GET_ALL_MOVIES + query, {
    next: {
      revalidate: 10 * 60, // 10 minutes
    },
  })
  return response as GetMoviesResponse
}

export const getMovieBySlug = async (slug: string): Promise<Movie> => {
  const response = await apiClient.get(MOVIES_ROUTES.GET_MOVIE_BY_SLUG.replace(':slug', slug), {
    next: {
      revalidate: 60 * 60, // 1 hour
    },
  })
  return response as Movie
}

export const getFeauturedMoives = async (): Promise<GetMoviesResponse> => {
  const currentYear = new Date().getFullYear()
  const query = `?page=1&limit=6&sort=-createdAt,-views&contentType=movie&year=${currentYear}`
  const response = await apiClient.get(MOVIES_ROUTES.GET_ALL_MOVIES + query, {
    next: {
      // Match `getMovies` / nginx `proxy_cache_valid` HTML TTL so the home page can refresh with listings.
      revalidate: 10 * 60, // 10 minutes
    },
  })
  return response as GetMoviesResponse
}

/** Backend `/movies/search/` returns `{ pagination, results }`, not `GetMoviesResponse`. */
type SearchMoviesApiPayload = {
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number
  }
  results?: Movie[]
}

export function buildSearchMoviesQuery(term: string, page: number, limit: number = DEFAULT_LIMIT): string {
  const t = term.trim()
  const pageStr = String(Math.max(1, page))
  const limitStr = String(limit)
  // Use encodeURIComponent (%20) instead of URLSearchParams (+) — some WAF/nginx
  // rules block query strings with literal '+' and return an HTML error page.
  return `?term=${encodeURIComponent(t)}&page=${encodeURIComponent(pageStr)}&limit=${encodeURIComponent(limitStr)}`
}

export const searchMovies = async (query: string): Promise<GetMoviesResponse> => {
  const raw = await apiClient.get<SearchMoviesApiPayload>(MOVIES_ROUTES.SEARCH_MOVIE + query, { cache: 'no-store' })
  const p = raw.pagination
  return {
    data: raw.results ?? [],
    moviesCount: p?.total ?? 0,
    totalPages: Math.max(1, p?.pages ?? 1),
    page: p?.page ?? 1,
    limit: p?.limit ?? DEFAULT_LIMIT,
  }
}

export const getSimilarMovies = async (
  genres: string[],
  year: number,
  rating: number,
  id: string,
  query: string,
): Promise<Movie[]> => {
  const url = `${MOVIES_ROUTES.SIMILAR_MOVIES}${id}${query}`
  const response = await apiClient.post<Movie[]>(
    url,
    { genres, year, rating },
    {
      next: {
        revalidate: 60 * 60 * 24, // 24 hours
      },
    },
  )

  return response as Movie[]
}

export const getSiteMap = async (): Promise<Movie[]> => {
  const response = await apiClient.get(MOVIES_ROUTES.GET_SITE_MAP, {
    next: { revalidate: 86400 },
  })
  return response as Movie[]
}

export const getSeriesSiteMap = async (): Promise<Movie[]> => {
  const response = await apiClient.get(MOVIES_ROUTES.GET_SERIES_SITE_MAP, {
    next: { revalidate: 86400 },
  })
  return response as Movie[]
}

type SeriesSeasonsResponse = { data: Movie[] }

export const getSeriesSeasons = async (id: string): Promise<Movie[]> => {
  const response = await apiClient.get<SeriesSeasonsResponse>(MOVIES_ROUTES.GET_SERIES_SEASONS + id, {
    next: { revalidate: 60 * 60 },
  })
  return response.data ?? []
}

export const viewMovie = async (id: string): Promise<Movie> => {
  const response = await apiClient.post(MOVIES_ROUTES.VIEW_MOVIE + id)
  return response as Movie
}

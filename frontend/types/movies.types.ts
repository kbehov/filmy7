export type VideoType = 'video' | 'iframe'
export type Quality = 'hd' | 'cam' | 'ts' | 'sd'
export type Episode = {
  episodeNumber: number
  videoUrl: string
  sources: string[]
  subtitles: string[]
}
export type ProductionCompany = {
  id: number
  name: string
  logo_path: string | null
  origin_country?: string
}
export type MovieCountry = {
  iso_3166_1: string
  name: string
}
type MovieGenres = {
  _id: string
  name: string
  slug: string
}
type Actor = {
  name: string
  avatar: string
  slug: string
}
export type Sources = {
  name: string
  url: string
  _id: string
}
export type Movie = {
  original_title: string
  _id: string
  id: string
  title: string
  slug: string
  movieImage: string
  coverPhoto: string
  year: number
  rating: number
  tmdb_id: number
  imdb_id: string
  production_companies: (string | ProductionCompany)[]
  countries: (string | MovieCountry)[]
  revenue: number
  movieLength: number
  budget: number
  videoType: VideoType
  language: 'en' | 'bg' | 'ru'
  quality: 'hd' | 'cam' | 'ts' | 'sd'
  scrapedFrom: string
  hasSubtitles: boolean
  isBgAudio: boolean
  episodes: Episode[]
  episodesCount: number
  seasson: number
  contentType: 'movie' | 'series'
  /** Set when a series episode is added; JSON APIs usually serialize this as a string. */
  lastAddedEpisodeDate: Date | string | null
  description: string
  director: string
  keywords: string[]
  genres: MovieGenres[]
  subtitles: string[]
  actors: Actor[]
  createdAt: Date | string | null
  trailerUrl: string
  sources: Sources[]
  tailerUrl: string
}
export type GetMoviesResponse = {
  data: Movie[]
  moviesCount: number
  totalPages: number
  page: number
  limit: number
}

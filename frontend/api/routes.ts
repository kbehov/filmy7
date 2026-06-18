export const MOVIES_ROUTES = {
  GET_ALL_MOVIES: '/movies',
  GET_MOVIE_BY_SLUG: '/movie/:slug',
  GET_MOVIE_BY_ID: '/api/v1/movies/',
  CREATE_MOVIE: '/api/v1/movies',
  UPDATE_MOVIE: '/api/v1/movies/',
  DELETE_MOVIE: '/api/v1/movies/',
  SEARCH_MOVIE: '/movies/search/',
  SIMILAR_MOVIES: '/movies/recommend/',
  GET_SITE_MAP: '/movies/site-map',
  GET_SERIES_SITE_MAP: '/movies/series-sitemap',
  GET_SERIES_SEASONS: '/movies/series-seasons/',
  VIEW_MOVIE: '/api/v/1/movies/views/',
}
export const GENRES_ROUTES = {
  GET_ALL_GENRES: '/genres/',
  GET_GENRE_BY_SLUG: '/genre/:slug',
}

export const ACTORS_ROUTES = {
  GET_ALL_ACTORS: '/actors/',
  GET_ACTOR_BY_SLUG: '/actor/',
}

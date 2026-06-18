export type Genre = {
  _id: string
  name: string
  slug: string
  moviesCount: number
  coverPhoto: string
  description: string
}
export type GetGenresResponse = Genre[]
export type GetGenreResponse = Genre

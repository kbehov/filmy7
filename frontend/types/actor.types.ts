export type GetActorsResponse = {
  data: Actor[]
  count: number
  totalPages: number
  page: number
  limit: number
}

export type GetActorResponse = {
  _id: string
  name: string
  avatar: string
  slug: string
  moviesCount: number
}

export type Actor = {
  name: string
  avatar: string
  slug: string
  moviesCount: number
  _id: string
}

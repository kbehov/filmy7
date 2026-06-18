import apiClient from "@/api/client"
import { GENRES_ROUTES } from "@/api/routes"
import { GetGenreResponse, GetGenresResponse } from "@/types/genre.types"

export const getGenres = async (query: string): Promise<GetGenresResponse> => {
  const response = await apiClient.get(GENRES_ROUTES.GET_ALL_GENRES + query, {
    next: {
      revalidate: 12 * 60 * 60, // 24 hours
    },
  })
  return response as GetGenresResponse
}

export const getGenreBySlug = async (
  slug: string
): Promise<GetGenreResponse> => {
  const response = await apiClient.get(
    GENRES_ROUTES.GET_GENRE_BY_SLUG.replace(":slug", slug),
    {
      next: {
        revalidate: 12 * 60 * 60, // 24 hours
      },
    }
  )
  return response as GetGenreResponse
}

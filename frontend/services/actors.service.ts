import apiClient from "@/api/client"
import { ACTORS_ROUTES } from "@/api/routes"
import type {
  Actor,
  GetActorResponse,
  GetActorsResponse,
} from "@/types/actor.types"
import { cache } from "react"

/** One HTTP request per query per request/render; `generateMetadata` + page share the same result. */
export const getAllActors = cache(async (query: string): Promise<GetActorsResponse> => {
  const response = await apiClient.get(ACTORS_ROUTES.GET_ALL_ACTORS + query, {
    next: { revalidate: 5 * 60 },
  })
  return response as GetActorsResponse
})

/** Loads a single actor or triggers `notFound()` when the API returns nothing. */
export async function getActorBySlug(slug: string): Promise<Actor> {
  const response = (await apiClient.get(
    ACTORS_ROUTES.GET_ACTOR_BY_SLUG + slug,
    {
      next: {
        revalidate: 5 * 60,
      },
    }
  )) as GetActorResponse | null

  return response as Actor
}

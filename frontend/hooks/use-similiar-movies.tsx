import { getSimilarMovies } from "@/services/movies.service"
import type { Movie } from "@/types/movies.types"
import { useCallback, useEffect, useMemo, useState } from "react"

const SIMILAR_MOVIES_LIMIT = 20

const useSimiliarMovies = (
  genres: string[],
  year: number,
  rating: number,
  id: string
) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const genresKey = [...genres].sort((a, b) => a.localeCompare(b)).join("|")

  const identityKey = `${id}|${genresKey}|${year}|${rating}`
  const [storedIdentity, setStoredIdentity] = useState(identityKey)

  if (storedIdentity !== identityKey) {
    setStoredIdentity(identityKey)
    setPage(1)
    setMovies([])
    setHasMore(true)
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      const queryString = `?page=${page}&limit=${SIMILAR_MOVIES_LIMIT}`
      try {
        const response = await getSimilarMovies(genres, year, rating, id, queryString)
        if (cancelled) return
        setMovies((prev) => (page === 1 ? response : [...prev, ...response]))
        setHasMore(response.length === SIMILAR_MOVIES_LIMIT)
      } catch (error) {
        if (!cancelled) console.error(error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // genres tracked via genresKey so the effect does not re-run when the parent passes a new array with the same genre ids
    // eslint-disable-next-line react-hooks/exhaustive-deps -- genresKey + latest genres in closure for the POST body
  }, [id, genresKey, year, rating, page])

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1)
  }, [])

  return useMemo(
    () => ({ movies, isLoading, handleLoadMore, hasMore }),
    [movies, isLoading, handleLoadMore, hasMore]
  )
}

export default useSimiliarMovies

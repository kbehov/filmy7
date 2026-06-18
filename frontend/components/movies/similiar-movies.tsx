'use client'
import useSimiliarMovies from '@/hooks/use-similiar-movies'
import MovieCard from '../cards/movie-card'
import { Button } from '../ui/button'

const SimilarMovies = ({
  id,
  genres,
  year,
  rating,
  eyebrow = 'Więcej',
  title = 'Podobne filmy',
  description = 'Selekcja według gatunków i roku — możesz kontynuować oglądanie.',
}: {
  id: string
  genres: string[]
  year: number
  rating: number
  /** Small uppercase label above the title (design system alignment). */
  eyebrow?: string
  title?: string
  description?: string
}) => {
  const { movies, isLoading, handleLoadMore, hasMore } = useSimiliarMovies(genres, year, rating, id)

  return (
    <section aria-labelledby="similar-movies-heading" className="scroll-mt-28 border-t border-border/50 pt-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">{eyebrow}</p>
          <h2
            id="similar-movies-heading"
            className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl"
          >
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {movies.map(movie => (
            <MovieCard key={movie.id ?? movie._id} movie={movie} />
          ))}
        </div>
        {hasMore ? (
          <Button onClick={handleLoadMore} disabled={isLoading || !hasMore} className="w-full " variant="secondary">
            {isLoading ? 'Ładowanie…' : 'Pokaż więcej'}
          </Button>
        ) : null}
      </div>
    </section>
  )
}

export default SimilarMovies

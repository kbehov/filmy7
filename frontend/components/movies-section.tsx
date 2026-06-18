import type { Movie } from "@/types/movies.types"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import MovieCard from "./cards/movie-card"
import { Button } from "./ui/button"
type MoviesSectionProps = {
  movies: Movie[]
  title: string
  href: string
  description: string
  icon: React.ReactNode
}

const MoviesSection = ({
  movies,
  title,
  description,
  href,
  icon,
}: MoviesSectionProps) => {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Button asChild variant="outline" aria-label="Zobacz wszystkie">
          <Link href={href}>
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </section>
  )
}

export default MoviesSection

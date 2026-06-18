import GenreCard from "@/components/cards/genre-card"
import { buildGenresIndexMetadata } from "@/seo/genres-index-metadata"
import { getGenres } from "@/services/genres.service"
import type { Metadata } from "next"
import { cache } from "react"

const getGenresForPage = cache(() => getGenres("?limit=30"))

export async function generateMetadata(): Promise<Metadata> {
  const genres = await getGenresForPage()
  return buildGenresIndexMetadata({ genresCount: genres.length })
}

export default async function Page() {
  const genres = await getGenresForPage()
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <header className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Katalog
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Film na każdy nastrój
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Gatunek nadaje nastrój — od napiętego thrillera po lekką komedię.
            Wybierz kategorię i przejdź do selekcji filmów i seriali na
            Filmy7 — oglądaj online w HD z polskimi napisami.
          </p>
        </header>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {genres.map((genre, index) => (
            <GenreCard
              key={genre._id}
              genre={genre}
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

import HomeCarousel from '@/components/home-carousel'
import MoviesSection from '@/components/movies-section'
import { HomeJsonLd } from '@/seo/home-json-ld'
import { getFeauturedMoives, getMovies } from '@/services/movies.service'
import { Camera, Tv } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Filmy7 — oglądaj filmy online' },
  description:
    'Oglądaj filmy online: najnowsze premiery i hity w HD z lektorem i napisami — wygodny katalog na filmy7.com.',
}

export default async function Page() {
  const featuredMovies = await getFeauturedMoives()
  const movies = await getMovies('?page=1&limit=12&sort=-createdAt&contentType=movie')
  const series = await getMovies('?page=1&limit=12&sort=-createdAt&contentType=series')

  return (
    <>
      <HomeJsonLd />
      <div className="min-h-svh p-6 lg:p-10">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 lg:gap-8">
          <h1 className="mx-auto text-center text-2xl font-bold tracking-tight">Oglądaj filmy online</h1>
          {featuredMovies.data.length > 0 && <HomeCarousel movies={featuredMovies.data} />}
          <MoviesSection
            movies={movies.data}
            title="Filmy"
            href="/filmi"
            description="Najświeższe filmy w katalogu — wybierz tytuł i oglądaj od razu"
            icon={<Camera />}
          />
          <MoviesSection
            movies={series.data}
            title="Seriale"
            href="/seriali"
            description="Nowe sezony i ulubione seriale na domowy maraton"
            icon={<Tv />}
          />
        </div>
      </div>
    </>
  )
}

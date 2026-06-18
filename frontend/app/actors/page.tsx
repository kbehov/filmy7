import ActorCard from '@/components/cards/actor-card'
import SmartPagination from '@/components/ui/smart-pagination'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/config/defaults.config'
import { seoBase } from '@/seo/base'
import { getAllActors } from '@/services/actors.service'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const actors = await getAllActors(`?page=${DEFAULT_PAGE}&limit=${DEFAULT_LIMIT}&sort=-moviesCount`)

  const count = actors.count ?? 0
  const countFragment = count > 0 ? ` Ponad ${new Intl.NumberFormat('pl-PL').format(count)} aktorów w katalogu.` : ''
  const title = 'Aktorzy'
  const description =
    `Aktorzy na Filmy7 według popularności i filmografii.${countFragment} Wybierz aktora i oglądaj filmy online w HD z polskimi napisami.`.replace(
      /\s+/g,
      ' ',
    )
  const canonicalPath = '/actors'
  return {
    title,
    description,
    keywords: ['aktorzy', 'filmografia', 'filmy z aktorami', 'filmy online', 'filmy7'],
    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      ...seoBase.openGraph,
      url: canonicalPath,
      title,
      description,
    },
    twitter: {
      ...seoBase.twitter,
      title,
      description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function ActorsPage() {
  const actors = await getAllActors(`?page=${DEFAULT_PAGE}&limit=${DEFAULT_LIMIT}&sort=-moviesCount`)
  return (
    <div className="min-h-svh space-y-8 p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <div>
          <h1 className="text-2xl font-bold">Aktorzy</h1>
          <p className="text-sm text-muted-foreground">
            Posortowane według liczby tytułów w katalogu — wybierz aktora i przejdź do filmografii.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {actors.data.map(actor => (
            <ActorCard key={actor._id} actor={actor} />
          ))}
        </div>
      </div>
      <SmartPagination meta={{ currentPage: actors.page, totalPages: actors.totalPages }} baseUrl="/actors" />
    </div>
  )
}

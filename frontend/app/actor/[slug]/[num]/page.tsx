import { ActorMoviesCatalog } from '@/components/actors/actor-movies-catalog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DEFAULT_LIMIT } from '@/config/defaults.config'
import { getActorBySlug } from '@/services/actors.service'
import { buildActorMoviesListQuery, getMovies } from '@/services/movies.service'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

function formatCount(n: number): string {
  return new Intl.NumberFormat('pl-PL').format(n)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; num: string }>
}): Promise<Metadata> {
  const { slug, num } = await params
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const actor = await getActorBySlug(slug)
  const { moviesCount, totalPages } = await getMovies(
    buildActorMoviesListQuery({ actorId: actor._id, page: pageNum <= 1 ? 1 : pageNum }),
  )
  if (totalPages > 0 && pageNum > totalPages) {
    notFound()
  }
  if (pageNum <= 1) {
    return {
      title: `${actor.name} — filmografia`,
      description: `Filmy i seriale z udziałem ${actor.name}: ${formatCount(moviesCount)} tytułów online na Filmy7 w HD z polskimi napisami.`,
      alternates: { canonical: `/actor/${slug}` },
      robots: { index: true, follow: true },
    }
  }
  const canonicalPath = `/actor/${slug}/${pageNum}`
  const pagination: { previous?: string; next?: string } = {}
  if (pageNum > 1) {
    pagination.previous = pageNum === 2 ? `/actor/${slug}` : `/actor/${slug}/${pageNum - 1}`
  }
  if (pageNum < totalPages) {
    pagination.next = `/actor/${slug}/${pageNum + 1}`
  }
  const hasPaginationRel =
    pagination.previous !== undefined || pagination.next !== undefined
  return {
    title: `${actor.name} — filmografia · strona ${pageNum}`,
    description: `Filmy i seriale z udziałem ${actor.name}: ${formatCount(moviesCount)} tytułów online na Filmy7 w HD z polskimi napisami. Strona ${pageNum}.`,
    alternates: {
      canonical: canonicalPath,
    },
    ...(hasPaginationRel ? { pagination } : {}),
    robots: { index: true, follow: true },
  }
}

export default async function ActorPaginatedPage({
  params,
}: {
  params: Promise<{ slug: string; num: string }>
}) {
  const { slug, num } = await params
  const actor = await getActorBySlug(slug)
  const limit = DEFAULT_LIMIT
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  if (pageNum <= 1) {
    permanentRedirect(`/actor/${slug}`)
  }
  const {
    data: movies,
    moviesCount,
    totalPages,
  } = await getMovies(buildActorMoviesListQuery({ actorId: actor._id, page: pageNum }))
  if (pageNum > totalPages) notFound()

  return (
    <ActorMoviesCatalog
      slug={slug}
      actor={actor}
      movies={movies}
      page={pageNum}
      totalPages={totalPages}
      moviesCount={moviesCount}
      limit={limit}
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/actors">Aktorzy</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{actor.name}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Strona {num}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    />
  )
}

import { ActorMoviesCatalog } from "@/components/actors/actor-movies-catalog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getActorBySlug } from "@/services/actors.service"
import { buildActorMoviesListQuery, getMovies } from "@/services/movies.service"
import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"

function formatCount(n: number): string {
  return new Intl.NumberFormat("pl-PL").format(n)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const actor = await getActorBySlug(slug)

  const { moviesCount } = await getMovies(
    buildActorMoviesListQuery({ actorId: actor._id, page: 1 })
  )
  return {
    title: `${actor.name} — filmografia`,
    description: `Filmy i seriale z udziałem ${actor.name}: ${formatCount(moviesCount)} tytułów online na Filmy7 w HD z polskimi napisami.`,
    alternates: {
      canonical: `/actor/${slug}`,
    },
  }
}

export default async function ActorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; year?: string; page?: string }>
}) {
  const { slug } = await params
  const actor = await getActorBySlug(slug)
  const sp = await searchParams

  const queryPageNum = Math.max(1, parseInt(sp.page ?? "1", 10))
  if (queryPageNum > 1) {
    permanentRedirect(`/actor/${slug}/${queryPageNum}`)
  }
  const {
    data: movies,
    totalPages,
    page,
    moviesCount,
    limit,
  } = await getMovies(
    buildActorMoviesListQuery({
      actorId: actor._id,
      page: 1,
    })
  )

  return (
    <ActorMoviesCatalog
      slug={slug}
      actor={actor}
      movies={movies}
      page={page}
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
          </BreadcrumbList>
        </Breadcrumb>
      }
    />
  )
}

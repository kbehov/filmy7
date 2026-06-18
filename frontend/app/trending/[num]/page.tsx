import MovieCard from "@/components/cards/movie-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import SmartPagination from "@/components/ui/smart-pagination"
import {
  buildTrendingListingMetadata,
  TRENDING_LIST_SORT,
} from "@/seo/trending-list-metadata"
import { buildMoviesListQuery, getMovies } from "@/services/movies.service"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ num: string }>
}): Promise<Metadata> {
  const { num } = await params
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const { totalPages, moviesCount } = await getMovies(
    buildMoviesListQuery({
      contentType: "movie",
      page: pageNum,
      sort: TRENDING_LIST_SORT,
    })
  )
  return buildTrendingListingMetadata({
    page: pageNum,
    totalPages,
    moviesCount,
  })
}

export default async function Page({
  params,
}: {
  params: Promise<{ num: string }>
}) {
  const { num } = await params
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const {
    data: movies,
    totalPages,
    page,
  } = await getMovies(
    buildMoviesListQuery({
      contentType: "movie",
      page: pageNum,
      sort: TRENDING_LIST_SORT,
    })
  )

  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 lg:gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/trending">
                Popularne filmy
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Strona {num}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: page, totalPages }}
          baseUrl="/trending"
        />
      </div>
    </div>
  )
}

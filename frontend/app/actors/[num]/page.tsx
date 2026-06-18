import ActorCard from "@/components/cards/actor-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import SmartPagination from "@/components/ui/smart-pagination"
import { DEFAULT_LIMIT } from "@/config/defaults.config"
import { getAllActors } from "@/services/actors.service"
import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ num: string }>
}): Promise<Metadata> {
  const { num } = await params
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  const canonicalPath = pageNum <= 1 ? "/actors" : `/actors/${pageNum}`

  return {
    title: pageNum <= 1 ? "Aktorzy" : `Aktorzy · strona ${pageNum}`,
    description:
      pageNum <= 1
        ? `Aktorzy na Filmy7 według popularności i filmografii. Wybierz aktora i przejdź do filmografii.`
        : `Aktorzy na Filmy7 według popularności i filmografii. Strona ${pageNum}. Wybierz aktora i przejdź do filmografii.`,
    alternates: {
      canonical: canonicalPath,
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ num: string }>
}) {
  const { num } = await params
  const pageNum = Math.max(1, parseInt(num, 10) || 1)
  if (pageNum <= 1) {
    permanentRedirect("/actors")
  }
  const actors = await getAllActors(
    `?page=${pageNum}&limit=${DEFAULT_LIMIT}&sort=-moviesCount`
  )
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 lg:gap-8">
        <div>
          <h1 className="text-2xl font-bold">Aktorzy</h1>
          <p className="text-sm text-muted-foreground">
            Posortowane według liczby tytułów w katalogu — wybierz aktora i przejdź do filmografii.
          </p>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/actors">Aktorzy</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Strona {pageNum}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {actors.data.map((actor) => (
            <ActorCard key={actor._id} actor={actor} />
          ))}
        </div>
        <SmartPagination
          meta={{ currentPage: actors.page, totalPages: actors.totalPages }}
          baseUrl="/actors"
        />
      </div>
    </div>
  )
}

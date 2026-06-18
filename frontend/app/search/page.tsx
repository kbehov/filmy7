import MovieCard from "@/components/cards/movie-card"
import SmartPagination from "@/components/ui/smart-pagination"
import { buildSearchMoviesQuery, searchMovies } from "@/services/movies.service"
import type { Metadata } from "next"
import Link from "next/link"
import { SearchForm } from "./search-form"

const MIN_TERM_LEN = 2

function pluralMatchesPl(n: number): string {
  const abs = n % 100
  const rem = n % 10
  if (rem === 1 && abs !== 11) return "wynik"
  if (rem >= 2 && rem <= 4 && (abs < 10 || abs >= 20)) return "wyniki"
  return "wyników"
}

export const generateMetadata: ({
  searchParams,
}: {
  searchParams: Promise<{ term?: string; page?: string }>
}) => Promise<Metadata> = async ({ searchParams }) => {
  const sp = await searchParams
  const rawTerm = sp.term ?? ""
  const term = rawTerm.trim()
  const pageNum = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1)
  const canonicalPath =
    pageNum > 1
      ? `/search?term=${term}&page=${pageNum}`
      : `/search?term=${term}`
  return {
    title: term ? `Szukaj: «${term}»` : "Szukaj filmów i seriali",
    description: `Znajdź filmy i seriale po słowach kluczowych — wyszukiwanie obejmuje tytuły i opisy w katalogu.`,
    alternates: {
      canonical: canonicalPath,
    },
    robots: { index: false, follow: true },
  }
}

function buildPaginationExtraQuery(term: string): string {
  return new URLSearchParams({ term: term.trim() }).toString()
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string; page?: string }>
}) {
  const sp = await searchParams
  const rawTerm = sp.term ?? ""
  const term = rawTerm.trim()
  const pageNum = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1)

  const showTooShort = term.length > 0 && term.length < MIN_TERM_LEN

  let fetchError: string | null = null
  let moviesCount = 0
  let totalPages = 1
  let page = pageNum
  let movies: Awaited<ReturnType<typeof searchMovies>>["data"] = []

  const shouldFetch = term.length >= MIN_TERM_LEN && !showTooShort

  if (shouldFetch) {
    try {
      const res = await searchMovies(buildSearchMoviesQuery(term, pageNum))
      movies = res.data
      moviesCount = res.moviesCount
      totalPages = res.totalPages
      page = res.page
    } catch (e) {
      fetchError =
        e instanceof Error ? e.message : "Wystąpił błąd podczas wyszukiwania."
    }
  }

  const hasResults = movies.length > 0
  const showEmptyResults = shouldFetch && !fetchError && !hasResults
  const showIdle = term.length === 0

  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <header className="border-b border-border pb-10 md:pb-12">
          <h1
            id="search-page-heading"
            className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
          >
            {term ? `Szukaj: «${term}»` : "Szukaj w katalogu"}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Znajdź film lub serial po słowach kluczowych — wyszukiwanie obejmuje
            tytuły i opisy w katalogu.
          </p>
        </header>

        <SearchForm initialTerm={rawTerm} />

        {showTooShort && (
          <div
            role="status"
            className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          >
            Wpisz co najmniej {MIN_TERM_LEN} znaki, aby rozpocząć wyszukiwanie.
          </div>
        )}

        {fetchError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {fetchError}
          </div>
        )}

        {showIdle && (
          <section
            aria-labelledby="search-idle-heading"
            className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 px-6 py-16 text-center md:px-12 md:py-20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, hsl(var(--primary) / 0.12), transparent 55%)",
              }}
            />
            <div className="relative mx-auto max-w-md space-y-3">
              <h2
                id="search-idle-heading"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                Rozpocznij wyszukiwanie
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Wpisz zapytanie w polu powyżej i naciśnij{" "}
                <span className="font-medium text-foreground">Szukaj</span>.
                Możesz podać tytuł filmu lub fragment opisu.
              </p>
            </div>
          </section>
        )}

        {shouldFetch && !fetchError && hasResults && (
          <p className="text-sm text-muted-foreground tabular-nums">
            {new Intl.NumberFormat("pl-PL").format(moviesCount)}{" "}
            {pluralMatchesPl(moviesCount)}
          </p>
        )}

        {showEmptyResults && (
          <section
            aria-labelledby="search-empty-heading"
            className="rounded-2xl border border-border bg-muted/20 px-6 py-14 text-center md:py-16"
          >
            <h2
              id="search-empty-heading"
              className="text-lg font-semibold text-foreground"
            >
              Nic nie znaleziono dla zapytania «{term}»
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Spróbuj innych słów, sprawdź układ klawiatury i literówki lub
              przejdź do katalogu filmów.
            </p>
            <Link
              href="/filmi"
              className="mt-6 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Przejdź do katalogu filmów
            </Link>
          </section>
        )}

        {hasResults && (
          <div
            id="search-results"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
            tabIndex={-1}
          >
            {movies.map((movie, i) => (
              <MovieCard key={movie._id} movie={movie} priority={i < 4} />
            ))}
          </div>
        )}

        {shouldFetch && !fetchError && hasResults && (
          <SmartPagination
            meta={{ currentPage: page, totalPages }}
            baseUrl="/search"
            pageInSearchParams
            extraQuery={buildPaginationExtraQuery(term)}
          />
        )}
      </div>
    </div>
  )
}

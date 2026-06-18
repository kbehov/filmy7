import type { MovieCountry, ProductionCompany } from "@/types/movies.types"

const TMDB_IMAGE = "https://image.tmdb.org/t/p"

/** Build a full image.tmdb.org URL for a TMDB `*_path` value (e.g. logo_path, poster_path). */
export function tmdbImageUrl(
  filePath: string | null | undefined,
  size:
    | "w45"
    | "w92"
    | "w154"
    | "w185"
    | "w300"
    | "w500"
    | "w780"
    | "original" = "w92"
): string | undefined {
  if (filePath == null || filePath === "") return undefined
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`
  return `${TMDB_IMAGE}/${size}${path}`
}

export function productionCompanyName(
  c: string | ProductionCompany
): string {
  return typeof c === "string" ? c : c.name
}

export function productionCompanyLogoPath(
  c: string | ProductionCompany
): string | null | undefined {
  if (typeof c === "string") return null
  return c.logo_path
}

export function countryName(c: string | MovieCountry): string {
  return typeof c === "string" ? c : c.name
}

import type { Metadata } from "next"
import { seoBase } from "@/seo/base"

const canonicalPath = "/genres"

function genresCountFragment(count: number): string {
  if (count <= 0) return ""
  if (count === 1) return " Obecnie w katalogu 1 gatunek."
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return ` Obecnie w katalogu ${count} gatunki.`
  }
  return ` Obecnie w katalogu ${count} gatunków.`
}

export function buildGenresIndexMetadata(input: {
  genresCount: number
}): Metadata {
  const { genresCount } = input
  const countFragment = genresCountFragment(genresCount)

  const title = "Gatunki filmów i seriali"
  const description =
    `Filmy i seriale według gatunków na Filmy7 — akcja, komedia, horror, dramat i więcej jednym kliknięciem.${countFragment} Wybierz gatunek i oglądaj online w HD z polskimi napisami.`.replace(
      /\s+/g,
      " "
    )

  return {
    title,
    description,
    keywords: [
      "gatunki filmów",
      "filmy według gatunku",
      "seriale według gatunku",
      "filmy online",
      "filmy w HD",
      "polskie napisy",
      "filmy7",
    ],
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

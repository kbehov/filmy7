"use client"

import {
  Filters,
  createFilter,
  type Filter,
  type FilterFieldConfig,
  type FilterI18nConfig,
} from "@/components/ui/filters"
import { DEFAULT_SORT } from "@/config/defaults.config"
import {
  normalizeCatalogSort,
  normalizeCatalogYear,
  type MovieCatalogSortValue,
} from "@/lib/movies-catalog"
import { cn } from "@/lib/utils"
import { CalendarRange, Eye, ListOrdered, Star } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

const PL_I18N: Partial<FilterI18nConfig> = {
  addFilter: "Filtr",
  searchFields: "Szukaj…",
  noFieldsFound: "Brak filtrów.",
  noResultsFound: "Brak wyników.",
  select: "Wybierz…",
}

function yearSelectOptions(from = new Date().getFullYear(), back = 80) {
  const options: { value: string; label: string }[] = []
  for (let y = from; y >= from - back; y -= 1) {
    options.push({ value: String(y), label: String(y) })
  }
  return options
}

const MOVIE_FILTER_FIELDS: FilterFieldConfig<string>[] = [
  {
    key: "sort",
    label: "Sortowanie",
    type: "select",
    icon: <ListOrdered className="size-4 shrink-0 opacity-70" />,
    options: [
      {
        value: "-createdAt",
        label: "Ostatnio dodane",
        icon: <ListOrdered className="size-4 opacity-60" />,
      },
      {
        value: "-views",
        label: "Najczęściej oglądane",
        icon: <Eye className="size-4 opacity-60" />,
      },
      {
        value: "-rating",
        label: "Według oceny",
        icon: <Star className="size-4 opacity-60" />,
      },
    ],
    searchable: false,
    defaultOperator: "is",
  },
  {
    key: "year",
    label: "Rok",
    type: "select",
    icon: <CalendarRange className="size-4 shrink-0 opacity-70" />,
    options: yearSelectOptions(),
    searchable: true,
    defaultOperator: "is",
  },
]

function filtersFromSearchParams(
  sort: MovieCatalogSortValue,
  year?: string
): Filter<string>[] {
  const list: Filter<string>[] = [createFilter<string>("sort", "is", [sort])]
  if (year) list.push(createFilter<string>("year", "is", [year]))
  return list
}

type MovieFiltersProps = {
  className?: string
  /** Base path for catalog list URLs (sort/year query). Default: `/filmi`. */
  catalogBasePath?: string
}

const MovieFilters = ({
  className,
  catalogBasePath = "/filmi",
}: MovieFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = useMemo(
    () =>
      filtersFromSearchParams(
        normalizeCatalogSort(searchParams.get("sort")),
        normalizeCatalogYear(searchParams.get("year"))
      ),
    [searchParams]
  )

  const applyNavigation = useCallback(
    (next: Filter<string>[]) => {
      const sortFilter = next.find((f) => f.field === "sort")
      const yearFilter = next.find((f) => f.field === "year")
      const sort = normalizeCatalogSort(sortFilter?.values[0])
      const year = normalizeCatalogYear(yearFilter?.values[0])

      const params = new URLSearchParams()
      if (sort !== DEFAULT_SORT) params.set("sort", sort)
      if (year) params.set("year", year)
      const qs = params.toString()
      const href = qs ? `${catalogBasePath}?${qs}` : catalogBasePath
      router.replace(href, { scroll: false })
      // Query-only updates do not always re-run Server Components; refresh refetches RSC data.
      router.refresh()
    },
    [router, catalogBasePath]
  )

  const handleChange = useCallback(
    (next: Filter<string>[]) => {
      const sortFilter = next.find((f) => f.field === "sort")
      if (!sortFilter) {
        applyNavigation([
          createFilter<string>("sort", "is", [DEFAULT_SORT]),
          ...next.filter((f) => f.field === "year"),
        ])
        return
      }
      applyNavigation(next)
    },
    [applyNavigation]
  )

  const fields = useMemo(() => MOVIE_FILTER_FIELDS, [])

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-x-auto overscroll-x-contain",
        className
      )}
    >
      <Filters<string>
        filters={filters}
        fields={fields}
        onChange={handleChange}
        allowMultiple={false}
        size="sm"
        variant="default"
        showSearchInput
        i18n={PL_I18N}
        className="w-max min-w-0 flex-wrap"
      />
    </div>
  )
}

export default MovieFilters

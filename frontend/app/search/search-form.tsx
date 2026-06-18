"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

type SearchFormProps = {
  initialTerm: string
}

export function SearchForm({ initialTerm }: SearchFormProps) {
  const router = useRouter()
  const [value, setValue] = useState(initialTerm)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setValue(initialTerm)
  }, [initialTerm])

  const submit = useCallback(() => {
    const q = value.trim()
    startTransition(() => {
      const params = new URLSearchParams()
      if (q) params.set("term", q)
      const qs = params.toString()
      router.push(qs ? `/search?${qs}` : "/search")
    })
  }, [router, value])

  return (
    <form
      role="search"
      aria-labelledby="search-page-heading"
      className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
      action="/search"
      method="get"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <label className="relative flex-1">
        <span className="sr-only">Szukaj w katalogu</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          name="term"
          type="search"
          autoComplete="off"
          placeholder="Tytuł, temat, słowa kluczowe…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-12 w-full rounded-full border border-border bg-background pr-4 pl-11 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30 focus:outline-none"
        />
      </label>
      <Button
        type="submit"
        disabled={pending}
        className="h-12 shrink-0 rounded-full px-8"
      >
        {pending ? "Szukam…" : "Szukaj"}
      </Button>
    </form>
  )
}

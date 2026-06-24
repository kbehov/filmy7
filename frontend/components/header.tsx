'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState } from 'react'
import ThemeSwitcher from './theme-switcher'
import { SidebarTrigger } from './ui/sidebar'

const Header = () => {
  const router = useRouter()
  const [headerSearch, setHeaderSearch] = useState('')

  function onSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const t = headerSearch.trim()
    router.push(t ? `/search?term=${encodeURIComponent(t)}` : '/search')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background px-6 py-3">
      <div className="flex items-center gap-5">
        <SidebarTrigger className="cursor-pointer text-foreground" />

        <form onSubmit={onSearchSubmit} className="relative ml-4 flex-1" role="search" aria-label="szukaj w katalogu">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <input
            type="search"
            name="term"
            value={headerSearch}
            onChange={e => setHeaderSearch(e.target.value)}
            placeholder="wyszukaj filmy i seriale"
            enterKeyHint="search"
            className="h-11 w-full rounded-full border border-border pr-12 pl-11 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30 focus:outline-none"
          />
        </form>
        <div className="ml-auto flex items-center gap-3">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
export default Header

'use client'
import { GetGenresResponse } from '@/types/genre.types'
import type { LucideIcon } from 'lucide-react'
import { Camera, Flame, Home, LayoutGrid, Tv, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import GenreSidebarSection from './sidebar-genres'
import SidebarSection from './sidebar-section'
import { Sidebar, SidebarContent, SidebarHeader, SidebarSeparator } from './ui/sidebar'

export type NavItem = { title: string; url: string; icon: LucideIcon }

const menuItems: NavItem[] = [
  { title: 'Główna', url: '/', icon: Home },
  { title: 'Filmy', url: '/filmy', icon: Camera },
  { title: 'Seriale', url: '/seriale', icon: Tv },
  { title: 'W trendzie', url: '/trending', icon: Flame },
  { title: 'Aktorzy', url: '/actors', icon: Users },
  { title: 'Gatunki', url: '/genres', icon: LayoutGrid },
]

const AppSidebar = ({ genres }: { genres: GetGenresResponse }) => {
  return (
    <Sidebar>
      <SidebarHeader className="gap-0 bg-background px-3 pt-4 pb-2">
        <Link
          href="/"
          aria-label="Filmi9 — strona główna"
          className="group/brand flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Image src="/filmy7-logo.png" alt="Filmy7" width={36} height={36} />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="text-lg font-black tracking-tight">
              Filmy<span className="text-primary">7</span>
            </span>
            <span className="mt-1.5 truncate text-[11px] font-medium tracking-wide text-muted-foreground">
              Oglądaj <strong>filmy i seriale</strong>
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator className="mx-3" />
      <SidebarContent className="gap-4 bg-background pt-2 pb-6">
        <SidebarSection label="Nawigacja" items={menuItems} />
        <GenreSidebarSection genres={genres} />
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar

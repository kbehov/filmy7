import type { Genre } from '@/types/genre.types'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'

const GenreSidebarSection = ({ genres }: { genres: Genre[] }) => {
  const pathname = usePathname()

  if (!genres.length) {
    return null
  }

  const visibleGenres = genres.slice(0, 10)
  const hasMore = genres.length > visibleGenres.length

  return (
    <SidebarGroup className="px-3 py-0">
      <SidebarGroupLabel className="mb-1 h-auto px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-muted-foreground/70 uppercase">
        Gatunki
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {visibleGenres.map(genre => {
          const href = `/genre/${genre.slug}`
          const active = pathname === href
          return (
            <SidebarMenuItem key={genre._id}>
              <SidebarMenuButton
                asChild
                isActive={active}
                aria-current={active ? 'page' : undefined}
                className="group/genre h-11 rounded-xl px-2 text-[13.5px] font-medium text-foreground/80 transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:hover:bg-primary/15"
              >
                <Link href={href}>
                  <span className="capitalize">{genre.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
        {hasMore ? (
          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton
              asChild
              className="group/more h-8 rounded-xl px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <Link href="/genres" className="flex w-full items-center justify-between">
                <span>Wszystkie gatunki</span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-150 group-hover/more:translate-x-0.5"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null}
      </SidebarMenu>
    </SidebarGroup>
  )
}
export default GenreSidebarSection

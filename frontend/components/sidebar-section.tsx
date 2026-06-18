import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavItem } from "./app-sidebar"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

const SidebarSection = ({
  label,
  items,
}: {
  label?: string
  items: NavItem[]
}) => {
  const pathname = usePathname()

  return (
    <SidebarGroup className="px-3">
      {label ? (
        <SidebarGroupLabel className="mb-1 h-auto px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-muted-foreground/70 uppercase">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          const active = pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={active}
                aria-current={active ? "page" : undefined}
                className="group/nav h-9 rounded-xl px-3 text-[13.5px] font-medium text-foreground/80 transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:hover:bg-primary/15 [&_svg]:size-4 [&_svg]:text-muted-foreground [&_svg]:transition-colors group-hover/nav:[&_svg]:text-foreground data-[active=true]:[&_svg]:text-primary"
              >
                <Link href={item.url}>
                  <item.icon aria-hidden="true" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
export default SidebarSection

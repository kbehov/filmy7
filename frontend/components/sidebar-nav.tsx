"use client"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
const SidebarNav = ({
  navigations,
}: {
  navigations: { title: string; url: string; icon: LucideIcon }[]
}) => {
  const pathname = usePathname()
  const isActive = (url: string) => pathname === url
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Filmi9</SidebarGroupLabel>
      <SidebarMenu>
        {navigations.map((navigation) => (
          <SidebarMenuItem key={navigation.url}>
            <SidebarMenuButton asChild isActive={isActive(navigation.url)}>
              <Link href={navigation.url}>
                <navigation.icon />
                {navigation.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default SidebarNav

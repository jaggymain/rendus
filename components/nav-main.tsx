"use client"

import { type LucideIcon } from "lucide-react"
import type { ModelInfo } from "@/lib/models"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  onCategorySelect,
  selectedCategory,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    category?: string
    items?: {
      title: string
      url: string
    }[]
    models?: ModelInfo[]
  }[]
  onCategorySelect?: (category: string, models: ModelInfo[]) => void
  selectedCategory?: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Model Types</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={selectedCategory === item.category}
              onClick={() => {
                if (item.models && item.category && onCategorySelect) {
                  onCategorySelect(item.category, item.models)
                }
              }}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

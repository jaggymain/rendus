"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Image as ImageIcon,
  Video,
  Wand2,
  Film,
  Orbit,
} from "lucide-react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavAccount } from "@/components/nav-account"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { FEATURED_IMAGE_MODELS, FEATURED_VIDEO_MODELS, ALL_VIDEO_MODELS } from "@/lib/all-models"
import type { ModelInfo } from "@/lib/models"

// Filter models for sidebar
const textToImageModels = FEATURED_IMAGE_MODELS.filter(m => m.category === 'text-to-image')
const imageToImageModels = FEATURED_IMAGE_MODELS.filter(m => m.category === 'image-to-image')
const imageToVideoModels = FEATURED_VIDEO_MODELS.filter(m => m.category === 'image-to-video')

// Special handling for Text to Video as requested
const textToVideoModels = ALL_VIDEO_MODELS.filter(m =>
  m.name === "Kling v2.5 Text to Video" || m.name === "Veo 3 Fast"
)

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Text to Image",
      url: "#",
      icon: ImageIcon,
      isActive: true,
      category: "text-to-image",
      models: textToImageModels,
    },
    {
      title: "Image to Image",
      url: "#",
      icon: Wand2,
      category: "image-to-image",
      models: imageToImageModels,
    },
    {
      title: "Text to Video",
      url: "#",
      icon: Video,
      category: "text-to-video",
      models: textToVideoModels,
    },
    {
      title: "Image to Video",
      url: "#",
      icon: Film,
      category: "image-to-video",
      models: imageToVideoModels,
    },
  ],
}

export function AppSidebar({
  onCategorySelect,
  selectedCategory,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onCategorySelect?: (category: string, models: ModelInfo[]) => void
  selectedCategory?: string
}) {
  const { data: session } = useSession()

  const user = session?.user
    ? {
      name: session.user.name || "User",
      email: session.user.email || "",
      avatar: session.user.image || "",
    }
    : data.user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarMenuButton size="lg" asChild className="flex-1">
                <a href="/">
                  <div className="bg-sidebar-accent text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg">
                    <Orbit className="size-7 text-primary [&_circle]:fill-primary" strokeWidth={1} />
                  </div>
                  <div className="grid flex-1 text-left text-xl leading-tight">
                    <span className="truncate font-semibold">rendus.ai</span>
                  </div>
                </a>
              </SidebarMenuButton>
              {/* Close button for mobile sidebar */}
              <SidebarTrigger className="md:hidden h-8 w-8" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          onCategorySelect={onCategorySelect}
          selectedCategory={selectedCategory}
        />
        <NavAccount />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

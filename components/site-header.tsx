"use client"

import Link from "next/link"
import { SidebarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { CreditsDisplay } from "@/components/credits-display"

interface SiteHeaderProps {
  title?: string
}

export function SiteHeader({ title = "Image Generation" }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-14 w-full items-center px-4">
        <div className="flex items-center gap-2">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Logo />
        </div>
        
        <div className="flex items-center">
          <CreditsDisplay />
        </div>
      </div>
    </header>
  )
}

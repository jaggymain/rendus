// "use client"

import * as React from "react"
import { Check, ChevronDown, Image, Video, Search, ChevronDownIcon, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { ModelInfo } from "@/lib/models"
import { getCreditBadge } from "@/lib/credits-display"

interface ModelSelectorProps {
  selectedModel: string
  onSelectModel: (modelId: string) => void
  imageModels: ModelInfo[]
  videoModels: ModelInfo[]
}

export function ModelSelector({
  selectedModel,
  onSelectModel,
  imageModels,
  videoModels,
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)

  // Find the currently selected model info
  const allModels = React.useMemo(() => [...imageModels, ...videoModels], [imageModels, videoModels])
  const selectedModelInfo = allModels.find((m) => m.id === selectedModel)

  // Determine the default tab based on the selected model type
  const activeTab = selectedModelInfo?.type === "video" ? "video" : "image"
  const [currentTab, setCurrentTab] = React.useState(activeTab)

  // Sync tab when selected model changes
  React.useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  // Search state (shared across tabs) and scope (category filter)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchScope, setSearchScope] = React.useState<string>("") // e.g., "text-to-image"

  // Filter helper – applies scope then query
  const filterModels = (models: ModelInfo[]) => {
    let filtered = models;
    if (searchScope) {
      filtered = filtered.filter((m) => m.category === searchScope);
    }
    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  // Reset search query and scope when tab changes
  React.useEffect(() => {
    setSearchScope("");
    setSearchQuery("");
  }, [currentTab]);
  const filteredImageModels = filterModels(imageModels)
  const filteredVideoModels = filterModels(videoModels)

  const featuredImageModels = filteredImageModels.filter((m) => m.pinned)
  const regularImageModels = filteredImageModels.filter((m) => !m.pinned)
  const featuredVideoModels = filteredVideoModels.filter((m) => m.pinned)
  const regularVideoModels = filteredVideoModels.filter((m) => !m.pinned)

  const handleSelectModel = (modelId: string) => {
    onSelectModel(modelId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-[68px] px-1"
        >
          <div className="flex items-center gap-3 min-w-0 text-left">
            {selectedModelInfo ? (
              <>
                {selectedModelInfo.thumbnailUrl ? (
                  <img
                    src={selectedModelInfo.thumbnailUrl}
                    alt={selectedModelInfo.name}
                    className="size-12 rounded-sm object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="flex size-12 items-center justify-center rounded-sm flex-shrink-0"
                    style={{ background: selectedModelInfo.gradient }}
                  >
                    <selectedModelInfo.icon className="size-6 text-white" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-sm font-medium truncate leading-none">
                    {selectedModelInfo.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    {selectedModelInfo.tags && selectedModelInfo.tags.length > 0 ? (
                      selectedModelInfo.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-1 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        {selectedModelInfo.type === "video" ? "Video Generation" : "Image Generation"}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">Select a model…</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="bg-background w-full justify-start p-1 gap-1">
            <TabsTrigger
              value="image"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Image className="h-4 w-4 mr-2" /> Image
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Video className="h-4 w-4 mr-2" /> Video
            </TabsTrigger>
          </TabsList>

          {/* Image Models Tab */}
          <TabsContent value="image" className="m-0">
            {/* Search bar with scope dropdown */}
            <div className="p-4 pb-0 flex items-center gap-2">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search image models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton variant="ghost" className="!pr-1.5 text-xs">
                        {searchScope ? searchScope.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Search In...'} <ChevronDownIcon className="size-3" />
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                      <DropdownMenuItem onSelect={() => setSearchScope("text-to-image")}>Text to Image</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSearchScope("image-to-image")}>Image to Image</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <ScrollArea className="h-[450px]">
              <div className="p-4 pt-2 space-y-6">
                {/* Featured Section */}
                {featuredImageModels.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Featured
                    </h4>
                    <div className="flex flex-col gap-2">
                      {featuredImageModels.map((model) => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          isSelected={model.id === selectedModel}
                          onSelect={handleSelectModel}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* All Models Section */}
                {regularImageModels.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      All Models
                    </h4>
                    <div className="flex flex-col gap-2">
                      {regularImageModels.map((model) => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          isSelected={model.id === selectedModel}
                          onSelect={handleSelectModel}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* Empty state */}
                {filteredImageModels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No models found</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Video Models Tab */}
          <TabsContent value="video" className="m-0">
            {/* Search bar with scope dropdown */}
            <div className="p-4 pb-0 flex items-center gap-2">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search video models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton variant="ghost" className="!pr-1.5 text-xs">
                        Search In... <ChevronDownIcon className="size-3" />
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                      <DropdownMenuItem onSelect={() => setSearchScope("text-to-video")}>Text to Video</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSearchScope("image-to-video")}>Image to Video</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <ScrollArea className="h-[450px]">
              <div className="p-4 pt-2 space-y-6">
                {/* Featured Section */}
                {featuredVideoModels.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Featured
                    </h4>
                    <div className="flex flex-col gap-2">
                      {featuredVideoModels.map((model) => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          isSelected={model.id === selectedModel}
                          onSelect={handleSelectModel}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* All Models Section */}
                {regularVideoModels.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      All Models
                    </h4>
                    <div className="flex flex-col gap-2">
                      {regularVideoModels.map((model) => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          isSelected={model.id === selectedModel}
                          onSelect={handleSelectModel}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* Empty state */}
                {filteredVideoModels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No models found</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

function ModelCard({ model, isSelected, onSelect }: { model: ModelInfo; isSelected: boolean; onSelect: (id: string) => void }) {
  const Icon = model.icon
  return (
    <button
      onClick={() => onSelect(model.id)}
      className={cn(
        "relative flex items-stretch gap-0 rounded-lg border overflow-hidden text-left transition-all hover:bg-muted dark:hover:bg-muted/80 hover:border-primary/40 h-[88px] bg-transparent dark:bg-input/30",
        isSelected && "border-primary bg-accent"
      )}
    >
      {/* Thumbnail or gradient */}
      <div className="w-20 bg-muted flex items-center justify-center flex-shrink-0">
        {model.thumbnailAnimatedUrl ? (
          model.thumbnailAnimatedUrl.endsWith('.mp4') ? (
            <video src={model.thumbnailAnimatedUrl} autoPlay muted loop className="w-full h-full object-cover" />
          ) : (
            <img src={model.thumbnailAnimatedUrl} alt={model.name} className="w-full h-full object-cover" />
          )
        ) : model.thumbnailUrl ? (
          model.thumbnailUrl.endsWith('.mp4') ? (
            <video src={model.thumbnailUrl} autoPlay muted loop className="w-full h-full object-cover" />
          ) : (
            <img src={model.thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: model.gradient }}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      {/* Model info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center p-2.5 pr-8">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h5 className="text-sm font-medium leading-tight line-clamp-1">{model.name}</h5>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1">{model.description}</p>
        <div className="flex flex-wrap items-center gap-1">
          {/* Credit cost badge */}
          {getCreditBadge(model) && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/50 text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <Coins className="size-2.5" />
              {getCreditBadge(model)}
            </Badge>
          )}
          {model.tags && model.tags.length > 0 && (
            <>
              {model.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </>
          )}
          {model.highlighted && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto">
              New
            </Badge>
          )}
        </div>
      </div>
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      )}
    </button>
  )
}

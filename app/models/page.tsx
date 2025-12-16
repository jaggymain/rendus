// app/models/page.tsx

'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModelCard } from '@/components/model-card'
import { HeroHeader } from '@/components/header'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  categoryDisplayNames,
  type ModelCategory
} from '@/lib/models-data'
import { ALL_MODELS } from '@/lib/all-models'
import {
  Search,
  ImageUpscale,
  SlidersHorizontal,
  Coins,
  Sparkles
} from 'lucide-react'

// Filter models to only include those with required fields for the models page
const models = ALL_MODELS.filter(m => m.category && m.tags && m.thumbnailUrl)
const allTags = Array.from(new Set(models.flatMap((m) => m.tags!))).filter(Boolean).sort()

// Extract unique providers and create display names
const providerDisplayNames: Record<string, string> = {
  // FAL AI models (more specific patterns first)
  'fal-ai/flux': 'FLUX',
  'fal-ai/imagen': 'Google Imagen',
  'fal-ai/veo': 'Google Veo',
  'fal-ai/kling': 'Kling',
  'fal-ai/wan': 'Wan',
  'fal-ai/minimax': 'MiniMax',
  'fal-ai/luma': 'Luma',
  'fal-ai/sora': 'Sora',
  'fal-ai/recraft': 'Recraft',
  'fal-ai/ideogram': 'Ideogram',
  'fal-ai/pika': 'Pika',
  'fal-ai/stable': 'Stable Diffusion',
  'fal-ai/hidream': 'HiDream',
  'fal-ai/runway': 'Runway',
  'fal-ai/mochi': 'Mochi',
  'fal-ai/hyvideo': 'HyVideo',
  'fal-ai/pixart': 'PixArt',
  'fal-ai/aura': 'Aura',
  'fal-ai/omni': 'Omni',
  'fal-ai/clarity': 'Clarity',
  'fal-ai/ltx': 'LTX',
  // Third-party providers
  'bria': 'Bria',
  'bytedance': 'Bytedance',
  'simalabs': 'SimaLabs',
  'clarityai': 'ClarityAI',
  'easel-ai': 'Easel AI',
  'veed': 'VEED',
  'decart': 'Decart',
  'moonvalley': 'Moonvalley',
  'argil': 'Argil',
  'imagineart': 'ImagineArt',
  'rundiffusion-fal': 'RunDiffusion',
}

// Get provider from model ID
const getProvider = (modelId: string): string | null => {
  // Check specific patterns first
  for (const [key, name] of Object.entries(providerDisplayNames)) {
    if (modelId.includes(key)) {
      return name
    }
  }

  // Fallback: extract provider from first part of ID
  const parts = modelId.split('/')
  if (parts.length >= 2) {
    const provider = parts[0]
    const category = parts[1]

    // Capitalize provider name
    const displayName = provider
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // For fal-ai models, use the category as the provider name
    if (provider === 'fal-ai' && category) {
      return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    return displayName
  }

  return null
}

const allProviders = Array.from(new Set(models.map(m => getProvider(m.id)).filter(Boolean))).sort() as string[]

const categories: ModelCategory[] = [
  'text-to-image',
  'text-to-video',
  'image-to-image',
  'image-to-video',
]

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.tags?.some(tag => tag.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }

      // Category filter
      if (selectedCategories.length > 0 && model.category) {
        if (!selectedCategories.includes(model.category)) {
          return false
        }
      }

      // Features filter (tags and featured)
      if (selectedFeatures.length > 0) {
        const isFeatured = selectedFeatures.includes('featured') && model.highlighted
        const hasSelectedTag = selectedFeatures.some(feature =>
          feature !== 'featured' && model.tags?.includes(feature)
        )
        if (!isFeatured && !hasSelectedTag) return false
      }

      // Price range filter
      if (selectedPriceRanges.length > 0) {
        const modelPrice = model.credits || model.credits_flat || 0
        const matchesPriceRange = selectedPriceRanges.some(range => {
          if (range === 'free') return modelPrice === 0
          if (range === '1-2') return modelPrice >= 1 && modelPrice <= 2
          if (range === '3-5') return modelPrice >= 3 && modelPrice <= 5
          if (range === '6-10') return modelPrice >= 6 && modelPrice <= 10
          if (range === '10+') return modelPrice > 10
          if (range === 'variable') return model.pricing_type === 'variable'
          if (range === 'per-second') return model.credits_per_5sec !== undefined
          return false
        })
        if (!matchesPriceRange) return false
      }

      // Provider filter
      if (selectedProviders.length > 0) {
        const modelProvider = getProvider(model.id)
        if (!modelProvider || !selectedProviders.includes(modelProvider)) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, selectedCategories, selectedFeatures, selectedPriceRanges, selectedProviders])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedFeatures([])
    setSelectedPriceRanges([])
    setSelectedProviders([])
  }

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || selectedFeatures.length > 0 || selectedPriceRanges.length > 0 || selectedProviders.length > 0

  // Prepare options for dropdowns
  const categoryOptions = categories.map(cat => ({
    value: cat,
    label: categoryDisplayNames[cat]
  }))

  const priceOptions = [
    { value: '1-2', label: '1-2 coins' },
    { value: '3-5', label: '3-5 coins' },
    { value: '6-10', label: '6-10 coins' },
    { value: '10+', label: '10+ coins' },
    { value: 'variable', label: 'Variable' },
    { value: 'per-second', label: 'Per Second' },
  ]

  const providerOptions = allProviders.map(provider => ({
    value: provider,
    label: provider
  }))

  const featureOptions = [
    { value: 'featured', label: 'Featured' },
    ...allTags.slice(0, 20).map(tag => ({
      value: tag,
      label: tag
    }))
  ]

  return (
    <>
      <HeroHeader />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <h1 className="text-4xl font-semibold lg:text-5xl">
                AI Models
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore our collection of state-of-the-art AI models for image and video generation.
                From text-to-image to video effects, find the perfect model for your creative needs.
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <Card>
              <CardContent className="px-6 py-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <MultiSelect
                    title="Model Type"
                    options={categoryOptions}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    icon={<ImageUpscale className="size-4 text-blue-500" />}
                  />
                  <MultiSelect
                    title="Model Name"
                    options={providerOptions}
                    selected={selectedProviders}
                    onChange={setSelectedProviders}
                    icon={<Sparkles className="size-4 text-purple-500" />}
                  />
                  <MultiSelect
                    title="Features"
                    options={featureOptions}
                    selected={selectedFeatures}
                    onChange={setSelectedFeatures}
                    icon={<SlidersHorizontal className="size-4 text-green-500" />}
                  />
                  <MultiSelect
                    title="Price"
                    options={priceOptions}
                    selected={selectedPriceRanges}
                    onChange={setSelectedPriceRanges}
                    icon={<Coins className="size-4 text-amber-500" />}
                  />
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">
                      {filteredModels.length} of {models.length} models
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Models Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6">
            {filteredModels.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
                {filteredModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto max-w-md space-y-4">
                  <div className="size-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Search className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No models found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria to find what you're looking for.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

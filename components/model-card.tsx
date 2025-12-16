// components/model-card.tsx

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Coins } from 'lucide-react'
import type { ModelInfo } from '@/lib/models'
import { getModelCreditCost } from '@/lib/credits-display'

interface ModelCardProps {
  model: ModelInfo
}

export function ModelCard({ model }: ModelCardProps) {
  const creditCost = getModelCreditCost(model)

  return (
    <Card className="group relative overflow-hidden bg-card hover:bg-muted/50 transition-all duration-300 h-full flex flex-col p-0">
      {model.highlighted && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-primary text-primary-foreground border-none">
            <Sparkles className="size-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <div className="aspect-video relative overflow-hidden">
        {model.thumbnailUrl && (
          <Image
            src={model.thumbnailUrl}
            alt={model.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <CardContent className="pt-0 px-4 pb-5 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 flex-1">{model.name}</h3>
            {creditCost && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-none flex items-center gap-1 shrink-0">
                <Coins className="size-3" />
                <span className="text-xs">{creditCost}</span>
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {model.description}
          </p>
        </div>

        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {model.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-transparent border-muted-foreground/30"
              >
                {tag}
              </Badge>
            ))}
            {model.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs bg-transparent border-muted-foreground/30"
              >
                +{model.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

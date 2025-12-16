// components/ui/multi-select.tsx

'use client'

import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface MultiSelectProps {
  title: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  icon?: React.ReactNode
}

export function MultiSelect({
  title,
  options,
  selected,
  onChange,
  icon,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 px-3"
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            {icon}
            <span className="text-sm font-normal truncate">
              {selected.length > 0
                ? `${title} (${selected.length})`
                : title}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {selected.length > 0 && (
              <Badge
                variant="secondary"
                className="h-5 px-1 text-xs bg-primary/10 text-primary border-none"
                onClick={handleClear}
              >
                {selected.length}
                <X className="size-3 ml-1" />
              </Badge>
            )}
            <ChevronDown className="size-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-64 overflow-y-auto p-1">
          {options.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <div
                key={option.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                  isSelected && 'bg-accent/50'
                )}
                onClick={() => handleSelect(option.value)}
              >
                <div
                  className={cn(
                    'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50'
                  )}
                >
                  {isSelected && <Check className="size-3" />}
                </div>
                <span>{option.label}</span>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

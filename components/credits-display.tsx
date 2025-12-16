'use client'

import { useState, useEffect } from 'react'
import { Coins, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CREDIT_PACKAGES } from '@/lib/credits'

interface CreditsDisplayProps {
  className?: string
}

export function CreditsDisplay({ className }: CreditsDisplayProps) {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })
      
      if (res.ok) {
        const { url } = await res.json()
        if (url) {
          window.location.href = url
        }
      } else {
        const error = await res.json()
        console.error('Failed to create checkout session:', error)
        // Show a user-friendly message
        alert(error.error || 'Payments are not available at this time.')
      }
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full ${className}`}>
        <Coins className="h-4 w-4 text-yellow-500" />
        <span className="text-sm text-zinc-400">...</span>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-full ${className}`}
        >
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{credits ?? 0}</span>
          <span className="text-xs text-zinc-400">credits</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Your Credits</h4>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{credits ?? 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Credits are used for AI generations. Different models cost different amounts.
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Get More Credits</h4>
            <div className="space-y-2">
              {CREDIT_PACKAGES.map((pkg) => (
                <Button
                  key={pkg.id}
                  variant={'popular' in pkg && pkg.popular ? 'default' : 'outline'}
                  className="w-full justify-between"
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing !== null}
                >
                  <span className="flex items-center gap-2">
                    {'popular' in pkg && pkg.popular && <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded">BEST</span>}
                    {pkg.label}
                  </span>
                  <span className="font-medium">${(pkg.price / 100).toFixed(0)}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

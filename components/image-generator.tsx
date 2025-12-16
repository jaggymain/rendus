'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'

interface GeneratedImage {
  imageUrl: string
  seed: number
  width: number
  height: number
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<GeneratedImage | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!prompt.trim()) return

    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt.trim() }),
        })

        if (!res.ok) {
          throw new Error('Generation failed')
        }

        const data = await res.json()
        setImage(data)
      } catch (err) {
        setError('Failed to generate image. Please try again.')
        console.error(err)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to generate..."
          className="w-full min-h-[100px] p-4 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
          disabled={isPending}
        />

        <button
          onClick={generate}
          disabled={isPending || !prompt.trim()}
          className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
        {isPending ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse space-y-2 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Generating your image...</p>
            </div>
          </div>
        ) : image ? (
          <Image
            src={image.imageUrl}
            alt={prompt}
            width={image.width}
            height={image.height}
            className="w-full h-full object-contain"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>Your generated image will appear here</p>
          </div>
        )}
      </div>

      {image && (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>Seed: {image.seed}</p>
          <p>Resolution: {image.width} × {image.height}</p>
        </div>
      )}
    </div>
  )
}

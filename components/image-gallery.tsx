'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SavedImage {
  id: string
  prompt: string
  thumbnailUrl: string
  seed: number
  width: number
  height: number
  createdAt: string
  type?: string // 'image' or 'video'
}

interface FullImageData {
  fullImageUrl: string
  prompt: string
  seed: string
  width: number
  height: number
  type: string
}

export function ImageGallery() {
  const [images, setImages] = useState<SavedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null)
  const [fullImageData, setFullImageData] = useState<FullImageData | null>(null)
  const [loadingFullImage, setLoadingFullImage] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images')
      const data = await res.json()
      setImages(data.images)
    } catch (error) {
      console.error('Failed to fetch images:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFullImage = async (imageId: string) => {
    setLoadingFullImage(true)
    try {
      const res = await fetch(`/api/generations/${imageId}/full-image`)
      const data = await res.json()
      setFullImageData(data)
    } catch (error) {
      console.error('Failed to fetch full image:', error)
    } finally {
      setLoadingFullImage(false)
    }
  }

  const handleImageClick = (image: SavedImage) => {
    setSelectedImage(image)
    setFullImageData(null) // Reset full image data
    fetchFullImage(image.id)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
    setFullImageData(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400">
          No images or videos yet. Generate your first creation!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => handleImageClick(image)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900"
          >
            {image.type === 'video' ? (
              <video
                src={image.thumbnailUrl}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={image.thumbnailUrl}
                alt={image.prompt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-4">
              <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                {image.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Image/Video Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square">
              {loadingFullImage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading full image...</p>
                  </div>
                </div>
              ) : fullImageData ? (
                selectedImage.type === 'video' ? (
                  <video
                    src={fullImageData.fullImageUrl}
                    className="absolute inset-0 w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <Image
                    src={fullImageData.fullImageUrl}
                    alt={fullImageData.prompt}
                    fill
                    className="object-contain"
                  />
                )
              ) : null}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Prompt</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedImage.prompt}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>{' '}
                  <span className="font-mono capitalize">{selectedImage.type || 'image'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Seed:</span>{' '}
                  <span className="font-mono">{fullImageData?.seed || selectedImage.seed}</span>
                </div>
                {selectedImage.width && selectedImage.height && (
                  <div>
                    <span className="text-gray-500">Resolution:</span>{' '}
                    {selectedImage.width} × {selectedImage.height}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <a
                  href={fullImageData?.fullImageUrl || '#'}
                  download
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => !fullImageData && e.preventDefault()}
                >
                  Download
                </a>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

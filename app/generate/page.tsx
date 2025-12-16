'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { redirect } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { ArrowUp, Trash2, X, Loader2, Orbit, Sparkles, ChevronDown, Coins, Square, RectangleVertical, RectangleHorizontal, Check, ArrowUpRight, Wand, Download, OctagonX, Image as ImageIcon, Video, Edit, Film, Plus, Tv, Undo2, Volume2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ALL_IMAGE_MODELS, ALL_VIDEO_MODELS, FEATURED_IMAGE_MODELS, FEATURED_VIDEO_MODELS, ALL_MODELS } from '@/lib/all-models'
import type { ModelInfo } from "@/lib/models"
import { ASPECT_RATIOS, VEO_ASPECT_RATIOS, WAN_ASPECT_RATIOS } from "@/lib/models"
import { getCreditBadge } from "@/lib/credits-display"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"

const WAN_EFFECTS = [
  "squish", "muscle", "inflate", "crush", "rotate", "gun-shooting", "deflate", "cakeify",
  "hulk", "baby", "bride", "classy", "puppy", "snow-white", "disney-princess", "mona-lisa",
  "painting", "pirate-captain", "princess", "jungle", "samurai", "vip", "warrior", "zen",
  "assassin", "timelapse", "tsunami", "fire", "zoom-call", "doom-fps", "fus-ro-dah",
  "hug-jesus", "robot-face-reveal", "super-saiyan", "jumpscare", "laughing",
  "cartoon-jaw-drop", "crying", "kissing", "angry-face", "selfie-younger-self",
  "animeify", "blast"
]

interface GeneratedImage {
  id: string
  imageUrl: string
  seed: number
  width: number
  height: number
  prompt: string
  createdAt: string
  s3Key: string
  model?: string
}

const ModelItem = ({ model, onSelect }: { model: ModelInfo, onSelect: (model: ModelInfo) => void }) => {
  // Special handling for models with video thumbnails
  const isVideoThumbnail = model.thumbnailUrl?.endsWith('.mp4') || model.thumbnailUrl?.endsWith('.webm')
  const hasVideoThumbnail = isVideoThumbnail && (model.name === "Veo 3 Fast" || model.name === "Wan Effects" || model.name === "Veo 3.1 First-Last Frame" || model.name === "Kling 2.6 Pro (I2V)")
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <button
      onClick={() => onSelect(model)}
      className="flex items-stretch gap-0 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden text-left transition-all hover:bg-accent h-[88px] w-full group mb-2 last:mb-0"
    >
        {/* Thumbnail or gradient */}
        {hasVideoThumbnail ? (
          // For models with video thumbnails, use a 16:9 video thumbnail
          <div className="aspect-[16/9] bg-muted flex items-center justify-center flex-shrink-0 relative overflow-hidden rounded-l-lg" style={{ height: '88px' }}>
            <video
              key={model.thumbnailUrl}
              ref={videoRef}
              src={model.thumbnailUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => {
                videoRef.current?.play().catch(e => console.error('Play failed:', e))
              }}
              onError={(e) => {
                console.error('Video failed to load:', e, model.thumbnailUrl)
              }}
            />
          </div>
        ) : (
          // Standard square thumbnail for other models
          <div className="w-[88px] bg-muted flex items-center justify-center flex-shrink-0 border-r relative overflow-hidden">
            {model.thumbnailUrl ? (
              <img src={model.thumbnailUrl} alt={model.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: model.gradient }}>
                <model.icon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        )}
        {/* Model info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center p-2.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h5 className="text-sm font-medium leading-tight line-clamp-1">{model.name}</h5>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{model.description}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {model.name === "Veo 3 Fast" && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                Fast
              </Badge>
            )}
            {getCreditBadge(model) && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-0.5">
                <Coins className="h-3 w-3" />
                {getCreditBadge(model)}
              </Badge>
            )}
            {model.tags?.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[10px] bg-secondary/50 text-secondary-foreground border-border">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
    </button>
  )
}

export default function Page() {
  const { data: session, status } = useSession()
  const { resolvedTheme } = useTheme()
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Model selection state
  const [selectedCategory, setSelectedCategory] = useState<string>('text-to-image')
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null)

  // Aspect ratio state - default to 16:9
  const [aspectRatio, setAspectRatio] = useState<string>('16:9')

  // Wan Effects state
  const [effectType, setEffectType] = useState<string>('cakeify')

  // Image input state (file upload or gallery selection)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputImage, setInputImage] = useState<{
    file: File | null
    url: string | null
    previewUrl: string | null
  }>({
    file: null,
    url: null,
    previewUrl: null
  })

  // First-Last Frame state for Veo 3.1
  const startFrameInputRef = useRef<HTMLInputElement>(null)
  const endFrameInputRef = useRef<HTMLInputElement>(null)
  const [startFrame, setStartFrame] = useState<{
    file: File | null
    previewUrl: string | null
  }>({ file: null, previewUrl: null })
  const [endFrame, setEndFrame] = useState<{
    file: File | null
    previewUrl: string | null
  }>({ file: null, previewUrl: null })
  const [veoResolution, setVeoResolution] = useState<'720p' | '1080p'>('720p')

  // Kling 2.6 audio and duration state
  const [klingAudioEnabled, setKlingAudioEnabled] = useState(true)
  const [klingDuration, setKlingDuration] = useState<'5' | '10'>('5')

  // Prompt enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null)

  // Navigation menu state (to close menu when model is selected)
  const [navMenuValue, setNavMenuValue] = useState<string>("")

  // Frame drawer state for mobile Veo 3.1
  const [isFrameDrawerOpen, setIsFrameDrawerOpen] = useState(false)

  // Initialize with text-to-image models
  useEffect(() => {
    const textToImageModels = ALL_IMAGE_MODELS.filter(m => m.category === 'text-to-image')
    setAvailableModels(textToImageModels)
    if (textToImageModels.length > 0) {
      setSelectedModel(textToImageModels[0])
    }
  }, [])

  // Handle category selection from sidebar
  const handleCategorySelect = (category: string, models: ModelInfo[]) => {
    setSelectedCategory(category)
    setAvailableModels(models)
    if (models.length > 0) {
      setSelectedModel(models[0])
    }
  }

  // Handle model selection from dropdown
  const handleModelSelect = (model: ModelInfo) => {
    setSelectedModel(model)
    setNavMenuValue("") // Close the navigation menu

    // Reset aspect ratio if current ratio is not supported by the new model
    if (model.id === 'fal-ai/wan-effects') {
      // WAN Effects only supports 16:9, 9:16, 1:1
      if (!['16:9', '9:16', '1:1'].includes(aspectRatio)) {
        setAspectRatio('16:9')
      }
    } else if (model.id === 'fal-ai/veo3.1/first-last-frame-to-video') {
      // Veo 3.1 only supports 16:9, 9:16
      if (!['16:9', '9:16'].includes(aspectRatio)) {
        setAspectRatio('16:9')
      }
    }
  }

  // Handle aspect ratio selection
  const handleAspectRatioSelect = (ratio: string) => {
    setAspectRatio(ratio)
  }

  // Handle prompt enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return

    setIsEnhancing(true)
    setOriginalPrompt(prompt) // Store for undo

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          model: selectedModel?.name || 'Unknown Model',
          category: selectedCategory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance prompt')
      }

      setPrompt(data.enhanced)
      toast.success('Prompt enhanced!')
    } catch (error: any) {
      console.error('Enhance prompt error:', error)
      toast.error(error.message || 'Failed to enhance prompt')
      setOriginalPrompt(null) // Clear on error
    } finally {
      setIsEnhancing(false)
    }
  }

  // Handle undo enhancement
  const handleUndoEnhancement = () => {
    if (originalPrompt !== null) {
      setPrompt(originalPrompt)
      setOriginalPrompt(null)
      toast.success('Prompt restored')
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setInputImage({
        file,
        url: null,
        previewUrl
      })
      toast.success('Image uploaded')
    }
  }

  // Handle removing uploaded image
  const handleRemoveInputImage = () => {
    if (inputImage.previewUrl && inputImage.file) {
      URL.revokeObjectURL(inputImage.previewUrl)
    }
    setInputImage({
      file: null,
      url: null,
      previewUrl: null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle start frame upload
  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (startFrame.previewUrl) {
        URL.revokeObjectURL(startFrame.previewUrl)
      }
      setStartFrame({
        file,
        previewUrl: URL.createObjectURL(file)
      })
    }
  }

  // Handle end frame upload
  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (endFrame.previewUrl) {
        URL.revokeObjectURL(endFrame.previewUrl)
      }
      setEndFrame({
        file,
        previewUrl: URL.createObjectURL(file)
      })
    }
  }

  // Handle removing start frame
  const handleRemoveStartFrame = () => {
    if (startFrame.previewUrl) {
      URL.revokeObjectURL(startFrame.previewUrl)
    }
    setStartFrame({ file: null, previewUrl: null })
    if (startFrameInputRef.current) {
      startFrameInputRef.current.value = ''
    }
  }

  // Handle removing end frame
  const handleRemoveEndFrame = () => {
    if (endFrame.previewUrl) {
      URL.revokeObjectURL(endFrame.previewUrl)
    }
    setEndFrame({ file: null, previewUrl: null })
    if (endFrameInputRef.current) {
      endFrameInputRef.current.value = ''
    }
  }

  const handleUseAsInput = (image: GeneratedImage) => {
    // If it's a video, we can't use it as image input (yet)
    if (image.imageUrl?.includes('.mp4') || image.imageUrl?.includes('video')) {
      toast.error('Cannot use video as image input')
      return
    }

    setInputImage({
      file: null,
      url: image.imageUrl,
      previewUrl: image.imageUrl
    })

    // Switch to Image-to-Image or Image-to-Video category if not already
    if (selectedCategory === 'text-to-image') {
      // Try to find image-to-image models
      const i2iModels = ALL_IMAGE_MODELS.filter(m => m.category === 'image-to-image')
      if (i2iModels.length > 0) {
        setSelectedCategory('image-to-image')
        setAvailableModels(i2iModels)
        setSelectedModel(i2iModels[0])
        toast.success('Image selected as input. Switched to Image-to-Image.')
      } else {
        toast.success('Image selected as input')
      }
    } else {
      toast.success('Image selected as input')
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  // Fetch user's images on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchImages()
    }
  }, [status])

  // Periodic background refresh is disabled - polling handles generation updates
  // and completed generations are added directly to state when they finish.
  // This prevents unnecessary S3 signed URL regeneration which was causing performance issues.

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images')
      if (res.ok) {
        const data = await res.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
    }
  }

  const pollGenerationStatus = async (generationId: string, generationType: 'image' | 'video') => {
    // Kling 2.6 and other premium video models can take 5-7 minutes
    const maxAttempts = generationType === 'video' ? 420 : 120 // 7 minutes for video, 2 minutes for images
    let attempts = 0

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        toast.error('Generation is taking longer than expected', {
          description: 'The generation may still complete. Refreshing gallery...',
        })
        setIsGenerating(false)
        // Refresh the gallery to pick up any completed generations
        fetchImages()
        return
      }

      attempts++

      try {
        const res = await fetch(`/api/generations/${generationId}`)
        if (!res.ok) throw new Error('Failed to check status')

        const status = await res.json()

        if (status.status === 'completed') {
          // Generation complete!
          toast.success(generationType === 'video' ? 'Video generated!' : 'Image generated!', {
            description: generationType === 'video' ? 'Your video has been created successfully.' : 'Your image has been created successfully.',
          })

          // Add to images list
          setImages(prev => [{
            id: status.id,
            imageUrl: status.resultUrl,
            seed: status.seed || 0,
            width: status.width || (generationType === 'video' ? 1920 : 1024),
            height: status.height || (generationType === 'video' ? 1080 : 1024),
            prompt: status.prompt,
            createdAt: status.createdAt,
            s3Key: status.s3Key || '',
          }, ...prev])

          setIsGenerating(false)
          setPrompt('')
        } else if (status.status === 'failed') {
          toast.error('Generation failed', {
            description: status.errorMessage || 'Please try again',
          })
          setIsGenerating(false)
        } else {
          // Still processing, poll again
          setTimeout(poll, 1000)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setTimeout(poll, 1000)
      }
    }

    poll()
  }

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim()) return

    // Validate first-last frame model requires both frames
    if (selectedModel.id === 'fal-ai/veo3.1/first-last-frame-to-video') {
      if (!startFrame.file && !endFrame.file) {
        toast.error('Please add both start and end frames')
        return
      }
      if (!startFrame.file) {
        toast.error('Please add a start frame')
        return
      }
      if (!endFrame.file) {
        toast.error('Please add an end frame')
        return
      }
    }

    setIsGenerating(true)
    const generationType = selectedModel.type

    try {
      // Prepare request body
      const body: any = {
        prompt,
        model: selectedModel.id,
        aspectRatio,
        // Add other parameters as needed
      }

      // Add Wan Effects parameters
      if (selectedModel.id === 'fal-ai/wan-effects') {
        body.effectType = effectType
      }

      // Add Negative Prompt for Longcat
      if (selectedModel.id === 'fal-ai/longcat-video/image-to-video/720p' && negativePrompt) {
        body.negativePrompt = negativePrompt
      }

      // Handle image input
      if (inputImage.file) {
        // Convert file to base64
        const reader = new FileReader()
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(inputImage.file!)
        })
        body.imageFile = base64Data
      } else if (inputImage.url) {
        body.imageUrl = inputImage.url
      }

      // Handle Veo 3.1 First-Last Frame
      if (selectedModel.id === 'fal-ai/veo3.1/first-last-frame-to-video') {
        // Convert start frame to base64
        if (startFrame.file) {
          const startBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(startFrame.file!)
          })
          body.firstFrameFile = startBase64
        }
        // Convert end frame to base64
        if (endFrame.file) {
          const endBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(endFrame.file!)
          })
          body.lastFrameFile = endBase64
        }
        body.resolution = veoResolution
      }

      // Handle Kling 2.6 Image-to-Video
      if (selectedModel.id === 'fal-ai/kling-video/v2.6/pro/image-to-video') {
        body.generateAudio = klingAudioEnabled
        body.duration = klingDuration
        // Convert reference image to base64
        if (inputImage.file) {
          const refBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(inputImage.file!)
          })
          body.imageFile = refBase64
        } else if (inputImage.url) {
          body.imageUrl = inputImage.url
        }
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        // Try to parse error as JSON, fallback to text
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const error = await res.json()
          throw new Error(error.error || 'Failed to start generation')
        } else {
          const text = await res.text()
          console.error('Non-JSON response from /api/generate:', text.substring(0, 200))
          throw new Error('Server error - please try again')
        }
      }

      const data = await res.json()

      // Start polling
      let attempts = 0
      // Kling 2.6 and other premium video models can take 5-7 minutes
      const maxAttempts = generationType === 'video' ? 420 : 120 // 7 minutes for video, 2 minutes for images

      const poll = async () => {
        if (attempts >= maxAttempts) {
          toast.error('Generation is taking longer than expected', {
            description: 'The generation may still complete. Refreshing gallery...',
          })
          setIsGenerating(false)
          // Refresh the gallery to pick up any completed generations
          fetchImages()
          return
        }

        attempts++

        try {
          const res = await fetch(`/api/generations/${data.id}`)
          if (!res.ok) throw new Error('Failed to check status')

          const status = await res.json()

          if (status.status === 'completed') {
            // Generation complete!
            toast.success(generationType === 'video' ? 'Video generated!' : 'Image generated!', {
              description: generationType === 'video' ? 'Your video has been created successfully.' : 'Your image has been created successfully.',
            })

            // Add to images list
            setImages(prev => [{
              id: status.id,
              imageUrl: status.resultUrl,
              seed: status.seed || 0,
              width: status.width || (generationType === 'video' ? 1920 : 1024),
              height: status.height || (generationType === 'video' ? 1080 : 1024),
              prompt: status.prompt,
              createdAt: status.createdAt,
              s3Key: status.s3Key || '',
              model: status.model,
            }, ...prev])

            setIsGenerating(false)
            setPrompt('')
          } else if (status.status === 'failed') {
            toast.error('Generation failed', {
              description: status.errorMessage || 'Please try again',
            })
            setIsGenerating(false)
          } else {
            // Still processing, poll again
            setTimeout(poll, 1000)
          }
        } catch (error) {
          console.error('Polling error:', error)
          setTimeout(poll, 1000)
        }
      }

      poll()

    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const res = await fetch(`/api/images/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Delete failed')

      toast.success('Image deleted', {
        description: 'The image has been removed.',
      })

      if (selectedImage?.id === id) {
        setSelectedImage(null)
      }

      setImages(prev => prev.filter(img => img.id !== id))
    } catch (error) {
      toast.error('Failed to delete image', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const selectModelById = (id: string) => {
    const model = [...ALL_IMAGE_MODELS, ...ALL_VIDEO_MODELS].find(m => m.id === id)
    if (model) {
      handleModelSelect(model)
    }
  }

  const sortedImageModels = useMemo(() => {
    // Curated list of image models for dropdown
    const imageModelIds = [
      'fal-ai/stable-diffusion-v35-large',  // Stable Diffusion 3.5 Large
      'fal-ai/flux-pro/v1.1-ultra',          // FLUX 1.1 Pro Ultra
      'fal-ai/fast-sdxl',                    // Stable Diffusion XL
      'fal-ai/gemini-3-pro-image-preview',   // Gemini 3 Pro
    ]
    return imageModelIds
      .map(id => ALL_IMAGE_MODELS.find(m => m.id === id))
      .filter((m): m is ModelInfo => m !== undefined)
  }, [])

  const sortedVideoModels = useMemo(() => {
    // Curated list of video models for dropdown (only models with video thumbnails)
    const videoModelIds = [
      'fal-ai/veo3/fast',                              // Veo 3 Fast
      'fal-ai/veo3.1/first-last-frame-to-video',       // Veo 3.1 First-Last Frame
      'fal-ai/kling-video/v2.6/pro/image-to-video',    // Kling 2.6 Pro I2V
    ]
    return videoModelIds
      .map(id => ALL_VIDEO_MODELS.find(m => m.id === id))
      .filter((m): m is ModelInfo => m !== undefined)
  }, [])

  const sortedEditModels = useMemo(() => {
    // Curated list of image-to-image models for dropdown
    const editModelIds = [
      'fal-ai/gemini-3-pro-image-preview/edit',  // Gemini 3 Pro Edit
      'fal-ai/flux-pro/kontext',                  // FLUX.1 Kontext [pro]
      'fal-ai/flux/dev/image-to-image',           // FLUX.1 [dev] Image-to-Image
      'fal-ai/flux-2/edit',                       // FLUX 2 Edit
      'fal-ai/qwen-image-edit',                   // Qwen Image Edit
    ]
    return editModelIds
      .map(id => ALL_IMAGE_MODELS.find(m => m.id === id))
      .filter((m): m is ModelInfo => m !== undefined)
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex flex-col shrink-0 bg-background/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-auto">
          <div className="flex items-center gap-2 px-4 h-10">
            {/* Desktop sidebar trigger */}
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            {/* Mobile sidebar trigger (hamburger menu) */}
            <SidebarTrigger className="-ml-1 md:hidden" />

            {/* Navigation Menu */}
            <NavigationMenu value={navMenuValue} onValueChange={setNavMenuValue}>
              <NavigationMenuList>
                {/* Image */}
                <NavigationMenuItem value="image">
                  <NavigationMenuTrigger className="h-7 px-2 gap-1.5 text-xs font-medium bg-transparent data-[state=open]:bg-accent/50">
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[300px] p-2 max-h-[600px] overflow-y-auto">
                      {sortedImageModels.map(model => (
                        <ModelItem key={model.id} model={model} onSelect={handleModelSelect} />
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Video */}
                <NavigationMenuItem value="video">
                  <NavigationMenuTrigger className="h-7 px-2 gap-1.5 text-xs font-medium bg-transparent data-[state=open]:bg-accent/50">
                    <Video className="h-4 w-4" />
                    Video
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[300px] p-2 max-h-[600px] overflow-y-auto">
                      {sortedVideoModels.map(model => (
                        <ModelItem key={model.id} model={model} onSelect={handleModelSelect} />
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Effects */}
                <NavigationMenuItem value="effects">
                  <NavigationMenuTrigger className="h-7 px-2 gap-1.5 text-xs font-medium bg-transparent data-[state=open]:bg-accent/50">
                    <Wand className="h-4 w-4" />
                    Effects
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[300px] p-2">
                      {(() => {
                        const wanEffects = ALL_VIDEO_MODELS.find(m => m.id === 'fal-ai/wan-effects')
                        return wanEffects ? <ModelItem model={wanEffects} onSelect={handleModelSelect} /> : null
                      })()}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Edit */}
                <NavigationMenuItem value="edit">
                  <NavigationMenuTrigger className="h-7 px-2 gap-1.5 text-xs font-medium bg-transparent data-[state=open]:bg-accent/50">
                    <Edit className="h-4 w-4" />
                    Edit
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[300px] p-2 max-h-[600px] overflow-y-auto">
                      {sortedEditModels.map(model => (
                        <ModelItem key={model.id} model={model} onSelect={handleModelSelect} />
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="px-4 pb-4 w-full">
            {/* Frame Upload Drawer for Veo 3.1 on Mobile */}
            <Drawer open={isFrameDrawerOpen} onOpenChange={setIsFrameDrawerOpen}>
              <DrawerContent className="bg-sidebar border-sidebar-border">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Upload Frames</DrawerTitle>
                  <DrawerDescription>
                    Add start and end frames for your video generation
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-6">
                  <div className="flex items-center justify-center gap-4">
                    {/* Drawer Start Frame */}
                    <div
                      onClick={() => !startFrame.previewUrl && startFrameInputRef.current?.click()}
                      className={`flex-1 max-w-[160px] h-24 bg-zinc-700/50 hover:bg-zinc-700 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors relative overflow-hidden ${!startFrame.previewUrl ? 'cursor-pointer' : ''}`}
                    >
                      {startFrame.previewUrl ? (
                        <>
                          <Image
                            src={startFrame.previewUrl}
                            alt="Start Frame"
                            fill
                            className="object-cover"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveStartFrame()
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-8 h-8" />
                          <span className="text-sm mt-1">Start Frame</span>
                        </>
                      )}
                    </div>

                    {/* Drawer End Frame */}
                    <div
                      onClick={() => !endFrame.previewUrl && endFrameInputRef.current?.click()}
                      className={`flex-1 max-w-[160px] h-24 bg-zinc-700/50 hover:bg-zinc-700 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors relative overflow-hidden ${!endFrame.previewUrl ? 'cursor-pointer' : ''}`}
                    >
                      {endFrame.previewUrl ? (
                        <>
                          <Image
                            src={endFrame.previewUrl}
                            alt="End Frame"
                            fill
                            className="object-cover"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveEndFrame()
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-8 h-8" />
                          <span className="text-sm mt-1">End Frame</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Done</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            <Card className="w-full bg-sidebar/70 backdrop-blur-md p-0 border border-sidebar-border shadow-none focus-within:ring-1 focus-within:ring-ring">
              <CardContent className="p-0 relative">
                <Textarea
                  placeholder={selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video'
                    ? "Describe motion between start and end frames..."
                    : "Describe the image you want to generate..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isGenerating}
                  className={cn(
                    "min-h-20 w-full resize-none border-0 bg-transparent px-4 pt-3 pb-10 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground",
                    // Add extra bottom padding when image ref box is visible so text wraps above it
                    selectedModel?.id !== 'fal-ai/veo3.1/first-last-frame-to-video' &&
                    (selectedModel?.category === 'image-to-image' || selectedModel?.category === 'image-to-video') &&
                    "md:pb-14"
                  )}
                />

                {/* Icon bar at bottom */}
                <TooltipProvider>
                  <div className="absolute bottom-1.5 left-4 flex items-center gap-2">
                    {/* Model Display (Static) - Show shortened name on mobile for Veo 3.1 */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-7 rounded-md px-2 gap-1.5 flex items-center">
                          {selectedModel?.id?.includes('veo3') || selectedModel?.id?.includes('gemini') ? (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          ) : selectedModel?.id?.toLowerCase().includes('flux') ? (
                            <Image src="/bfl-symbol-white.svg" alt="BFL" width={16} height={16} className="h-4 w-4" />
                          ) : selectedModel?.id?.toLowerCase().includes('wan') || selectedModel?.id?.toLowerCase().includes('qwen') ? (
                            <Image src="/wan-icon.png" alt="Wan" width={16} height={16} className="h-4 w-4" />
                          ) : selectedModel?.id?.toLowerCase().includes('kling') ? (
                            <Image src="/kling-logo.png" alt="Kling" width={16} height={16} className="h-4 w-4" />
                          ) : selectedModel?.id?.toLowerCase().includes('stable-diffusion') ? (
                            <Image src="/stability-logo.png" alt="Stability AI" width={16} height={16} className="h-4 w-4" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video' ? (
                            <>
                              <span className="text-xs font-medium md:hidden">Veo 3.1</span>
                              <span className="text-xs font-medium hidden md:inline">{selectedModel?.name || 'Select Model'}</span>
                            </>
                          ) : (
                            <span className="text-xs font-medium">{selectedModel?.name || 'Select Model'}</span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{selectedModel?.name || 'Current Model'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Aspect Ratio Dropdown */}
                    {selectedModel?.id !== 'fal-ai/longcat-video/image-to-video/720p' &&
                     selectedModel?.id !== 'fal-ai/kling-video/v2.6/pro/image-to-video' && (
                      <Tooltip>
                        <DropdownMenu>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 rounded-md px-2 gap-1.5"
                              >
                                {(() => {
                                  const ratioOptions = selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video'
                                    ? VEO_ASPECT_RATIOS
                                    : selectedModel?.id === 'fal-ai/wan-effects'
                                      ? WAN_ASPECT_RATIOS
                                      : ASPECT_RATIOS
                                  const selected = ratioOptions.find(r => r.ratio === aspectRatio)
                                  const Icon = selected?.icon || RectangleHorizontal
                                  return (
                                    <>
                                      <Icon className="h-4 w-4" />
                                      <span className={`text-xs font-medium ${selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video' ? 'hidden md:inline' : ''}`}>{aspectRatio}</span>
                                      <ChevronDown className="h-3 w-3 opacity-50 hidden md:block" />
                                    </>
                                  )
                                })()}
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <DropdownMenuContent align="start" className="min-w-[180px] bg-sidebar/90 backdrop-blur-md border-sidebar-border">
                            {(selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video'
                              ? VEO_ASPECT_RATIOS
                              : selectedModel?.id === 'fal-ai/wan-effects'
                                ? WAN_ASPECT_RATIOS
                                : ASPECT_RATIOS
                            ).map((ratio) => {
                              const Icon = ratio.icon
                              const isSelected = aspectRatio === ratio.ratio
                              return (
                                <DropdownMenuItem
                                  key={ratio.ratio}
                                  onClick={() => handleAspectRatioSelect(ratio.ratio)}
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="text-xs">{ratio.label}</span>
                                    <span className="text-xs text-muted-foreground">({ratio.ratio})</span>
                                  </div>
                                  {isSelected && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <TooltipContent>
                          <p>Aspect Ratio</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Negative Prompt for Longcat */}
                    {selectedModel?.id === 'fal-ai/longcat-video/image-to-video/720p' && (
                      <Tooltip>
                        <DropdownMenu>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 rounded-md px-2 gap-1.5"
                              >
                                <OctagonX className="h-4 w-4" />
                                <span className="text-xs font-medium max-w-[100px] truncate">
                                  {negativePrompt || 'Negative Prompt'}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-[300px] p-2 bg-sidebar/90 backdrop-blur-md border-sidebar-border"
                          >
                            <div className="p-2">
                              <label className="text-xs font-medium mb-1.5 block">Negative Prompt</label>
                              <Textarea
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="Describe what you don't want..."
                                className="h-20 text-sm bg-background/50"
                                onKeyDown={(e) => e.stopPropagation()}
                              />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <TooltipContent>
                          <p>Negative Prompt</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Wan Effects Dropdown */}
                    {selectedModel?.id === 'fal-ai/wan-effects' && (
                      <Tooltip>
                        <DropdownMenu>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 rounded-md px-2 gap-1.5"
                              >
                                <Wand className="h-4 w-4" />
                                <span className="text-xs font-medium capitalize">{effectType.replace(/-/g, ' ')}</span>
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <DropdownMenuContent align="start" className="h-64 overflow-y-auto bg-sidebar/90 backdrop-blur-md border-sidebar-border">
                            {WAN_EFFECTS.map((effect) => (
                              <DropdownMenuItem
                                key={effect}
                                onClick={() => setEffectType(effect)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <span className="text-xs capitalize">{effect.replace(/-/g, ' ')}</span>
                                {effectType === effect && <Check className="h-4 w-4" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <TooltipContent>
                          <p>Select Effect</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Resolution Selector for Veo 3.1 */}
                    {selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 rounded-md px-2"
                              >
                                <Tv className="h-4 w-4" />
                                <span className="text-xs font-medium hidden md:inline">{veoResolution}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-sidebar/90 backdrop-blur-md border-sidebar-border">
                              <DropdownMenuItem
                                onClick={() => setVeoResolution('720p')}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <span className="text-xs">720p</span>
                                {veoResolution === '720p' && <Check className="h-4 w-4" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setVeoResolution('1080p')}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <span className="text-xs">1080p</span>
                                {veoResolution === '1080p' && <Check className="h-4 w-4" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Resolution</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Frame Upload Button for Veo 3.1 - Mobile only */}
                    {selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 rounded-md px-2 md:hidden relative"
                            onClick={() => setIsFrameDrawerOpen(true)}
                          >
                            <Film className="h-4 w-4" />
                            {(startFrame.previewUrl || endFrame.previewUrl) && (
                              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload Frames</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Audio Toggle and Duration for Kling 2.6 */}
                    {selectedModel?.id === 'fal-ai/kling-video/v2.6/pro/image-to-video' && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 h-7 px-2">
                              <Volume2 className="h-4 w-4" />
                              <Switch
                                checked={klingAudioEnabled}
                                onCheckedChange={setKlingAudioEnabled}
                                className="scale-75"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Generate Audio: {klingAudioEnabled ? 'On' : 'Off'}</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                              <span className="text-xs">{klingDuration}s</span>
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setKlingDuration('5')}>
                              {klingDuration === '5' && <Check className="h-4 w-4 mr-2" />}
                              <span className={klingDuration !== '5' ? 'ml-6' : ''}>5 seconds</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setKlingDuration('10')}>
                              {klingDuration === '10' && <Check className="h-4 w-4 mr-2" />}
                              <span className={klingDuration !== '10' ? 'ml-6' : ''}>10 seconds</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}

                    {/* Enhance Prompt Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEnhancePrompt}
                          disabled={isEnhancing || !prompt.trim() || isGenerating}
                          className="h-7 w-7 rounded-md p-0"
                        >
                          {isEnhancing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Image
                              src={resolvedTheme === 'dark' ? '/Claude symbol - Ivory.svg' : '/Claude symbol - Clay.svg'}
                              alt="Claude"
                              width={16}
                              height={16}
                              className="h-4 w-4"
                            />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enhance prompt with Claude</p>
                      </TooltipContent>
                    </Tooltip>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </TooltipProvider >

                {/* Start/End Frame buttons for Veo 3.1 First-Last Frame - Desktop only */}
                {selectedModel?.id === 'fal-ai/veo3.1/first-last-frame-to-video' && (
                  <div className="hidden md:flex absolute bottom-1.5 right-21 items-center gap-2">
                    {/* Start Frame Button */}
                    <div
                      onClick={() => !startFrame.previewUrl && startFrameInputRef.current?.click()}
                      className={`w-20 h-14 bg-zinc-700/50 hover:bg-zinc-700 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors relative overflow-hidden ${!startFrame.previewUrl ? 'cursor-pointer' : ''}`}
                    >
                      {startFrame.previewUrl ? (
                        <>
                          <Image
                            src={startFrame.previewUrl}
                            alt="Start Frame"
                            fill
                            className="object-cover"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveStartFrame()
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-4 w-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] mt-0.5">Start Frame</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={startFrameInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleStartFrameUpload}
                      className="hidden"
                    />

                    {/* End Frame Button */}
                    <div
                      onClick={() => !endFrame.previewUrl && endFrameInputRef.current?.click()}
                      className={`w-20 h-14 bg-zinc-700/50 hover:bg-zinc-700 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors relative overflow-hidden ${!endFrame.previewUrl ? 'cursor-pointer' : ''}`}
                    >
                      {endFrame.previewUrl ? (
                        <>
                          <Image
                            src={endFrame.previewUrl}
                            alt="End Frame"
                            fill
                            className="object-cover"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveEndFrame()
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-4 w-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] mt-0.5">End Frame</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={endFrameInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEndFrameUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Image Ref box for models that need input images (image-to-image, image-to-video except Veo 3.1) */}
                {selectedModel?.id !== 'fal-ai/veo3.1/first-last-frame-to-video' &&
                 (selectedModel?.category === 'image-to-image' || selectedModel?.category === 'image-to-video') && (
                  <div className="hidden md:flex absolute bottom-1.5 right-21 items-center gap-2">
                    <div
                      onClick={() => !inputImage.previewUrl && fileInputRef.current?.click()}
                      className={`w-20 h-14 bg-zinc-700/50 hover:bg-zinc-700 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors relative overflow-hidden ${!inputImage.previewUrl ? 'cursor-pointer' : ''}`}
                    >
                      {inputImage.previewUrl ? (
                        <>
                          <Image
                            src={inputImage.previewUrl}
                            alt="Reference Image"
                            fill
                            className="object-cover"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveInputImage()
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-4 w-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] mt-0.5">Image Ref</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <TooltipProvider>
                  <div className="absolute bottom-1.5 right-2 flex items-center gap-1.5">
                    {/* Undo Enhancement Button */}
                    {originalPrompt !== null && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleUndoEnhancement}
                            className="h-8 w-8 rounded-full"
                          >
                            <Undo2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Undo enhancement</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Submit Button */}
                    <Button
                      size="icon"
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="h-8 w-8 rounded-full shadow-sm"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TooltipProvider>
              </CardContent >
            </Card >
          </div >
        </header >

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto">
          {/* Grid Gallery */}
          {/* Masonry Layout */}
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {isGenerating && (
              <div className="break-inside-avoid mb-4 rounded-lg overflow-hidden relative border border-zinc-800 bg-zinc-900/50">
                {/* Skeleton with aspect ratio of the request */}
                <div style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                  <Skeleton className="h-full w-full bg-zinc-800/80" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900/80 to-zinc-900/40">
                  <Orbit className="h-10 w-10 text-zinc-400 animate-spin [animation-direction:reverse] [&_circle]:fill-current" strokeWidth={1} />
                </div>
              </div>
            )}
            {images.map((image) => {
              const isVideo = image.imageUrl?.includes('.mp4') || image.imageUrl?.includes('video')
              // Calculate aspect ratio from width/height if available, else default to square
              const ratio = image.width && image.height ? `${image.width}/${image.height}` : '1/1'

              return (
                <div
                  key={image.id}
                  className="break-inside-avoid mb-4 relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                  onMouseEnter={() => setHoveredId(image.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative" style={{ aspectRatio: ratio }}>
                    {/* Skeleton background - always visible behind image */}
                    <Skeleton className="absolute inset-0 bg-zinc-800" />
                    {isVideo ? (
                      <video
                        src={image.imageUrl}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-80"
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    ) : (
                      <Image
                        src={image.imageUrl}
                        alt={image.prompt?.substring(0, 50) || 'Generated image'}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        className="object-cover transition-opacity group-hover:opacity-80"
                        loading="lazy"
                        onError={(e) => {
                          // Hide broken image - skeleton will show through
                          const target = e.target as HTMLImageElement
                          target.style.opacity = '0'
                        }}
                        unoptimized={image.imageUrl?.includes('fal.media') || image.imageUrl?.includes('fal.ai')}
                      />
                    )}
                  </div>

                  {/* Hover Actions */}
                  {hoveredId === image.id && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      {/* Use as Input Button */}
                      {!isVideo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUseAsInput(image)
                          }}
                          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors backdrop-blur-sm"
                          aria-label="Use as input"
                          title="Use as input image"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(image.id, e)}
                        className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-md transition-colors backdrop-blur-sm"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {images.length === 0 && !isGenerating && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>No images yet. Start by creating one above!</p>
            </div>
          )}
        </div>

        {/* Expanded View Modal */}
        {
          selectedImage && (() => {
            const isVideo = selectedImage.imageUrl?.includes('.mp4') || selectedImage.imageUrl?.includes('video')
            return (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
                onClick={() => setSelectedImage(null)}
              >
                <div
                  className="relative w-full max-w-7xl h-full max-h-[90vh] bg-background rounded-lg shadow-lg flex overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
                    aria-label="Close expanded view"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Media Section - Left */}
                  <div className="flex-1 flex items-center justify-center bg-muted p-8 relative">
                    <div className="relative w-full h-full">
                      {isVideo ? (
                        <video
                          src={selectedImage.imageUrl}
                          className="w-full h-full object-contain rounded-lg"
                          controls
                          autoPlay
                          loop
                        />
                      ) : (
                        <Image
                          src={selectedImage.imageUrl}
                          alt={selectedImage.prompt?.substring(0, 50) || 'Generated image'}
                          fill
                          sizes="(max-width: 768px) 100vw, 70vw"
                          className="object-contain rounded-lg"
                          priority
                        />
                      )}
                    </div>
                  </div>

                  {/* Details Section - Right */}
                  <div className="w-96 bg-background border-l p-6 overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4">{isVideo ? 'Video' : 'Image'} Details</h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Prompt</h3>
                        <p className="text-sm">{selectedImage.prompt}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Model</h3>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {(() => {
                            const allModels = [...ALL_IMAGE_MODELS, ...ALL_VIDEO_MODELS];
                            const modelInfo = allModels.find(m => m.id === selectedImage.model);
                            return modelInfo ? modelInfo.name : (selectedImage.model || 'Unknown Model');
                          })()}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Resolution</h3>
                        <p className="text-sm">{selectedImage.width} × {selectedImage.height}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                        <p className="text-sm">{new Date(selectedImage.createdAt).toLocaleString()}</p>
                      </div>

                      {/* Actions in details panel */}
                      <div className="pt-4 space-y-2">
                        <button
                          onClick={() => {
                            const filename = `generated-${selectedImage.id}.${isVideo ? 'mp4' : 'png'}`;
                            const downloadUrl = `/api/download?url=${encodeURIComponent(selectedImage.imageUrl)}&filename=${encodeURIComponent(filename)}`;
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full py-2 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>

                        {!isVideo && (
                          <button
                            onClick={() => {
                              handleUseAsInput(selectedImage)
                              setSelectedImage(null)
                            }}
                            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center justify-center gap-2"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            Use as Input
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDelete(selectedImage.id, e)}
                          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isVideo ? 'Delete Video' : 'Delete Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()
        }
      </SidebarInset >
    </SidebarProvider >
  )
}

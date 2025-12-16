"use client"

import * as React from "react"
import { Settings2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"
import { Field, FieldLabel } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { IMAGE_MODELS, VIDEO_MODELS, ASPECT_RATIOS } from "@/lib/models"
import { ALL_IMAGE_MODELS, ALL_VIDEO_MODELS } from "@/lib/all-models"
import { ModelSelector } from "@/components/model-selector"
import { ChevronDown, Check } from "lucide-react"

// WAN Effects options
const EFFECT_TYPES = [
  { value: "cakeify", label: "Cakeify" },
  { value: "squish", label: "Squish" },
  { value: "muscle", label: "Muscle" },
  { value: "inflate", label: "Inflate" },
  { value: "crush", label: "Crush" },
  { value: "rotate", label: "Rotate" },
  { value: "gun-shooting", label: "Gun Shooting" },
  { value: "deflate", label: "Deflate" },
  { value: "hulk", label: "Hulk" },
  { value: "baby", label: "Baby" },
  { value: "bride", label: "Bride" },
  { value: "classy", label: "Classy" },
  { value: "puppy", label: "Puppy" },
  { value: "snow-white", label: "Snow White" },
  { value: "disney-princess", label: "Disney Princess" },
  { value: "mona-lisa", label: "Mona Lisa" },
  { value: "painting", label: "Painting" },
  { value: "pirate-captain", label: "Pirate Captain" },
  { value: "princess", label: "Princess" },
  { value: "jungle", label: "Jungle" },
  { value: "samurai", label: "Samurai" },
  { value: "vip", label: "VIP" },
  { value: "warrior", label: "Warrior" },
  { value: "zen", label: "Zen" },
  { value: "assassin", label: "Assassin" },
  { value: "timelapse", label: "Timelapse" },
  { value: "tsunami", label: "Tsunami" },
  { value: "fire", label: "Fire" },
  { value: "zoom-call", label: "Zoom Call" },
  { value: "doom-fps", label: "Doom FPS" },
  { value: "fus-ro-dah", label: "Fus Ro Dah" },
  { value: "hug-jesus", label: "Hug Jesus" },
  { value: "robot-face-reveal", label: "Robot Face Reveal" },
  { value: "super-saiyan", label: "Super Saiyan" },
  { value: "jumpscare", label: "Jumpscare" },
  { value: "laughing", label: "Laughing" },
  { value: "cartoon-jaw-drop", label: "Cartoon Jaw Drop" },
  { value: "crying", label: "Crying" },
  { value: "kissing", label: "Kissing" },
  { value: "angry-face", label: "Angry Face" },
  { value: "selfie-younger-self", label: "Selfie Younger Self" },
  { value: "animeify", label: "Animeify" },
  { value: "blast", label: "Blast" },
]

export type GenerationType = "image" | "video"

export interface GenerationParameters {
  aspectRatio: string
  numInferenceSteps: number
  guidanceScale: number
  seed?: number
  // Video-specific parameters
  imageUrl?: string
  imageFile?: File
  audioUrl?: string
  audioFile?: File
  resolution?: '480' | '720' | '1080'
  duration?: 5 | 10
  negativePrompt?: string
  enablePromptExpansion?: boolean
  enableSafetyChecker?: boolean
  // WAN Effects parameters
  subject?: string
  effectType?: string
  numFrames?: number
  framesPerSecond?: number
  loraScale?: number
  turboMode?: boolean
}

interface GenerationSidebarProps extends React.ComponentProps<typeof Sidebar> {
  generationType: GenerationType
  onGenerationTypeChange: (type: GenerationType) => void
  selectedModel: string
  onSelectModel: (modelId: string) => void
  parameters: GenerationParameters
  onParametersChange: (params: Partial<GenerationParameters>) => void
}

export function GenerationSidebar({
  generationType,
  onGenerationTypeChange,
  selectedModel,
  onSelectModel,
  parameters,
  onParametersChange,
  ...props
}: GenerationSidebarProps) {
  const { data: session } = useSession()

  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image || "/avatars/default.jpg",
  }

  const allModels = [...ALL_IMAGE_MODELS, ...ALL_VIDEO_MODELS]
  const currentModel = allModels.find(m => m.id === selectedModel)

  return (
    <Sidebar
      {...props}
    >
      <SidebarHeader className="p-[5px]">
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="space-y-4 px-4 pt-0">
            {/* Model Selector - Replaces both Generation Type and Model dropdowns */}
            <Field>
              <FieldLabel className="text-xs text-muted-foreground">Model</FieldLabel>
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModel={(modelId) => {
                  onSelectModel(modelId)
                  // Auto-detect generation type based on selected model
                  const allModels = [...ALL_IMAGE_MODELS, ...ALL_VIDEO_MODELS]
                  const model = allModels.find(m => m.id === modelId)
                  if (model) {
                    onGenerationTypeChange(model.type || "image")
                  }
                }}
                imageModels={ALL_IMAGE_MODELS}
                videoModels={ALL_VIDEO_MODELS}
              />
            </Field>

            {/* Image Size Selector - Only for Image Generation */}
            {generationType === "image" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Image Size</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-9 justify-between">
                      {(() => {
                        const selectedRatio = ASPECT_RATIOS.find(r => r.ratio === parameters.aspectRatio) || ASPECT_RATIOS[0]
                        const Icon = selectedRatio.icon
                        return (
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-sm">{selectedRatio.label}</span>
                            <span className="text-xs text-muted-foreground">
                              ({selectedRatio.width}×{selectedRatio.height})
                            </span>
                          </div>
                        )
                      })()}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                    {ASPECT_RATIOS.map((ratio) => {
                      const Icon = ratio.icon
                      const isSelected = parameters.aspectRatio === ratio.ratio
                      return (
                        <DropdownMenuItem
                          key={ratio.ratio}
                          onClick={() => onParametersChange({ aspectRatio: ratio.ratio })}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            <span>{ratio.label}</span>
                            <span className="text-xs text-muted-foreground">
                              ({ratio.width}×{ratio.height})
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Image Generation Parameters */}
            {generationType === "image" && (
              <Accordion type="single" collapsible defaultValue="image-settings">
                <AccordionItem value="image-settings" className="border-none">
                  <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-3 w-3" />
                      Generation Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {/* Inference Steps */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Inference Steps</Label>
                        <span className="text-xs text-muted-foreground">{parameters.numInferenceSteps || 28}</span>
                      </div>
                      <Slider
                        value={[parameters.numInferenceSteps || 28]}
                        onValueChange={([value]) => onParametersChange({ numInferenceSteps: value })}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        More steps = higher quality but slower (1-50)
                      </p>
                    </div>

                    {/* Guidance Scale */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Guidance Scale</Label>
                        <span className="text-xs text-muted-foreground">{parameters.guidanceScale?.toFixed(1) || '3.5'}</span>
                      </div>
                      <Slider
                        value={[parameters.guidanceScale || 3.5]}
                        onValueChange={([value]) => onParametersChange({ guidanceScale: value })}
                        min={1}
                        max={20}
                        step={0.5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        How closely to follow the prompt (1-20)
                      </p>
                    </div>

                    {/* Negative Prompt */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Negative Prompt (Optional)</Label>
                      <Textarea
                        placeholder="Things to avoid (e.g., blurry, low quality, distorted)..."
                        value={parameters.negativePrompt || ''}
                        onChange={(e) => onParametersChange({ negativePrompt: e.target.value })}
                        className="min-h-[60px] resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        Max 500 characters
                      </p>
                    </div>

                    {/* Seed */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Seed (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="Random"
                        value={parameters.seed || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined
                          onParametersChange({ seed: value })
                        }}
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use the same seed for reproducible results
                      </p>
                    </div>

                    {/* Enable Safety Checker */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="safety-checker-image"
                        checked={parameters.enableSafetyChecker ?? true}
                        onCheckedChange={(checked) =>
                          onParametersChange({ enableSafetyChecker: checked as boolean })
                        }
                      />
                      <label
                        htmlFor="safety-checker-image"
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        Enable Safety Checker (content filtering)
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Image-to-Video Specific Inputs */}
            {currentModel?.category === 'image-to-video' && selectedModel !== 'fal-ai/wan-effects' && (
              <>
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Input Image (Required)</Label>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Image URL"
                      value={parameters.imageUrl || ''}
                      onChange={(e) => onParametersChange({ imageUrl: e.target.value })}
                      className="h-9"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onParametersChange({ imageFile: file })
                      }}
                      className="h-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL or upload image (360-2000px, max 25MB)
                  </p>
                </div>

                {/* Audio Upload */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Background Audio (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Audio URL (WAV/MP3)"
                      value={parameters.audioUrl || ''}
                      onChange={(e) => onParametersChange({ audioUrl: e.target.value })}
                      className="h-9"
                    />
                    <Input
                      type="file"
                      accept="audio/wav,audio/mp3,audio/mpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onParametersChange({ audioFile: file })
                      }}
                      className="h-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    3-30 seconds, max 15MB
                  </p>
                </div>

                {/* Additional Settings for Image-to-Video */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="video-settings" className="border-none">
                    <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-3 w-3" />
                        Additional Settings
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      {/* Resolution */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Resolution</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-9 justify-between">
                              <span className="text-sm">
                                {parameters.resolution === '480' && '480p ($0.05/sec)'}
                                {parameters.resolution === '720' && '720p ($0.10/sec)'}
                                {(!parameters.resolution || parameters.resolution === '1080') && '1080p ($0.15/sec)'}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ resolution: '480' })}
                              className="flex items-center justify-between"
                            >
                              <span>480p ($0.05/sec)</span>
                              {parameters.resolution === '480' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ resolution: '720' })}
                              className="flex items-center justify-between"
                            >
                              <span>720p ($0.10/sec)</span>
                              {parameters.resolution === '720' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ resolution: '1080' })}
                              className="flex items-center justify-between"
                            >
                              <span>1080p ($0.15/sec)</span>
                              {(!parameters.resolution || parameters.resolution === '1080') && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Duration</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-9 justify-between">
                              <span className="text-sm">
                                {(parameters.duration === 10) ? '10 seconds' : '5 seconds'}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ duration: 5 })}
                              className="flex items-center justify-between"
                            >
                              <span>5 seconds</span>
                              {parameters.duration !== 10 && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ duration: 10 })}
                              className="flex items-center justify-between"
                            >
                              <span>10 seconds</span>
                              {parameters.duration === 10 && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Negative Prompt */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Negative Prompt (Optional)</Label>
                        <Textarea
                          placeholder="Content to avoid in generation..."
                          value={parameters.negativePrompt || ''}
                          onChange={(e) => onParametersChange({ negativePrompt: e.target.value })}
                          className="min-h-[60px] resize-none"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          Max 500 characters
                        </p>
                      </div>

                      {/* Enable Prompt Expansion */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prompt-expansion-img2vid"
                          checked={parameters.enablePromptExpansion ?? true}
                          onCheckedChange={(checked) =>
                            onParametersChange({ enablePromptExpansion: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="prompt-expansion-img2vid"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Enable Prompt Expansion (LLM-powered rewriting)
                        </label>
                      </div>

                      {/* Enable Safety Checker */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="safety-checker-img2vid"
                          checked={parameters.enableSafetyChecker ?? true}
                          onCheckedChange={(checked) =>
                            onParametersChange({ enableSafetyChecker: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="safety-checker-img2vid"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Enable Safety Checker (content filtering)
                        </label>
                      </div>

                      {/* Seed */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Seed (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="Random"
                          value={parameters.seed || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined
                            onParametersChange({ seed: value })
                          }}
                          className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use the same seed for reproducible results
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}

            {/* Text-to-Video Parameters - For ALL text-to-video models */}
            {generationType === "video" && currentModel?.category !== 'image-to-video' && selectedModel !== 'fal-ai/wan-effects' && (
              <>
                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-9 justify-between">
                        <span className="text-sm">{parameters.aspectRatio || '16:9'} {
                          parameters.aspectRatio === '16:9' || !parameters.aspectRatio ? '(Wide)' :
                            parameters.aspectRatio === '9:16' ? '(Portrait)' : '(Square)'
                        }</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                      <DropdownMenuItem
                        onClick={() => onParametersChange({ aspectRatio: '16:9' })}
                        className="flex items-center justify-between"
                      >
                        <span>16:9 (Wide)</span>
                        {(!parameters.aspectRatio || parameters.aspectRatio === '16:9') && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onParametersChange({ aspectRatio: '9:16' })}
                        className="flex items-center justify-between"
                      >
                        <span>9:16 (Portrait)</span>
                        {parameters.aspectRatio === '9:16' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onParametersChange({ aspectRatio: '1:1' })}
                        className="flex items-center justify-between"
                      >
                        <span>1:1 (Square)</span>
                        {parameters.aspectRatio === '1:1' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Video Generation Settings */}
                <Accordion type="single" collapsible defaultValue="video-settings">
                  <AccordionItem value="video-settings" className="border-none">
                    <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-3 w-3" />
                        Video Settings
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      {/* Duration */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Duration</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-9 justify-between">
                              <span className="text-sm">
                                {(parameters.duration === 10) ? '10 seconds' : '5 seconds'}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ duration: 5 })}
                              className="flex items-center justify-between"
                            >
                              <span>5 seconds</span>
                              {parameters.duration !== 10 && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ duration: 10 })}
                              className="flex items-center justify-between"
                            >
                              <span>10 seconds</span>
                              {parameters.duration === 10 && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Resolution */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Resolution</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-9 justify-between">
                              <span className="text-sm">
                                {parameters.resolution === '480' && '480p'}
                                {parameters.resolution === '720' && '720p'}
                                {(!parameters.resolution || parameters.resolution === '1080') && '1080p'}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ resolution: '480' })}
                              className="flex items-center justify-between"
                            >
                              <span>480p</span>
                              {parameters.resolution === '480' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ resolution: '720' })}
                              className="flex items-center justify-between"
                            >
                              <span>720p</span>
                              {parameters.resolution === '720' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ resolution: '1080' })}
                              className="flex items-center justify-between"
                            >
                              <span>1080p</span>
                              {(!parameters.resolution || parameters.resolution === '1080') && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Inference Steps */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Inference Steps</Label>
                          <span className="text-xs text-muted-foreground">{parameters.numInferenceSteps || 30}</span>
                        </div>
                        <Slider
                          value={[parameters.numInferenceSteps || 30]}
                          onValueChange={([value]) => onParametersChange({ numInferenceSteps: value })}
                          min={10}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          More steps = higher quality (10-50)
                        </p>
                      </div>

                      {/* Guidance Scale */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Guidance Scale</Label>
                          <span className="text-xs text-muted-foreground">{parameters.guidanceScale?.toFixed(1) || '7.5'}</span>
                        </div>
                        <Slider
                          value={[parameters.guidanceScale || 7.5]}
                          onValueChange={([value]) => onParametersChange({ guidanceScale: value })}
                          min={1}
                          max={20}
                          step={0.5}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          How closely to follow the prompt (1-20)
                        </p>
                      </div>

                      {/* Negative Prompt */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Negative Prompt (Optional)</Label>
                        <Textarea
                          placeholder="low resolution, blurry, distorted, error..."
                          value={parameters.negativePrompt || ''}
                          onChange={(e) => onParametersChange({ negativePrompt: e.target.value })}
                          className="min-h-[60px] resize-none"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          Max 500 characters
                        </p>
                      </div>

                      {/* Seed */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Seed (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="Random"
                          value={parameters.seed || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined
                            onParametersChange({ seed: value })
                          }}
                          className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use the same seed for reproducible results
                        </p>
                      </div>

                      {/* Enable Prompt Expansion */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prompt-expansion-video"
                          checked={parameters.enablePromptExpansion ?? true}
                          onCheckedChange={(checked) =>
                            onParametersChange({ enablePromptExpansion: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="prompt-expansion-video"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Enable Prompt Expansion
                        </label>
                      </div>

                      {/* Enable Safety Checker */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="safety-checker-video"
                          checked={parameters.enableSafetyChecker ?? true}
                          onCheckedChange={(checked) =>
                            onParametersChange({ enableSafetyChecker: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="safety-checker-video"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Enable Safety Checker
                        </label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}

            {/* WAN Effects Specific Inputs */}
            {selectedModel === 'fal-ai/wan-effects' && (
              <>
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Input Image (Required)</Label>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Image URL"
                      value={parameters.imageUrl || ''}
                      onChange={(e) => onParametersChange({ imageUrl: e.target.value })}
                      className="h-9"
                    />
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onParametersChange({ imageFile: file })
                      }}
                      className="h-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formats: jpg, jpeg, png, webp, gif, avif
                  </p>
                </div>

                {/* Effect Type */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Effect Type</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-9 justify-between">
                        <span className="text-sm">
                          {EFFECT_TYPES.find(e => e.value === (parameters.effectType || 'cakeify'))?.label}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto" align="start">
                      {EFFECT_TYPES.map((effect) => {
                        const isSelected = (parameters.effectType || 'cakeify') === effect.value
                        return (
                          <DropdownMenuItem
                            key={effect.value}
                            onClick={() => onParametersChange({ effectType: effect.value })}
                            className="flex items-center justify-between"
                          >
                            <span>{effect.label}</span>
                            {isSelected && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Additional Settings for WAN Effects */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="effects-settings" className="border-none">
                    <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-3 w-3" />
                        Additional Settings
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      {/* Aspect Ratio */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-9 justify-between">
                              <span className="text-sm">{parameters.aspectRatio || '16:9'} {
                                parameters.aspectRatio === '16:9' || !parameters.aspectRatio ? '(Wide)' :
                                  parameters.aspectRatio === '9:16' ? '(Portrait)' : '(Square)'
                              }</span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ aspectRatio: '16:9' })}
                              className="flex items-center justify-between"
                            >
                              <span>16:9 (Wide)</span>
                              {(!parameters.aspectRatio || parameters.aspectRatio === '16:9') && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ aspectRatio: '9:16' })}
                              className="flex items-center justify-between"
                            >
                              <span>9:16 (Portrait)</span>
                              {parameters.aspectRatio === '9:16' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onParametersChange({ aspectRatio: '1:1' })}
                              className="flex items-center justify-between"
                            >
                              <span>1:1 (Square)</span>
                              {parameters.aspectRatio === '1:1' && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Num Frames */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Num Frames</Label>
                          <span className="text-xs text-muted-foreground">{parameters.numFrames || 81}</span>
                        </div>
                        <Slider
                          value={[parameters.numFrames || 81]}
                          onValueChange={([value]) => onParametersChange({ numFrames: value })}
                          min={81}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Number of frames (81-100)
                        </p>
                      </div>

                      {/* Frames Per Second */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Frames Per Second</Label>
                          <span className="text-xs text-muted-foreground">{parameters.framesPerSecond || 16}</span>
                        </div>
                        <Slider
                          value={[parameters.framesPerSecond || 16]}
                          onValueChange={([value]) => onParametersChange({ framesPerSecond: value })}
                          min={5}
                          max={24}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          FPS (5-24)
                        </p>
                      </div>

                      {/* Num Inference Steps */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Inference Steps</Label>
                          <span className="text-xs text-muted-foreground">{parameters.numInferenceSteps || 30}</span>
                        </div>
                        <Slider
                          value={[parameters.numInferenceSteps || 30]}
                          onValueChange={([value]) => onParametersChange({ numInferenceSteps: value })}
                          min={2}
                          max={40}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Lora Scale */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">LoRA Scale</Label>
                          <span className="text-xs text-muted-foreground">{parameters.loraScale?.toFixed(1) || '1.0'}</span>
                        </div>
                        <Slider
                          value={[parameters.loraScale || 1.0]}
                          onValueChange={([value]) => onParametersChange({ loraScale: value })}
                          min={0.1}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Adjusts effect intensity (0.1-2.0)
                        </p>
                      </div>

                      {/* Turbo Mode */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="turbo-mode"
                          checked={parameters.turboMode ?? false}
                          onCheckedChange={(checked) =>
                            onParametersChange({ turboMode: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="turbo-mode"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Enable Turbo Mode (faster, reduced quality)
                        </label>
                      </div>

                      {/* Seed */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Seed (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="Random"
                          value={parameters.seed || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined
                            onParametersChange({ seed: value })
                          }}
                          className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use the same seed for reproducible results
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

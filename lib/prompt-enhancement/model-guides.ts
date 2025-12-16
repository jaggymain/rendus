/**
 * Model-Specific Prompt Enhancement Guidelines
 *
 * This file contains structured configuration for each AI model's
 * optimal prompting style, constraints, and enhancement strategies.
 */

export interface ModelGuide {
  modelId: string
  modelName: string
  type: 'image' | 'video'

  // Prompt structure
  optimalLength: {
    min: number
    max: number
    ideal: number
  }

  // Structure guidelines
  promptStructure: string[]

  // Key elements to include
  keyElements: string[]

  // Things to avoid
  avoid: string[]

  // Camera/cinematography support
  supportsCameraDirections: boolean
  cameraTerms?: string[]

  // Special features
  specialFeatures?: {
    supportsDialogue?: boolean
    supportsAudio?: boolean
    supportsTextInImage?: boolean
    supportsStylePresets?: boolean
    supportsBrandColors?: boolean
    supportsNegativePrompt?: boolean
  }

  // Example transformations
  exampleInput: string
  exampleOutput: string

  // Enhancement system prompt
  systemPromptAddition: string
}

// ============================================
// VIDEO MODELS
// ============================================

export const KLING_GUIDE: ModelGuide = {
  modelId: 'fal-ai/kling-video',
  modelName: 'Kling',
  type: 'video',

  optimalLength: {
    min: 30,
    max: 60,
    ideal: 50
  },

  promptStructure: [
    'Subject + Description',
    'Movement/Action',
    'Scene/Environment',
    'Style (optional)'
  ],

  keyElements: [
    'Clear subject identification',
    'Specific movement descriptions',
    'Environmental context',
    'Lighting conditions',
    'Camera angle if needed'
  ],

  avoid: [
    'Overly complex multi-scene descriptions',
    'Abstract concepts without visual anchors',
    'Excessive adjective stacking',
    'Instructions or commands to the AI',
    'Multiple simultaneous complex actions'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'tracking shot', 'pan', 'zoom', 'dolly', 'static shot',
    'close-up', 'wide shot', 'medium shot', 'aerial view'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'A sleek black drone glides smoothly through the Grand Canyon, its propellers spinning rapidly. The camera follows alongside as it weaves between towering rust-red rock formations. Golden afternoon sunlight illuminates the layered canyon walls while the Colorado River glimmers far below.',

  systemPromptAddition: `For Kling video generation:
- Keep prompts concise (around 50 words)
- Use structure: [Subject + Description] + [Movement] + [Scene]
- Be specific about movements but avoid complexity
- Include lighting and atmosphere details
- Camera terms are supported but use sparingly
- Avoid instructional language like "create" or "generate"
- Focus on one main action or movement`
}

export const VEO3_GUIDE: ModelGuide = {
  modelId: 'fal-ai/veo3',
  modelName: 'Veo 3',
  type: 'video',

  optimalLength: {
    min: 50,
    max: 120,
    ideal: 80
  },

  promptStructure: [
    'Scene setting and atmosphere',
    'Main subject with detailed description',
    'Action/Movement sequence',
    'Camera work and framing',
    'Audio/dialogue (if applicable)',
    'Mood and style'
  ],

  keyElements: [
    'Highly specific visual descriptions',
    'Dialogue in quotes with speaker attribution',
    'Audio cues and ambient sounds',
    'Detailed camera movements',
    'Emotional tone and atmosphere',
    'Specific time of day and lighting'
  ],

  avoid: [
    'Vague or generic descriptions',
    'Missing dialogue attribution',
    'Ignoring audio possibilities',
    'Overly static scenes'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'tracking shot', 'dolly zoom', 'crane shot', 'steadicam',
    'handheld', 'rack focus', 'pull focus', 'whip pan',
    'slow motion', 'time-lapse', 'POV shot'
  ],

  specialFeatures: {
    supportsDialogue: true,
    supportsAudio: true,
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'Aerial establishing shot of the Grand Canyon at golden hour. A compact white drone emerges from behind a sandstone spire, its motors humming softly against the wind. The camera tracks alongside as it descends into the canyon depths, passing stratified rock layers of orange, red, and cream. The whoosh of wind grows louder as the drone accelerates, banking gracefully around a jutting outcrop. Below, the turquoise Colorado River snakes through the shadowed canyon floor. Warm sunlight catches the drone\'s rotors, creating brief lens flares. The shot ends with the drone hovering motionless, surveying the vast prehistoric landscape stretching to the horizon.',

  systemPromptAddition: `For Veo 3 video generation:
- Be highly specific and detailed (80+ words acceptable)
- Include dialogue in quotes with speaker names if applicable
- Describe ambient sounds and audio elements
- Use sophisticated camera terminology
- Layer your descriptions: environment, subject, action, mood
- Veo 3 excels at complex, cinematic sequences
- Include lighting transitions and atmospheric details`
}

export const MINIMAX_VIDEO_GUIDE: ModelGuide = {
  modelId: 'fal-ai/minimax-video',
  modelName: 'MiniMax Hailuo',
  type: 'video',

  optimalLength: {
    min: 40,
    max: 100,
    ideal: 70
  },

  promptStructure: [
    '[Camera + Motion]',
    '[Subject + Description]',
    '[Action]',
    '[Scene + Lighting + Style]'
  ],

  keyElements: [
    'Camera movement at the start',
    'Specific subject description',
    'Clear action with pacing notes',
    'Lighting and atmosphere',
    'Simple backgrounds for best results'
  ],

  avoid: [
    'Fast movements combined with camera motion',
    'Unrealistic movement that contradicts the source image',
    'Generic descriptions like "person walking"',
    'Multiple complex simultaneous actions',
    'Overly busy backgrounds'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'pan left', 'pan right', 'slow zoom', 'dolly in',
    'tracking shot', 'handheld', 'rack focus', 'static shot',
    'crane up', 'tilt down'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'Slow tracking shot following a matte black quadcopter drone as it navigates through the Grand Canyon. The drone banks smoothly to the right, rotors catching the warm afternoon light. Towering canyon walls of deep terracotta and burnt orange rise on either side. Soft natural lighting with subtle shadows cast by the rock formations. Cinematic, documentary style.',

  systemPromptAddition: `For MiniMax/Hailuo video generation:
- Start prompts with camera movement
- Use structure: [Camera] + [Subject] + [Action] + [Scene + Style]
- Be specific about movement speed and direction
- Keep backgrounds relatively simple
- Avoid combining fast subject movement with camera motion
- Describe lighting conditions specifically
- MiniMax excels at smooth, professional camera work`
}

export const WAN_GUIDE: ModelGuide = {
  modelId: 'fal-ai/wan',
  modelName: 'Wan',
  type: 'video',

  optimalLength: {
    min: 60,
    max: 150,
    ideal: 100
  },

  promptStructure: [
    'Scene establishment',
    'Subject with physical details',
    'Action sequence with timing',
    'Environmental details',
    'Cinematic style and mood',
    'Camera work'
  ],

  keyElements: [
    'Cinematic terminology',
    'Detailed physical descriptions',
    'Clear motion choreography',
    'Atmospheric elements',
    'Film-style references',
    'Lighting direction'
  ],

  avoid: [
    'Ambiguous subjects',
    'Conflicting style references',
    'Overly abstract concepts',
    'Rushed action descriptions'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'establishing shot', 'tracking shot', 'dolly', 'crane',
    'steadicam', 'handheld', 'aerial', 'POV', 'over-the-shoulder',
    'dutch angle', 'low angle', 'high angle'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'Cinematic aerial sequence through the Grand Canyon at sunset. A professional-grade drone with carbon fiber arms cuts through the amber-lit air, its four rotors creating a soft whir. The establishing shot captures the drone entering frame from the left, silhouetted against layers of sedimentary rock glowing in shades of vermillion and gold. The camera executes a smooth tracking movement, following the drone as it descends between two towering buttes. Dust particles catch the low-angled sunlight, creating a hazy, dreamlike atmosphere. The drone tilts forward, accelerating through a narrow passage where shadows create dramatic contrast against sun-kissed cliff faces. Wide cinematic framing, shallow depth of field, warm color grading reminiscent of nature documentaries.',

  systemPromptAddition: `For Wan video generation:
- Write detailed prompts (80-120 words ideal)
- Use cinematic and filmmaking terminology
- The "golden rule" is clarity - be specific about everything
- Describe timing and pacing of movements
- Include film-style references when appropriate
- Layer environmental and atmospheric details
- Wan handles complex, long-form descriptions well`
}

export const PIKA_GUIDE: ModelGuide = {
  modelId: 'fal-ai/pika',
  modelName: 'Pika',
  type: 'video',

  optimalLength: {
    min: 20,
    max: 50,
    ideal: 35
  },

  promptStructure: [
    'Subject',
    'Simple action',
    'Camera command (optional)',
    'Style'
  ],

  keyElements: [
    'Concise descriptions',
    'Single clear action',
    'Camera commands for movement',
    'Style keywords'
  ],

  avoid: [
    'Instructional language ("make it", "create")',
    'Complex multi-step actions',
    'Overly long descriptions',
    'Multiple subjects with different actions'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'zoom in', 'zoom out', 'pan left', 'pan right',
    'rotate', 'tilt up', 'tilt down'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'Black drone soaring between massive red canyon walls, golden sunlight, camera tracking alongside, cinematic aerial footage',

  systemPromptAddition: `For Pika video generation:
- Keep prompts SHORT (around 35 words)
- Pika creates 3-second clips, so focus on one action
- Avoid instructional phrases
- Use camera commands for movement effects
- Simple, clear descriptions work best
- Don't overload with details`
}

export const LUMA_GUIDE: ModelGuide = {
  modelId: 'fal-ai/luma',
  modelName: 'Luma Dream Machine / Ray',
  type: 'video',

  optimalLength: {
    min: 40,
    max: 80,
    ideal: 60
  },

  promptStructure: [
    'Main subject',
    'Action',
    'Supporting details',
    'Scene/environment',
    'Style',
    'Camera',
    'Reinforcer (repeat key element)'
  ],

  keyElements: [
    '3-4 sentence structure',
    'Clear main subject first',
    'Reinforcing key details',
    'Style descriptors',
    'Camera direction'
  ],

  avoid: [
    'Overly complex scenes',
    'Contradicting style elements',
    'Vague action descriptions',
    'Missing environmental context'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'tracking shot', 'dolly', 'pan', 'zoom',
    'static', 'handheld', 'aerial', 'close-up'
  ],

  specialFeatures: {
    supportsNegativePrompt: false
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'A sleek drone navigates through the Grand Canyon. It weaves gracefully between towering red rock formations, rotors humming in the desert air. The ancient canyon walls glow with warm sunset colors as the drone descends deeper. Cinematic documentary style, tracking shot following the drone. Professional aerial footage.',

  systemPromptAddition: `For Luma Dream Machine / Ray video generation:
- Use 3-4 sentence structure
- Start with main subject, then action, then details
- End with style and camera reinforcement
- Keep prompts focused (around 60 words)
- Reinforce important elements by subtle repetition
- Clear scene descriptions work better than abstract concepts`
}

export const SEEDANCE_GUIDE: ModelGuide = {
  modelId: 'fal-ai/seedance',
  modelName: 'Seedance',
  type: 'video',

  optimalLength: {
    min: 30,
    max: 70,
    ideal: 50
  },

  promptStructure: [
    'Subject',
    'Movement/Motion',
    'Scene',
    'Camera/Style'
  ],

  keyElements: [
    'Focus on motion and movement',
    'Clear subject identification',
    'Dynamic action descriptions',
    'Scene context'
  ],

  avoid: [
    'Static scene descriptions',
    'Overly complex multi-subject scenes',
    'Lengthy prose',
    'Missing motion elements'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'tracking', 'pan', 'zoom', 'static', 'handheld'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'A drone glides swiftly through the Grand Canyon, banking between massive rock spires. Its rotors spin rapidly as it descends into the shadowed depths. Warm light catches the canyon walls in orange and red. Tracking shot, cinematic aerial style.',

  systemPromptAddition: `For Seedance video generation:
- Focus heavily on MOTION - this model excels at movement
- Keep prompts concise (around 50 words)
- Structure: Subject + Motion + Scene + Style
- Avoid static descriptions - always include movement
- Dynamic actions produce the best results`
}

// ============================================
// IMAGE MODELS
// ============================================

export const FLUX_GUIDE: ModelGuide = {
  modelId: 'fal-ai/flux',
  modelName: 'FLUX.1',
  type: 'image',

  optimalLength: {
    min: 10,
    max: 100,
    ideal: 40
  },

  promptStructure: [
    'Subject and main focus',
    'Style/medium',
    'Lighting and atmosphere',
    'Technical details (for realism)',
    'Composition'
  ],

  keyElements: [
    'Natural language descriptions',
    'Technical camera details for photorealism',
    'Style and medium specifications',
    'Lighting descriptions',
    'Composition guidance'
  ],

  avoid: [
    'Excessive keyword stuffing',
    'Contradicting style instructions',
    'Overly technical jargon without context'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'shot on', 'f/1.8', 'f/2.8', 'bokeh', 'depth of field',
    '35mm', '50mm', '85mm', 'wide angle', 'telephoto',
    'macro', 'portrait lens'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'A professional DJI drone hovering in the Grand Canyon, captured mid-flight between towering red sandstone walls. Golden hour lighting casts long shadows across the layered rock formations. Shot on Sony A7R IV with 24-70mm lens, f/8, crystal clear detail. The Colorado River visible as a thin blue ribbon far below. Dramatic landscape photography, National Geographic style.',

  systemPromptAddition: `For FLUX.1 image generation:
- Use natural language - FLUX understands conversational descriptions
- For photorealism, include camera/lens details (e.g., "shot on Canon 5D, 85mm f/1.4")
- Specify the medium (photograph, oil painting, digital art, etc.)
- Include lighting direction and quality
- Prompts can range from simple to detailed based on complexity needed
- Technical photography terms enhance realism`
}

export const RECRAFT_GUIDE: ModelGuide = {
  modelId: 'fal-ai/recraft-v3',
  modelName: 'Recraft v3',
  type: 'image',

  optimalLength: {
    min: 15,
    max: 80,
    ideal: 50
  },

  promptStructure: [
    'Subject',
    'Style preset reference',
    'Colors and branding',
    'Composition',
    'Text elements (if needed)'
  ],

  keyElements: [
    'Style presets (use model\'s built-in styles)',
    'Text in quotes for text rendering',
    'Brand colors via hex codes',
    'Clear composition guidance',
    'Design-focused language'
  ],

  avoid: [
    'Ignoring style presets',
    'Text without quotes',
    'Overly photorealistic requests (use FLUX instead)',
    'Complex multi-element scenes'
  ],

  supportsCameraDirections: false,

  specialFeatures: {
    supportsTextInImage: true,
    supportsStylePresets: true,
    supportsBrandColors: true,
    supportsNegativePrompt: false
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'Illustration of a sleek drone flying through a stylized Grand Canyon landscape. Bold geometric rock formations in warm terracotta and coral tones. Clean vector style with subtle gradients. The drone rendered in modern tech aesthetic with glowing accent lights.',

  systemPromptAddition: `For Recraft v3 image generation:
- Recraft excels at design, illustration, and vector graphics
- Use style presets when available
- Put any text you want in the image in "quotes"
- Specify brand colors using hex codes if needed
- Focus on clean, design-oriented descriptions
- Better for illustrations than photorealism`
}

export const IDEOGRAM_GUIDE: ModelGuide = {
  modelId: 'fal-ai/ideogram',
  modelName: 'Ideogram v3',
  type: 'image',

  optimalLength: {
    min: 30,
    max: 160,
    ideal: 100
  },

  promptStructure: [
    'Subject with details',
    'Text elements in quotes',
    'Style phrase (one strong style)',
    'Color and lighting',
    'Composition and framing'
  ],

  keyElements: [
    'Natural language descriptions',
    'Text in quotes (Ideogram excels at text)',
    'One strong style phrase',
    'Detailed subject descriptions',
    'Mood and atmosphere'
  ],

  avoid: [
    'Multiple conflicting style phrases',
    'Text without quotes',
    'Extremely long prompts (150-160 word max)',
    'Vague subject descriptions'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'close-up', 'wide shot', 'aerial view', 'macro',
    'portrait framing', 'landscape orientation'
  ],

  specialFeatures: {
    supportsTextInImage: true,
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'A high-tech quadcopter drone soaring majestically through the Grand Canyon at sunset. The drone features sleek white body with blue LED accents, four spinning rotors creating slight motion blur. Massive layered rock walls rise on both sides, displaying millions of years of geological history in bands of rust red, burnt orange, and cream. The setting sun paints everything in warm golden light, with deep purple shadows in the canyon depths. Far below, the Colorado River reflects the fiery sky. Photorealistic nature photography style, dramatic landscape composition with the small drone emphasizing the immense scale of the canyon.',

  systemPromptAddition: `For Ideogram v3 image generation:
- Use natural language descriptions
- Ideogram is EXCELLENT at text - put text in "quotes"
- Use ONE strong style phrase rather than multiple conflicting styles
- Can handle detailed prompts up to 150-160 words
- Be specific about subjects, colors, and composition
- Great for designs, posters, and images with typography`
}

export const SD35_GUIDE: ModelGuide = {
  modelId: 'fal-ai/stable-diffusion-v35',
  modelName: 'Stable Diffusion 3.5',
  type: 'image',

  optimalLength: {
    min: 20,
    max: 100,
    ideal: 60
  },

  promptStructure: [
    'Subject and main focus',
    'Style and medium',
    'Quality boosters',
    'Lighting and atmosphere',
    'Composition details'
  ],

  keyElements: [
    'Natural language (improved from earlier SD)',
    'Style and medium specification',
    'Quality terms (detailed, high quality)',
    'Lighting descriptions',
    'Artist or style references'
  ],

  avoid: [
    'Excessive keyword stacking',
    'Low-effort single word prompts',
    'Contradicting style elements'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'close-up', 'wide angle', 'portrait', 'macro',
    'depth of field', 'bokeh', 'sharp focus'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'A modern quadcopter drone flying through the Grand Canyon, dramatic sunset lighting casting long shadows on the layered red rock walls. The drone hovers between towering canyon formations, its rotors a blur of motion. Photorealistic, highly detailed, professional photography, warm golden hour colors, 8K quality, sharp focus on the drone with slight background blur.',

  systemPromptAddition: `For Stable Diffusion 3.5 image generation:
- SD 3.5 handles natural language better than previous versions
- Include style/medium (photograph, digital art, oil painting, etc.)
- Quality terms help: "highly detailed", "professional", "8K"
- Lighting descriptions improve results significantly
- Can reference art styles or artists
- Negative prompts work well to avoid unwanted elements
- Around 60 words is ideal`
}

export const MINIMAX_IMAGE_GUIDE: ModelGuide = {
  modelId: 'fal-ai/minimax-image',
  modelName: 'MiniMax Image-01',
  type: 'image',

  optimalLength: {
    min: 20,
    max: 80,
    ideal: 50
  },

  promptStructure: [
    'Clear subject description',
    'Style and lighting',
    'Background context',
    'Composition'
  ],

  keyElements: [
    'Clear subject identification',
    'Good lighting descriptions',
    'Simple backgrounds work best',
    'Specific details about the main subject'
  ],

  avoid: [
    'Overly busy backgrounds',
    'Multiple complex subjects',
    'Vague descriptions',
    'Conflicting style instructions'
  ],

  supportsCameraDirections: true,
  cameraTerms: [
    'close-up', 'portrait', 'wide shot', 'centered composition'
  ],

  specialFeatures: {
    supportsNegativePrompt: true
  },

  exampleInput: 'drone flying through grand canyon',
  exampleOutput: 'A sleek black drone captured mid-flight in the Grand Canyon. The quadcopter hovers between massive terracotta canyon walls, warm afternoon sunlight illuminating its metallic body. Simple composition with the drone as clear focal point against the geological backdrop. Professional product photography style, clear details, soft natural lighting.',

  systemPromptAddition: `For MiniMax Image-01 generation:
- Clear, specific subject descriptions work best
- Keep backgrounds relatively simple
- Focus on one main subject
- Include lighting details
- Around 50 words is ideal
- Avoid overly complex multi-element scenes`
}

// ============================================
// MODEL GUIDE MAPPING
// ============================================

export const MODEL_GUIDES: Record<string, ModelGuide> = {
  // Video models - Kling variants
  'fal-ai/kling-video/v1/standard/text-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1/pro/text-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1.5/pro/text-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1.6/standard/text-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1.6/pro/text-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v2.0/master/text-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1/standard/image-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1/pro/image-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1.5/pro/image-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1.6/standard/image-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v1.6/pro/image-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v2.0/master/image-to-video': KLING_GUIDE,
  'fal-ai/kling-video/v2.6/pro/image-to-video': KLING_GUIDE,

  // Video models - Veo variants
  'fal-ai/veo2': VEO3_GUIDE,
  'fal-ai/veo3': VEO3_GUIDE,
  'fal-ai/veo3.1/first-last-frame-to-video': VEO3_GUIDE,

  // Video models - MiniMax variants
  'fal-ai/minimax-video/image-to-video': MINIMAX_VIDEO_GUIDE,
  'fal-ai/minimax-video/video-01/image-to-video': MINIMAX_VIDEO_GUIDE,
  'fal-ai/minimax-video/video-01-live/image-to-video': MINIMAX_VIDEO_GUIDE,
  'fal-ai/minimax/video-01-live': MINIMAX_VIDEO_GUIDE,
  'fal-ai/minimax/video-01-director': MINIMAX_VIDEO_GUIDE,

  // Video models - Wan variants
  'fal-ai/wan-25-preview/image-to-video': WAN_GUIDE,
  'fal-ai/wan-effects': WAN_GUIDE,
  'fal-ai/wan/v2.1/1.3b/text-to-video': WAN_GUIDE,
  'fal-ai/wan/v2.1/14b/text-to-video': WAN_GUIDE,

  // Video models - Pika
  'fal-ai/pika/v1/text-to-video': PIKA_GUIDE,
  'fal-ai/pika/v1.5/text-to-video': PIKA_GUIDE,
  'fal-ai/pika/v2/text-to-video': PIKA_GUIDE,
  'fal-ai/pika/v2.2/text-to-video': PIKA_GUIDE,

  // Video models - Luma
  'fal-ai/luma-dream-machine': LUMA_GUIDE,
  'fal-ai/luma-dream-machine/image-to-video': LUMA_GUIDE,
  'fal-ai/luma-dream-machine/ray-2-flash': LUMA_GUIDE,
  'fal-ai/luma-dream-machine/ray-2': LUMA_GUIDE,

  // Video models - Seedance
  'fal-ai/seedance/text-to-video': SEEDANCE_GUIDE,
  'fal-ai/seedance/image-to-video': SEEDANCE_GUIDE,

  // Image models - FLUX variants
  'fal-ai/flux/dev': FLUX_GUIDE,
  'fal-ai/flux/schnell': FLUX_GUIDE,
  'fal-ai/flux-pro': FLUX_GUIDE,
  'fal-ai/flux-pro/v1.1': FLUX_GUIDE,
  'fal-ai/flux-pro/v1.1-ultra': FLUX_GUIDE,
  'fal-ai/flux-realism': FLUX_GUIDE,
  'fal-ai/flux-pro/new': FLUX_GUIDE,
  'fal-ai/flux-lora': FLUX_GUIDE,

  // Image models - Recraft
  'fal-ai/recraft-v3': RECRAFT_GUIDE,
  'fal-ai/recraft-v3/create-style': RECRAFT_GUIDE,

  // Image models - Ideogram
  'fal-ai/ideogram/v2': IDEOGRAM_GUIDE,
  'fal-ai/ideogram/v2/turbo': IDEOGRAM_GUIDE,
  'fal-ai/ideogram/v3': IDEOGRAM_GUIDE,

  // Image models - Stable Diffusion
  'fal-ai/stable-diffusion-v35-large': SD35_GUIDE,
  'fal-ai/stable-diffusion-v35-large-turbo': SD35_GUIDE,
  'fal-ai/stable-diffusion-v35-medium': SD35_GUIDE,

  // Image models - MiniMax
  'fal-ai/minimax/image-01': MINIMAX_IMAGE_GUIDE,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the guide for a specific model, with fallback to a generic guide
 */
export function getModelGuide(modelId: string): ModelGuide | null {
  // Direct match
  if (MODEL_GUIDES[modelId]) {
    return MODEL_GUIDES[modelId]
  }

  // Try partial matching for model families
  const modelIdLower = modelId.toLowerCase()

  if (modelIdLower.includes('kling')) return KLING_GUIDE
  if (modelIdLower.includes('veo')) return VEO3_GUIDE
  if (modelIdLower.includes('minimax') && modelIdLower.includes('video')) return MINIMAX_VIDEO_GUIDE
  if (modelIdLower.includes('minimax') && modelIdLower.includes('image')) return MINIMAX_IMAGE_GUIDE
  if (modelIdLower.includes('wan')) return WAN_GUIDE
  if (modelIdLower.includes('pika')) return PIKA_GUIDE
  if (modelIdLower.includes('luma') || modelIdLower.includes('dream-machine') || modelIdLower.includes('ray')) return LUMA_GUIDE
  if (modelIdLower.includes('seedance')) return SEEDANCE_GUIDE
  if (modelIdLower.includes('flux')) return FLUX_GUIDE
  if (modelIdLower.includes('recraft')) return RECRAFT_GUIDE
  if (modelIdLower.includes('ideogram')) return IDEOGRAM_GUIDE
  if (modelIdLower.includes('stable-diffusion') || modelIdLower.includes('sd3')) return SD35_GUIDE

  return null
}

/**
 * Get the model type (image or video) from a model ID
 */
export function getModelType(modelId: string): 'image' | 'video' {
  const guide = getModelGuide(modelId)
  return guide?.type || 'image'
}

/**
 * Generate the system prompt addition for a specific model
 */
export function getEnhancementSystemPrompt(modelId: string): string {
  const guide = getModelGuide(modelId)

  if (!guide) {
    // Generic fallback
    return `Enhance the user's prompt while keeping it natural and descriptive.
Focus on clarity, visual details, and mood.
Keep the enhanced prompt concise but evocative.`
  }

  return guide.systemPromptAddition
}

/**
 * Get optimal prompt length constraints for a model
 */
export function getPromptLengthConstraints(modelId: string): { min: number; max: number; ideal: number } {
  const guide = getModelGuide(modelId)

  if (!guide) {
    return { min: 20, max: 80, ideal: 50 }
  }

  return guide.optimalLength
}

/**
 * Check if a model supports a specific feature
 */
export function modelSupportsFeature(
  modelId: string,
  feature: keyof NonNullable<ModelGuide['specialFeatures']>
): boolean {
  const guide = getModelGuide(modelId)
  return guide?.specialFeatures?.[feature] ?? false
}

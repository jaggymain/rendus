// Re-export from curated models
export { 
  IMAGE_MODELS,
  VIDEO_MODELS,
  IMAGE_TO_VIDEO_MODELS,
  IMAGE_TO_IMAGE_MODELS,
  ALL_IMAGE_MODELS, 
  ALL_VIDEO_MODELS,
  ASPECT_RATIOS,
  VEO_ASPECT_RATIOS,
  WAN_ASPECT_RATIOS,
} from './models-curated'

import { IMAGE_MODELS, VIDEO_MODELS, IMAGE_TO_VIDEO_MODELS, IMAGE_TO_IMAGE_MODELS } from './models-curated'

// Combined models list (all categories)
export const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS, ...IMAGE_TO_VIDEO_MODELS, ...IMAGE_TO_IMAGE_MODELS]

// Featured models (recommended ones)
export const FEATURED_IMAGE_MODELS = IMAGE_MODELS.filter(m => m.recommended)
export const FEATURED_VIDEO_MODELS = [...VIDEO_MODELS, ...IMAGE_TO_VIDEO_MODELS].filter(m => m.recommended)

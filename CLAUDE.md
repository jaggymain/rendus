# Rendus AI - Project Documentation

## Overview
Rendus AI is a multi-modal AI generation SaaS platform supporting text-to-image, text-to-video, image-to-video, and image-to-image generation. Built on Next.js with FAL.ai as the primary backend provider.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe (credits system)
- **Job Queue**: Inngest
- **Storage**: AWS S3
- **AI Backend**: FAL.ai

## Key Directories
```
/app
  /api              # API routes
    /generate       # Main generation endpoint
    /generations    # Status polling endpoint
    /images         # Gallery CRUD
  /gen-test         # Main generation UI (page.tsx)
  /generate         # Alternative generation page
  /models           # Model browser page

/lib
  /models-curated.ts   # PRIMARY model definitions (used by UI)
  /models-data.ts      # SECONDARY model catalog (reference/sync source)
  /all-models.ts       # Re-exports from models-curated.ts
  /credits.ts          # Credit calculation logic
  /inngest.ts          # Inngest client + job functions

/prisma
  /schema.prisma    # Database schema
```

## ⚠️ CRITICAL: Model Data Files

There are TWO model definition files that can get out of sync:

### 1. `/lib/models-curated.ts` (ACTIVE - UI uses this)
- Exports: `IMAGE_MODELS`, `VIDEO_MODELS`, `IMAGE_TO_VIDEO_MODELS`, `IMAGE_TO_IMAGE_MODELS`
- Combined exports: `ALL_IMAGE_MODELS`, `ALL_VIDEO_MODELS`
- Has full `ModelInfo` interface with icons, gradients, credits, etc.
- **This is what the gen-test dropdown actually displays**

### 2. `/lib/models-data.ts` (REFERENCE)
- Simpler `Model` interface (no icons/gradients)
- Used by `/app/models` page for browsing
- Has `highlighted`, `pinned` flags
- **NOT directly used by generation UI**

### 3. `/lib/all-models.ts` (RE-EXPORTER)
- Re-exports everything from `models-curated.ts`
- Creates `FEATURED_IMAGE_MODELS` and `FEATURED_VIDEO_MODELS` (filtered by `recommended` flag)

**When adding/removing models**: Update `models-curated.ts` for UI changes. Keep `models-data.ts` in sync for the model browser.

## Model Flags (in models-curated.ts)
- `highlighted: true` - Shows in lists, general visibility
- `recommended: true` - Appears in FEATURED_*_MODELS arrays
- `pinned: true` - Sorts to top of lists

## Generation Flow

1. **User submits prompt** → `/api/generate` POST
2. **API creates Generation record** (status: 'pending')
3. **Inngest job triggered** (`generation/image.created` or `generation/video.created`)
4. **Inngest polls FAL.ai** for completion
5. **On complete**: Upload to S3, update Generation record, create GeneratedImage record
6. **Frontend polls** `/api/generations/[id]` until complete

## Database Schema (Key Tables)

### Generation
- `id`, `userId`, `prompt`, `model`, `status`
- `status`: 'pending' | 'processing' | 'completed' | 'failed'
- `falRequestId` - FAL.ai job ID for polling
- `resultUrl`, `s3Key` - Final output location

### GeneratedImage
- Legacy table, still used for gallery display
- Links to Generation via `generationId`

### User
- `credits` - Current credit balance (integer)

## Credits System

### Pricing (per generation)
- Most image models: 1-2 credits
- Video models: 2-8 credits (varies by model)
- Defined in `models-curated.ts` on each model's `credits` field

### Stripe Products
- $5 → 50 credits
- $15 → 200 credits  
- $30 → 500 credits

### Credit Deduction
- Happens in `/api/generate` before job creation
- Refunded on failure (in Inngest job)

## Gen-Test Page (`/app/gen-test/page.tsx`)

Main generation interface. Key state:
- `selectedModel` - Current ModelInfo
- `sortedImageModels` / `sortedVideoModels` - Filtered/sorted for dropdowns
- `aspectRatio`, `effectType` (for Wan Effects), `veoResolution`

### Dropdown Filtering Logic (~line 770-800)
```typescript
const sortedVideoModels = useMemo(() => {
  // Currently shows ALL_VIDEO_MODELS sorted by pinned/recommended/highlighted
  return ALL_VIDEO_MODELS.sort(...)
}, [])
```

## Common Issues

### "Models not showing in dropdown"
Check that `models-curated.ts` has the models with correct `category` field. The dropdown filters by category.

### "Model shows but generation fails"
1. Check model ID matches FAL.ai endpoint exactly
2. Check `/api/generate` has handler for that model's parameters
3. Check Inngest function handles that model type

### "Credits not deducting"
Check `credits` field on model in `models-curated.ts`. Missing = 0 credits.

## Environment Variables
```
DATABASE_URL
NEXTAUTH_SECRET
FAL_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
```

## Deployment
- Production: AWS EC2 with nginx
- Domain: rendus.ai
- SSL: Let's Encrypt certificates

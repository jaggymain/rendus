/**
 * Test script for model-specific prompt enhancement
 *
 * Run with: npx tsx scripts/test-prompt-enhancement.ts
 */

import {
  getModelGuide,
  getEnhancementSystemPrompt,
  getPromptLengthConstraints,
  MODEL_GUIDES,
  KLING_GUIDE,
  VEO3_GUIDE,
  FLUX_GUIDE,
} from '../lib/prompt-enhancement/model-guides'

const testPrompt = 'drone flying through grand canyon'

console.log('='.repeat(80))
console.log('MODEL-SPECIFIC PROMPT ENHANCEMENT TEST')
console.log('='.repeat(80))
console.log()

// Test 1: Verify model guide lookup
console.log('TEST 1: Model Guide Lookup')
console.log('-'.repeat(40))

const testModels = [
  'fal-ai/kling-video/v2.6/pro/image-to-video',
  'fal-ai/veo3',
  'fal-ai/flux-pro/v1.1-ultra',
  'fal-ai/minimax-video/image-to-video',
  'fal-ai/wan-effects',
  'fal-ai/pika/v2/text-to-video',
  'fal-ai/luma-dream-machine/ray-2',
  'fal-ai/recraft-v3',
  'fal-ai/ideogram/v3',
  'fal-ai/stable-diffusion-v35-large',
  'unknown-model-id',
]

for (const modelId of testModels) {
  const guide = getModelGuide(modelId)
  if (guide) {
    console.log(`✓ ${modelId}`)
    console.log(`  → Model: ${guide.modelName}, Type: ${guide.type}`)
    console.log(`  → Optimal length: ${guide.optimalLength.min}-${guide.optimalLength.max} (ideal: ${guide.optimalLength.ideal})`)
  } else {
    console.log(`✗ ${modelId} - No guide found (will use generic)`)
  }
}

console.log()

// Test 2: Compare example outputs
console.log('TEST 2: Example Prompt Transformations')
console.log('-'.repeat(40))
console.log(`Input: "${testPrompt}"`)
console.log()

const guideExamples = [
  { name: 'Kling (video)', guide: KLING_GUIDE },
  { name: 'Veo 3 (video)', guide: VEO3_GUIDE },
  { name: 'FLUX (image)', guide: FLUX_GUIDE },
]

for (const { name, guide } of guideExamples) {
  console.log(`${name}:`)
  console.log(`  Length constraint: ~${guide.optimalLength.ideal} words`)
  console.log(`  Example output:`)
  const words = guide.exampleOutput.split(/\s+/).length
  console.log(`  "${guide.exampleOutput}"`)
  console.log(`  (${words} words)`)
  console.log()
}

// Test 3: Verify system prompts are different
console.log('TEST 3: System Prompt Differentiation')
console.log('-'.repeat(40))

const klingSystemPrompt = getEnhancementSystemPrompt('fal-ai/kling-video/v2.6/pro/image-to-video')
const veoSystemPrompt = getEnhancementSystemPrompt('fal-ai/veo3')
const fluxSystemPrompt = getEnhancementSystemPrompt('fal-ai/flux-pro/v1.1')

console.log('Kling system prompt includes:')
console.log(`  - "concise": ${klingSystemPrompt.includes('concise')}`)
console.log(`  - "50 words": ${klingSystemPrompt.includes('50')}`)

console.log('Veo 3 system prompt includes:')
console.log(`  - "detailed": ${veoSystemPrompt.includes('detailed')}`)
console.log(`  - "dialogue": ${veoSystemPrompt.includes('dialogue')}`)
console.log(`  - "80": ${veoSystemPrompt.includes('80')}`)

console.log('FLUX system prompt includes:')
console.log(`  - "natural language": ${fluxSystemPrompt.includes('natural language')}`)
console.log(`  - "camera": ${fluxSystemPrompt.includes('camera')}`)

console.log()

// Test 4: Count registered models
console.log('TEST 4: Model Coverage')
console.log('-'.repeat(40))
const totalModels = Object.keys(MODEL_GUIDES).length
const videoModels = Object.entries(MODEL_GUIDES).filter(([_, g]) => g.type === 'video').length
const imageModels = Object.entries(MODEL_GUIDES).filter(([_, g]) => g.type === 'image').length

console.log(`Total registered model IDs: ${totalModels}`)
console.log(`  - Video models: ${videoModels}`)
console.log(`  - Image models: ${imageModels}`)

console.log()
console.log('='.repeat(80))
console.log('TEST COMPLETE')
console.log('='.repeat(80))

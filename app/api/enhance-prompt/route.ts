import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import Anthropic from '@anthropic-ai/sdk'
import {
  getModelGuide,
  getEnhancementSystemPrompt,
  getPromptLengthConstraints,
  modelSupportsFeature,
  type ModelGuide
} from '@/lib/prompt-enhancement/model-guides'

// Initialize with explicit API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Build a model-specific system prompt for enhancement
 */
function buildSystemPrompt(modelId: string, category: string): string {
  const guide = getModelGuide(modelId)
  const constraints = getPromptLengthConstraints(modelId)

  // If we have a specific guide, use detailed model-specific instructions
  if (guide) {
    return buildDetailedSystemPrompt(guide, constraints)
  }

  // Fallback to generic enhancement
  return buildGenericSystemPrompt(category, constraints)
}

function buildDetailedSystemPrompt(guide: ModelGuide, constraints: { min: number; max: number; ideal: number }): string {
  const structureList = guide.promptStructure.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const keyElementsList = guide.keyElements.map(e => `- ${e}`).join('\n')
  const avoidList = guide.avoid.map(a => `- ${a}`).join('\n')

  let cameraSection = ''
  if (guide.supportsCameraDirections && guide.cameraTerms) {
    cameraSection = `
CAMERA/TECHNICAL TERMS YOU CAN USE:
${guide.cameraTerms.slice(0, 8).join(', ')}
`
  }

  let specialFeaturesSection = ''
  if (guide.specialFeatures) {
    const features: string[] = []
    if (guide.specialFeatures.supportsDialogue) features.push('- This model supports dialogue in quotes with speaker attribution')
    if (guide.specialFeatures.supportsAudio) features.push('- Include audio/sound descriptions for richer output')
    if (guide.specialFeatures.supportsTextInImage) features.push('- Put any text you want rendered in "quotes"')
    if (features.length > 0) {
      specialFeaturesSection = `
SPECIAL FEATURES:
${features.join('\n')}
`
    }
  }

  return `You are an expert prompt engineer specializing in ${guide.modelName} (${guide.type} generation).

MODEL: ${guide.modelName}
TYPE: ${guide.type.toUpperCase()} GENERATION

${guide.systemPromptAddition}

OPTIMAL PROMPT STRUCTURE:
${structureList}

KEY ELEMENTS TO INCLUDE:
${keyElementsList}

THINGS TO AVOID:
${avoidList}
${cameraSection}${specialFeaturesSection}
LENGTH CONSTRAINTS:
- Minimum: ${constraints.min} words
- Maximum: ${constraints.max} words
- Ideal: around ${constraints.ideal} words

EXAMPLE TRANSFORMATION:
Input: "${guide.exampleInput}"
Output: "${guide.exampleOutput}"

CRITICAL RULES:
1. Output ONLY the enhanced prompt - no explanations, preamble, or formatting
2. Maintain the user's original intent and subject matter
3. Stay within ${constraints.max} words maximum
4. Don't add NSFW, violent, or inappropriate content
5. Don't repeat adjectives or use excessive flowery language
6. Don't include technical parameters (aspect ratio, duration, resolution)
7. Make every word count - be specific, not generic`
}

function buildGenericSystemPrompt(category: string, constraints: { min: number; max: number; ideal: number }): string {
  const isVideo = category?.includes('video')

  if (isVideo) {
    return `You are an expert prompt engineer for AI video generation.

Enhance the user's prompt by adding:
- Motion dynamics (slow motion, fluid movement, gradual transition)
- Camera movement (dolly in, pan left, tracking shot, static)
- Scene atmosphere and lighting
- Clear subject movement descriptions
- Mood and pacing

LENGTH: Aim for around ${constraints.ideal} words (max ${constraints.max})

RULES:
1. Output ONLY the enhanced prompt - no explanations
2. Maintain the user's original intent
3. Don't add NSFW or inappropriate content
4. Don't include technical parameters
5. Focus on action and movement`
  }

  return `You are an expert prompt engineer for AI image generation.

Enhance the user's prompt by adding:
- Lighting and atmosphere (golden hour, dramatic shadows)
- Composition guidance (rule of thirds, centered, wide angle)
- Style descriptors (photorealistic, cinematic, illustration)
- Technical quality (detailed, sharp focus, depth of field)
- Material and texture details

LENGTH: Aim for around ${constraints.ideal} words (max ${constraints.max})

RULES:
1. Output ONLY the enhanced prompt - no explanations
2. Maintain the user's original intent
3. Don't add NSFW or inappropriate content
4. Don't include technical parameters
5. Be specific and evocative`
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, model, category } = body

    if (!prompt || !prompt.trim()) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Build the model-specific system prompt
    const systemPrompt = buildSystemPrompt(model || '', category || 'text-to-image')

    // Get the guide for additional context in the user message
    const guide = getModelGuide(model || '')
    const modelContext = guide
      ? `\n\n[Enhancing for: ${guide.modelName}]`
      : ''

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Enhance this prompt for AI generation:

${prompt}${modelContext}`
        }
      ],
      system: systemPrompt,
    })

    // Extract the text response
    const enhanced = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : prompt

    return Response.json({
      enhanced,
      model: guide?.modelName || model || 'Unknown',
      constraints: getPromptLengthConstraints(model || '')
    })

  } catch (error: any) {
    console.error('Enhance prompt error:', error)
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      name: error?.name,
    })
    return Response.json(
      { error: error?.message || 'Failed to enhance prompt' },
      { status: error?.status || 500 }
    )
  }
}

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'
import { ASPECT_RATIOS } from '@/lib/models'
import { ALL_VIDEO_MODELS, IMAGE_TO_IMAGE_MODELS } from '@/lib/all-models'
import { hasEnoughCredits, deductCredits, getCreditCost } from '@/lib/credits'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      )
    }

    const userId = session.user.id || session.user.email
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized - No user ID' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      prompt,
      model,
      aspectRatio,
      numInferenceSteps,
      guidanceScale,
      seed: inputSeed,
      // Video-specific parameters
      imageUrl: inputImageUrl,
      imageFile: inputImageFile,
      audioUrl: inputAudioUrl,
      resolution,
      duration,
      negativePrompt,
      enablePromptExpansion,
      enableSafetyChecker,
      // WAN Effects parameters
      effectType,
      numFrames,
      framesPerSecond,
      loraScale,
      turboMode,
      // Veo 3.1 First-Last Frame parameters
      firstFrameFile,
      lastFrameFile,
      // Kling 2.6 parameters
      generateAudio,
    } = body

    const modelId = model || 'fal-ai/flux-pro/v1.1'

    // ============================================
    // CREDIT CHECK - Rate Limiting
    // ============================================
    const creditCost = getCreditCost(modelId)
    const canAfford = await hasEnoughCredits(userId, modelId)
    
    if (!canAfford) {
      return Response.json(
        { 
          error: 'Insufficient credits',
          message: `This generation requires ${creditCost} credit${creditCost > 1 ? 's' : ''}. Please purchase more credits to continue.`,
          creditCost,
          needsCredits: true,
        },
        { status: 402 } // Payment Required
      )
    }

    // Deduct credits upfront
    const { remaining } = await deductCredits(userId, modelId)

    // Check if this is a video model
    const isVideoModel = ALL_VIDEO_MODELS.some(m => m.id === modelId) || modelId.includes('wan-25-preview') || modelId.includes('wan-effects')

    // Check if this is an image-to-image model
    const isImageToImageModel = IMAGE_TO_IMAGE_MODELS.some(m => m.id === modelId)

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      )
    }

    // Validate video models require image input
    if ((modelId === 'fal-ai/wan-effects' || modelId === 'fal-ai/wan-25-preview/image-to-video') && !inputImageUrl && !inputImageFile) {
      return Response.json(
        { error: 'Input image is required for this model' },
        { status: 400 }
      )
    }

    // Prepare parameters
    let parameters: any = {
      aspectRatio,
      numInferenceSteps,
      guidanceScale,
      seed: inputSeed,
    }

    if (isVideoModel) {
      // Video parameters
      parameters = {
        ...parameters,
        imageUrl: inputImageUrl,
        imageFile: inputImageFile,
        audioUrl: inputAudioUrl,
        resolution,
        duration,
        negativePrompt,
        enablePromptExpansion,
        enableSafetyChecker,
        effectType,
        numFrames,
        framesPerSecond,
        loraScale,
        turboMode,
        // Veo 3.1 First-Last Frame
        firstFrameFile,
        lastFrameFile,
        // Kling 2.6
        generateAudio,
      }
    } else {
      // Image parameters
      const ratioInfo = ASPECT_RATIOS.find(r => r.ratio === aspectRatio) || ASPECT_RATIOS[0]
      parameters.width = ratioInfo.width
      parameters.height = ratioInfo.height

      // Add image input for image-to-image models
      if (isImageToImageModel) {
        parameters.imageUrl = inputImageUrl
        parameters.imageFile = inputImageFile
      }
    }

    // Create generation record with credits charged
    const generation = await prisma.generation.create({
      data: {
        userId,
        type: isVideoModel ? 'VIDEO' : 'IMAGE',
        status: 'PENDING',
        prompt,
        model: modelId,
        parameters,
        creditsCharged: creditCost,
      },
    })

    // Handle image file upload if present (to avoid large payloads in Inngest)
    if (parameters.imageFile) {
      const fal = require('@fal-ai/serverless-client');
      fal.config({
        credentials: process.env.FAL_KEY,
      });

      try {
        const base64Data = parameters.imageFile.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer]);
        const url = await fal.storage.upload(blob);
        parameters.imageUrl = url;
        delete parameters.imageFile;
      } catch (uploadError) {
        console.error('Failed to upload initial image to Fal storage:', uploadError);
        return Response.json(
          { error: 'Failed to upload input image. Please try a smaller image or a URL.' },
          { status: 400 }
        );
      }
    }

    // Handle Veo 3.1 First-Last Frame uploads
    if (parameters.firstFrameFile || parameters.lastFrameFile) {
      const fal = require('@fal-ai/serverless-client');
      fal.config({
        credentials: process.env.FAL_KEY,
      });

      try {
        if (parameters.firstFrameFile) {
          const base64Data = parameters.firstFrameFile.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer]);
          const url = await fal.storage.upload(blob);
          parameters.firstFrameUrl = url;
          delete parameters.firstFrameFile;
        }
        if (parameters.lastFrameFile) {
          const base64Data = parameters.lastFrameFile.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer]);
          const url = await fal.storage.upload(blob);
          parameters.lastFrameUrl = url;
          delete parameters.lastFrameFile;
        }
      } catch (uploadError) {
        console.error('Failed to upload frame images to Fal storage:', uploadError);
        return Response.json(
          { error: 'Failed to upload frame images. Please try smaller images.' },
          { status: 400 }
        );
      }
    }

    // Trigger Inngest function
    try {
      if (isVideoModel) {
        await inngest.send({
          name: 'generation/video.requested',
          data: {
            generationId: generation.id,
            userId,
            prompt,
            model: modelId,
            parameters,
          },
        })
      } else {
        await inngest.send({
          name: 'generation/image.requested',
          data: {
            generationId: generation.id,
            userId,
            prompt,
            model: modelId,
            parameters,
          },
        })
      }
    } catch (inngestError) {
      console.error('Inngest send error:', inngestError)
      // Update the generation to failed status
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Failed to queue generation job. Please ensure the job queue is running.',
        },
      })
      return Response.json(
        { error: 'Failed to queue generation. Is Inngest running? Run: npx inngest-cli@latest dev' },
        { status: 503 }
      )
    }

    // Return immediately with pending status and remaining credits
    return Response.json({
      id: generation.id,
      status: 'pending',
      type: isVideoModel ? 'video' : 'image',
      creditsCharged: creditCost,
      creditsRemaining: remaining,
    })

  } catch (error) {
    console.error('Generation error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return Response.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}

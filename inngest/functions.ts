import { inngest } from '@/lib/inngest'
import { prisma } from '@/lib/prisma'
import { uploadImageToS3 } from '@/lib/s3'
import * as fal from '@fal-ai/serverless-client'

fal.config({
  credentials: process.env.FAL_KEY,
})

// Image generation function
export const generateImage = inngest.createFunction(
  { id: 'generate-image', name: 'Generate Image' },
  { event: 'generation/image.requested' },
  async ({ event, step }) => {
    const { generationId, userId, prompt, model, parameters } = event.data

    try {
      // Update status to PROCESSING
      await step.run('update-status-processing', async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: 'PROCESSING' },
        })
      })

      // Handle image upload for image-to-image models
      let imageUrlValue: string | undefined = parameters.imageUrl
      if (parameters.imageFile) {
        imageUrlValue = await step.run('upload-image-to-fal-storage', async () => {
          const base64Data = parameters.imageFile.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const blob = new Blob([buffer])
          const url = await fal.storage.upload(blob)
          return url
        })
      }

      // Submit to fal.ai - use new client for FLUX 1.1 Pro Ultra
      let result: any
      if (model === 'fal-ai/flux-pro/v1.1-ultra') {
        // Use new @fal-ai/client for FLUX 1.1 Pro Ultra
        const { fal: newFal } = await import('@fal-ai/client')
        newFal.config({ credentials: process.env.FAL_KEY })

        result = await step.run('generate-with-new-client', async () => {
          const response = await newFal.subscribe(model, {
            input: {
              prompt,
              image_size: {
                width: parameters.width || 1024,
                height: parameters.height || 1024,
              },
              num_inference_steps: parameters.numInferenceSteps || 28,
              guidance_scale: parameters.guidanceScale || 3.5,
              ...(parameters.seed !== undefined && { seed: parameters.seed }),
              ...(parameters.negativePrompt && { negative_prompt: parameters.negativePrompt }),
              ...(parameters.enableSafetyChecker !== undefined && { enable_safety_checker: parameters.enableSafetyChecker }),
              ...(imageUrlValue && { image_url: imageUrlValue }),
            },
            logs: true,
          })
          return response.data
        })
      } else {
        // Use existing serverless-client for other models
        const { request_id } = await step.run('submit-to-fal-queue', async () => {
          const result = await fal.queue.submit(model, {
            input: {
              prompt,
              image_size: {
                width: parameters.width || 1024,
                height: parameters.height || 1024,
              },
              num_inference_steps: parameters.numInferenceSteps || 28,
              guidance_scale: parameters.guidanceScale || 3.5,
              ...(parameters.seed !== undefined && { seed: parameters.seed }),
              ...(parameters.negativePrompt && { negative_prompt: parameters.negativePrompt }),
              ...(parameters.enableSafetyChecker !== undefined && { enable_safety_checker: parameters.enableSafetyChecker }),
              ...(imageUrlValue && { image_url: imageUrlValue }),
            },
          }) as { request_id: string }

          return result
        })

        // Save request ID
        await step.run('save-request-id', async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: { falRequestId: request_id },
          })
        })

        // Poll for completion
        result = await step.run('poll-for-completion', async () => {
          return await fal.queue.result(model, {
            requestId: request_id,
          }) as any
        })
      }

      const imageUrl = result.images[0].url
      const resultSeed = result.seed
      const width = result.images[0].width
      const height = result.images[0].height

      // PHASE 1: Quick completion - show fal.ai URL immediately (~10 seconds)
      await step.run('quick-complete-with-fal-url', async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'COMPLETED',
            resultUrl: imageUrl, // Fal.ai URL - temporary but immediate
            seed: resultSeed ? BigInt(resultSeed) : null,
            width,
            height,
            completedAt: new Date(),
          },
        })
      })

      // PHASE 2: Background S3 upload - upgrade to permanent storage
      const { imageKey, thumbnailKey } = await step.run('upload-to-s3', async () => {
        return await uploadImageToS3(imageUrl, userId, prompt)
      })

      // Update with S3 URLs (frontend will use these after refresh or next poll)
      await step.run('upgrade-to-s3-urls', async () => {
        const s3ImageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            resultUrl: s3ImageUrl, // Upgrade to S3 URL
            s3Key: imageKey,
            thumbnailS3Key: thumbnailKey,
          },
        })
      })

      return { success: true, generationId, imageUrl }
    } catch (error) {
      // Update generation record with error
      await step.run('update-generation-failed', async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date(),
          },
        })
      })

      throw error
    }
  }
)

// Video generation function
export const generateVideo = inngest.createFunction(
  { id: 'generate-video', name: 'Generate Video' },
  { event: 'generation/video.requested' },
  async ({ event, step }) => {
    const { generationId, userId, prompt, model, parameters } = event.data

    try {
      // Update status to PROCESSING
      await step.run('update-status-processing', async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: 'PROCESSING' },
        })
      })

      // Upload file to fal.ai storage if needed
      let imageUrlValue: any = parameters.imageUrl
      if (parameters.imageFile) {
        imageUrlValue = await step.run('upload-file-to-fal-storage', async () => {
          const base64Data = parameters.imageFile.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const blob = new Blob([buffer])
          return await fal.storage.upload(blob)
        })
      }

      // Build input based on model
      let input: any = {}

      if (model === 'fal-ai/wan-effects') {
        input = {
          subject: prompt.trim(),
          image_url: imageUrlValue,
          effect_type: parameters.effectType || 'cakeify',
          aspect_ratio: parameters.aspectRatio || '16:9',
        }

        if (parameters.numFrames) input.num_frames = parameters.numFrames
        if (parameters.framesPerSecond) input.frames_per_second = parameters.framesPerSecond
        if (parameters.numInferenceSteps) input.num_inference_steps = parameters.numInferenceSteps
        if (parameters.loraScale) input.lora_scale = parameters.loraScale
        if (parameters.turboMode !== undefined) input.turbo_mode = parameters.turboMode
      } else if (model === 'fal-ai/veo3.1/first-last-frame-to-video') {
        // Veo 3.1 First-Last Frame model
        input = {
          prompt: prompt.trim(),
          first_frame_url: parameters.firstFrameUrl,
          last_frame_url: parameters.lastFrameUrl,
          duration: parameters.duration || '8s',
          aspect_ratio: parameters.aspectRatio || 'auto',
          resolution: parameters.resolution || '720p',
          generate_audio: true,
        }
      } else if (model === 'fal-ai/kling-video/v2.6/pro/image-to-video') {
        // Kling 2.6 Pro Image-to-Video model
        // Note: Kling 2.6 doesn't support aspect_ratio - only prompt, image_url, duration, cfg_scale, negative_prompt, generate_audio
        input = {
          prompt: prompt.trim(),
          image_url: imageUrlValue,
          duration: String(parameters.duration || '5'), // Must be "5" or "10" as strings
          generate_audio: parameters.generateAudio !== false, // Default to true
        }

        if (parameters.negativePrompt) {
          input.negative_prompt = parameters.negativePrompt
        }
      } else {
        // Default input for other video models
        input.prompt = prompt

        // Add image_url if present (for image-to-video models)
        if (imageUrlValue) {
          input.image_url = imageUrlValue
        }

        // Add common video parameters with correct naming
        if (parameters.aspectRatio) {
          input.aspect_ratio = parameters.aspectRatio
        }

        if (parameters.duration) {
          input.duration = parameters.duration
        }

        if (parameters.resolution) {
          input.resolution = parameters.resolution
        }

        if (parameters.negativePrompt) {
          input.negative_prompt = parameters.negativePrompt
        }

        if (parameters.enablePromptExpansion !== undefined) {
          input.enhance_prompt = parameters.enablePromptExpansion
        }

        if (parameters.enableSafetyChecker !== undefined) {
          input.enable_safety_checker = parameters.enableSafetyChecker
        }
      }

      if (parameters.seed !== undefined && parameters.seed !== null) {
        input.seed = parameters.seed
      }

      // Submit to fal.ai - use new client for wan-effects
      let result: any
      if (model === 'fal-ai/wan-effects') {
        // Use new @fal-ai/client for wan-effects
        const { fal: newFal } = await import('@fal-ai/client')
        newFal.config({ credentials: process.env.FAL_KEY })

        result = await step.run('generate-with-new-client', async () => {
          const response = await newFal.subscribe(model, {
            input,
            logs: true,
          })
          return response.data
        })
      } else {
        // Use existing serverless-client for other models
        const { request_id } = await step.run('submit-to-fal-queue', async () => {
          const result = await fal.queue.submit(model, { input }) as { request_id: string }
          return result
        })

        // Save request ID
        await step.run('save-request-id', async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: { falRequestId: request_id },
          })
        })

        // Poll for completion
        result = await step.run('poll-for-completion', async () => {
          return await fal.queue.result(model, {
            requestId: request_id,
          }) as any
        })
      }

      // Handle different response structures
      let videoUrl: string | undefined
      if (result.video?.url) {
        videoUrl = result.video.url
      } else if (result.videos && Array.isArray(result.videos) && result.videos[0]?.url) {
        // Some models return videos as an array
        videoUrl = result.videos[0].url
      } else if (typeof result.video === 'string') {
        // Some models return video URL directly as a string
        videoUrl = result.video
      }

      const resultSeed = result.seed

      if (!videoUrl) {
        console.error('Unexpected API response structure:', JSON.stringify(result, null, 2))
        throw new Error('No video URL returned from API. Response structure: ' + JSON.stringify(Object.keys(result)))
      }

      // PHASE 1: Quick completion - show fal.ai video URL immediately
      await step.run('quick-complete-with-fal-url', async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'COMPLETED',
            resultUrl: videoUrl, // Fal.ai URL - temporary but immediate
            seed: resultSeed ? BigInt(resultSeed) : null,
            width: 1920, // Placeholder
            height: 1080, // Placeholder
            completedAt: new Date(),
          },
        })
      })

      // PHASE 2: Background S3 upload - upgrade to permanent storage
      const { videoKey, videoUrl: s3VideoUrl } = await step.run('upload-video-to-s3', async () => {
        // Download video from Fal.ai
        const response = await fetch(videoUrl)
        const buffer = await response.arrayBuffer()
        const videoBuffer = Buffer.from(buffer)

        // Generate S3 key
        const timestamp = Date.now()
        const videoKey = `videos/${userId}/${timestamp}.mp4`

        // Upload to S3
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
        const s3Client = new S3Client({
          region: process.env.AWS_REGION!,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        })

        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: videoKey,
            Body: videoBuffer,
            ContentType: 'video/mp4',
            Metadata: {
              prompt: prompt.substring(0, 1000),
              userId,
            },
          })
        )

        const s3VideoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`
        return { videoKey, videoUrl: s3VideoUrl }
      })

      // Update with S3 URL (frontend will use this after refresh or next poll)
      await step.run('upgrade-to-s3-url', async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            resultUrl: s3VideoUrl, // Upgrade to S3 URL
            s3Key: videoKey,
          },
        })
      })

      return { success: true, generationId, videoUrl }
    } catch (error: any) {
      // Log full error details
      console.error('Video generation error:', error.message || 'Unknown error')
      console.error('Error status:', error.status)
      console.error('Error body:', JSON.stringify(error.body, null, 2))
      console.error('Full error object:', JSON.stringify({
        message: error.message,
        status: error.status,
        body: error.body,
        stack: error.stack
      }, null, 2))

      // Build detailed error message
      let errorMessage = error.message || 'Unknown error'
      if (error.body?.detail) {
        errorMessage += `: ${JSON.stringify(error.body.detail)}`
      } else if (error.body?.message) {
        errorMessage += `: ${error.body.message}`
      }

      // Update generation record with error
      await step.run('update-generation-failed', async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'FAILED',
            errorMessage: errorMessage.substring(0, 500), // Truncate if too long
            completedAt: new Date(),
          },
        })
      })

      throw error
    }
  }
)

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateFreshSignedUrl } from '@/lib/s3'

// Helper to get or refresh a cached signed URL
async function getCachedSignedUrl(
  generationId: string,
  s3Key: string | null,
  cachedUrl: string | null,
  cachedExpiry: Date | null,
  urlField: 'signedUrl' | 'thumbnailSignedUrl',
  expiryField: 'signedUrlExpiry' | 'thumbnailSignedUrlExpiry'
): Promise<string> {
  if (!s3Key) return ''

  // Check if we have a valid cached URL (with 1 hour buffer)
  const now = new Date()
  if (cachedUrl && cachedExpiry && cachedExpiry > now) {
    return cachedUrl
  }

  // Generate fresh signed URL
  const { url, expiry } = await generateFreshSignedUrl(s3Key)

  // Update cache in database (fire and forget - don't await)
  prisma.generation.update({
    where: { id: generationId },
    data: {
      [urlField]: url,
      [expiryField]: expiry,
    },
  }).catch(err => console.error('Failed to cache signed URL:', err))

  return url
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch completed generations (both images and videos) from single Generation table
    const generations = await prisma.generation.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Format generations for response (use cached signed URLs when available)
    const formattedGenerations = await Promise.all(
      generations.map(async (generation) => {
        // Get main image URL (cached or fresh)
        const imageUrl = await getCachedSignedUrl(
          generation.id,
          generation.s3Key,
          generation.signedUrl,
          generation.signedUrlExpiry,
          'signedUrl',
          'signedUrlExpiry'
        ) || generation.resultUrl || ''

        // Get thumbnail URL (cached or fresh)
        let thumbnailUrl: string
        if (generation.thumbnailS3Key) {
          thumbnailUrl = await getCachedSignedUrl(
            generation.id,
            generation.thumbnailS3Key,
            generation.thumbnailSignedUrl,
            generation.thumbnailSignedUrlExpiry,
            'thumbnailSignedUrl',
            'thumbnailSignedUrlExpiry'
          )
        } else if (generation.s3Key) {
          // Fall back to main image if no thumbnail
          thumbnailUrl = imageUrl
        } else {
          thumbnailUrl = generation.resultUrl || ''
        }

        return {
          id: generation.id,
          userId: generation.userId,
          prompt: generation.prompt,
          type: generation.type.toLowerCase(),
          imageUrl,
          s3Key: generation.s3Key || '',
          seed: generation.seed?.toString() || '0',
          width: generation.width || 0,
          height: generation.height || 0,
          createdAt: generation.createdAt.toISOString(),
          thumbnailUrl,
        }
      })
    )

    return Response.json({
      images: formattedGenerations,
      hasMore: generations.length === limit,
    })

  } catch (error) {
    console.error('Fetch images error:', error)
    return Response.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

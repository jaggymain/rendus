import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getSignedImageUrl } from '@/lib/s3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const generation = await prisma.generation.findUnique({
      where: {
        id,
        userId: session.user.id, // Ensure user owns this generation
      },
    })

    if (!generation) {
      return Response.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for full image
    const fullImageUrl = generation.s3Key
      ? await getSignedImageUrl(generation.s3Key)
      : generation.resultUrl || ''

    return Response.json({
      id: generation.id,
      fullImageUrl,
      prompt: generation.prompt,
      seed: generation.seed?.toString() || '0',
      width: generation.width || 0,
      height: generation.height || 0,
      type: generation.type.toLowerCase(),
    })

  } catch (error) {
    console.error('Fetch full image error:', error)
    return Response.json(
      { error: 'Failed to fetch full image' },
      { status: 500 }
    )
  }
}

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

    if (!session?.user) {
      return Response.json(
        { error: 'Unauthorized' },
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

    const { id } = await params

    const generation = await prisma.generation.findUnique({
      where: { id },
    })

    if (!generation) {
      return Response.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Ensure user owns this generation
    if (generation.userId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return Response.json({
      id: generation.id,
      status: generation.status.toLowerCase(),
      type: generation.type.toLowerCase(),
      prompt: generation.prompt,
      resultUrl: generation.s3Key ? await getSignedImageUrl(generation.s3Key) : generation.resultUrl,
      seed: generation.seed ? Number(generation.seed) : null,
      width: generation.width,
      height: generation.height,
      errorMessage: generation.errorMessage,
      createdAt: generation.createdAt.toISOString(),
      completedAt: generation.completedAt?.toISOString(),
      s3Key: generation.s3Key,
      model: generation.model,
    })
  } catch (error) {
    console.error('Status check error:', error)
    return Response.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}

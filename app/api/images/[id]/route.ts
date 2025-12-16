import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

export async function DELETE(
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

        // Find the generation
        const generation = await prisma.generation.findUnique({
            where: {
                id,
                userId: session.user.id, // Ensure user owns the generation
            },
        })

        if (!generation) {
            return Response.json(
                { error: 'Generation not found' },
                { status: 404 }
            )
        }

        // Delete from S3 if key exists
        if (generation.s3Key) {
            try {
                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Key: generation.s3Key,
                    })
                )
            } catch (s3Error) {
                console.error('Failed to delete S3 object:', s3Error)
                // Continue to delete from DB even if S3 delete fails
            }
        }

        // Delete thumbnail from S3 if exists
        if (generation.thumbnailS3Key) {
            try {
                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Key: generation.thumbnailS3Key,
                    })
                )
            } catch (s3Error) {
                console.error('Failed to delete S3 thumbnail:', s3Error)
            }
        }

        // Delete from database
        await prisma.generation.delete({
            where: { id },
        })

        return Response.json({ success: true })

    } catch (error) {
        console.error('Delete generation error:', error)
        return Response.json(
            { error: 'Failed to delete generation' },
            { status: 500 }
        )
    }
}

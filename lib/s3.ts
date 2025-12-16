import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadImageToS3(
  imageUrl: string,
  userId: string,
  prompt: string
): Promise<{ imageKey: string; thumbnailKey: string }> {
  // Download image from Fal.ai
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()
  const imageBuffer = Buffer.from(buffer)

  // Generate S3 keys
  const timestamp = Date.now()
  const imageKey = `images/${userId}/${timestamp}.png`
  const thumbnailKey = `thumbnails/${userId}/${timestamp}.jpg`

  // Generate thumbnail (400x400, JPEG quality 80)
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(400, 400, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer()

  // Upload both full image and thumbnail in parallel
  await Promise.all([
    s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/png',
        Metadata: {
          prompt: prompt.substring(0, 1000), // S3 metadata has size limits
          userId,
        },
      })
    ),
    s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        Metadata: {
          prompt: prompt.substring(0, 1000),
          userId,
        },
      })
    ),
  ])

  return { imageKey, thumbnailKey }
}

export async function getSignedImageUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  })

  // URL valid for 24 hours (86400 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 86400 })
}

// Generate a fresh signed URL (used internally and for cache refresh)
export async function generateFreshSignedUrl(key: string): Promise<{ url: string; expiry: Date }> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  })

  // URL valid for 24 hours (86400 seconds)
  const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 })

  // Set expiry to 23 hours from now (1 hour buffer before actual expiry)
  const expiry = new Date(Date.now() + 23 * 60 * 60 * 1000)

  return { url, expiry }
}

export function getPublicImageUrl(key: string): string {
  // If your bucket is public, use this
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

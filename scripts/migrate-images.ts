import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateImages() {
  try {
    console.log('Starting migration from GeneratedImage to Generation...')

    // Get all images from the old table
    const oldImages = await prisma.generatedImage.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    console.log(`Found ${oldImages.length} images to migrate`)

    if (oldImages.length === 0) {
      console.log('No images to migrate')
      return
    }

    // Check if any have already been migrated (by checking if ID exists in Generation table)
    const existingGenerationIds = await prisma.generation.findMany({
      where: {
        id: {
          in: oldImages.map((img) => img.id),
        },
      },
      select: {
        id: true,
      },
    })

    const existingIds = new Set(existingGenerationIds.map((g) => g.id))
    const imagesToMigrate = oldImages.filter((img) => !existingIds.has(img.id))

    console.log(`${imagesToMigrate.length} images need to be migrated`)
    console.log(`${existingIds.size} images already exist in Generation table`)

    if (imagesToMigrate.length === 0) {
      console.log('All images have already been migrated!')
      return
    }

    // Migrate each image
    let migrated = 0
    for (const image of imagesToMigrate) {
      await prisma.generation.create({
        data: {
          id: image.id, // Keep the same ID
          userId: image.userId,
          type: 'IMAGE',
          status: 'COMPLETED',
          prompt: image.prompt,
          model: 'legacy', // We don't know the original model
          resultUrl: image.imageUrl,
          s3Key: image.s3Key,
          seed: image.seed,
          width: image.width,
          height: image.height,
          parameters: {}, // Empty JSON object
          createdAt: image.createdAt,
          updatedAt: image.createdAt,
          completedAt: image.createdAt,
        },
      })
      migrated++
      if (migrated % 10 === 0) {
        console.log(`Migrated ${migrated}/${imagesToMigrate.length} images...`)
      }
    }

    console.log(`✅ Successfully migrated ${migrated} images!`)
    console.log('\nMigration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateImages()

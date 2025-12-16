import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ImageGallery } from '@/components/image-gallery'
import Link from 'next/link'

export default async function Gallery() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Your Gallery
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              All your generated images and videos
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/generate"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate New
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>

        <ImageGallery />
      </div>
    </main>
  )
}

'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'

export default function BlackForestLabs() {
  const { resolvedTheme } = useTheme()

  return (
    <Image
      src={resolvedTheme === 'dark' ? '/bfl-symbol-white.svg' : '/bfl-symbol-black.svg'}
      alt="Black Forest Labs"
      width={32}
      height={32}
      className="size-8"
    />
  )
}

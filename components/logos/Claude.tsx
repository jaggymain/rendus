'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'

export default function Claude() {
  const { resolvedTheme } = useTheme()

  return (
    <Image
      src={resolvedTheme === 'dark' ? '/Claude symbol - Ivory.svg' : '/Claude symbol - Clay.svg'}
      alt="Claude"
      width={32}
      height={32}
      className="size-8"
    />
  )
}

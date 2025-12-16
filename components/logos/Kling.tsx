import Image from 'next/image'

export default function Kling() {
  return (
    <Image
      src="/kling-logo.png"
      alt="Kling"
      width={32}
      height={32}
      className="size-8"
    />
  )
}

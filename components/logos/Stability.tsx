import Image from 'next/image'

export default function Stability() {
  return (
    <Image
      src="/stability-logo.png"
      alt="Stability AI"
      width={32}
      height={32}
      className="size-8"
    />
  )
}

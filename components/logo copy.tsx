import { cn } from "@/lib/utils"
import Link from "next/link"

//
// LOGO (icon + text)
//
export const Logo = ({
  className,
  uniColor,
}: {
  className?: string
  uniColor?: boolean
}) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <LogoIcon uniColor={uniColor} />
      {/* Text – white in dark mode, black in light mode */}
      <span className="text-lg font-semibold tracking-tight text-black dark:text-white">
        Rendus.ai
      </span>
    </Link>
  )
}

//
// ICON ONLY
//
export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string
  uniColor?: boolean
}) => {
  const centerFill = uniColor ? "currentColor" : "#4DA3FF"
  const orbitFill = uniColor ? "currentColor" : "#D0D0D0"
  const trailStroke1 = uniColor ? "currentColor" : "url(#trail1)"
  const trailStroke2 = uniColor ? "currentColor" : "url(#trail2)"
  const highlightStroke = uniColor ? "currentColor" : "#FFFFFF"

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // group for internal hover effects, rotate on hover
      className={cn(
        "shrink-0 group transition-transform duration-300 ease-out hover:rotate-[12deg]",
        className,
      )}
    >
      <defs>
        {/* Orange tapered comet trails */}
        <linearGradient
          id="trail1"
          x1="20"
          y1="6"
          x2="12"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF7A21" />
          <stop offset="100%" stopColor="#FF7A21" stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id="trail2"
          x1="4"
          y1="18"
          x2="12"
          y2="3"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF7A21" />
          <stop offset="100%" stopColor="#FF7A21" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Blue glow behind centre sphere (intensifies on hover) */}
      {!uniColor && (
        <circle
          cx="12"
          cy="12"
          r="6"
          fill="#4DA3FF"
          className="opacity-0 group-hover:opacity-40 transition-opacity duration-300 filter blur-sm"
        />
      )}

      {/* Centre circle (solid, with 3D highlight) */}
      <circle cx="12" cy="12" r="3.2" fill={centerFill} />

      {/* 3D highlight arc on centre sphere */}
      <path
        d="M9.7 11.2a2.6 2.6 0 0 1 3.6-1.8"
        stroke={highlightStroke}
        strokeWidth={0.9}
        strokeLinecap="round"
        className={cn(
          !uniColor && "opacity-60 group-hover:opacity-90",
          "transition-opacity duration-300",
        )}
      />

      {/* Orbiting circles (solid, with small highlights) */}
      <circle cx="19" cy="5" r="2.2" fill={orbitFill} />
      <path
        d="M18.1 4.6a1.3 1.3 0 0 1 1.5-.7"
        stroke={highlightStroke}
        strokeWidth={0.7}
        strokeLinecap="round"
        className={cn(
          !uniColor && "opacity-50 group-hover:opacity-80",
          "transition-opacity duration-300",
        )}
      />

      <circle cx="5" cy="19" r="2.2" fill={orbitFill} />
      <path
        d="M4.2 18.6a1.3 1.3 0 0 1 1.5-.7"
        stroke={highlightStroke}
        strokeWidth={0.7}
        strokeLinecap="round"
        className={cn(
          !uniColor && "opacity-50 group-hover:opacity-80",
          "transition-opacity duration-300",
        )}
      />

      {/* Comet trails (single line each, orange, tapered via gradient) */}
      <path
        d="M20.341 6.484A10 10 0 0 1 10.266 21.85"
        stroke={trailStroke1}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
        strokeDasharray="40 60"
      >
        {/* Warp-like motion along trail, hover-triggered via SMIL */}
        <animate
          attributeName="stroke-dashoffset"
          values="0;-100"
          dur="2s"
          repeatCount="indefinite"
          begin="mouseover"
          end="mouseout"
        />
      </path>

      <path
        d="M3.659 17.516A10 10 0 0 1 13.74 2.152"
        stroke={trailStroke2}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
        strokeDasharray="40 60"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-100"
          dur="2s"
          repeatCount="indefinite"
          begin="mouseover"
          end="mouseout"
        />
      </path>
    </svg>
  )
}

//
// ORIGINAL LOGO STROKE (unchanged)
//
export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-7 w-7", className)}
      viewBox="0 0 71 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M61.25 1.625L70.75 1.5625C70.75 4.77083 70.25 7.79167 69.25 10.625C68.2917 13.4583 66.8958 15.9583 65.0625 18.125C63.2708 20.25 61.125 21.9375 58.625 23.1875C56.1667 24.3958 53.4583 25 50.5 25C46.875 25 43.6667 24.2708 40.875 22.8125C38.125 21.3542 35.125 19.2083 31.875 16.375C29.75 14.4167 27.7917 12.8958 26 11.8125C24.2083 10.7292 22.2708 10.1875 20.1875 10.1875C18.0625 10.1875 16.25 10.7083 14.75 11.75C13.25 12.75 12.0833 14.1875 11.25 16.0625C10.4583 17.9375 10.0625 20.1875 10.0625 22.8125L0 22.9375C0 19.6875 0.479167 16.6667 1.4375 13.875C2.4375 11.0833 3.83333 8.64583 5.625 6.5625C7.41667 4.47917 9.54167 2.875 12 1.75C14.5 0.583333 17.2292 0 20.1875 0C23.8542 0 27.1042 0.770833 29.9375 2.3125C32.8125 3.85417 35.7708 5.97917 38.8125 8.6875C41.1042 10.7708 43.1042 12.3333 44.8125 13.375C46.5625 14.375 48.4583 14.875 50.5 14.875C52.6667 14.875 54.5417 14.3125 56.125 13.1875C57.75 12.0625 59 10.5 59.875 8.5C60.7917 6.5 61.25 4.20833 61.25 1.625Z"
        strokeWidth={0.5}
        stroke="currentColor"
      />
    </svg>
  )
}
export default function Luma() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="luma-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#EC4899"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#luma-gradient)"/>
      <path d="M10 22V10l6 6 6-6v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

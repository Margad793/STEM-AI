import { useId } from 'react'

type SocialIconProps = { size?: number; className?: string }

export function InstagramGlyph({ size = 18, className }: SocialIconProps) {
  const gradientId = `instagram-gradient-${useId().replace(/:/g, '')}`
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB12A" />
          <stop offset=".48" stopColor="#F02D74" />
          <stop offset="1" stopColor="#8247D8" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6.5" fill={`url(#${gradientId})`} />
      <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="17" cy="7.2" r="1.15" fill="white" />
    </svg>
  )
}

export function FacebookGlyph({ size = 18, className }: SocialIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#0866FF" />
      <path fill="white" d="M12.8 21v-8.2h2.76l.41-3.2H12.8V7.56c0-.93.26-1.57 1.59-1.57h1.7V3.13c-.3-.04-1.34-.13-2.55-.13-2.53 0-4.26 1.54-4.26 4.37V9.6H6.42v3.2h2.86V21h3.52Z" />
    </svg>
  )
}

export function ViberGlyph({ size = 18, className }: SocialIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#7360F2" d="M12 1.8c-5.72 0-10.2 3.73-10.2 9.03 0 2.12.72 4.04 2.02 5.56L2.6 21.5l5.2-1.55c1.27.5 2.68.78 4.2.78 5.72 0 9.6-4.06 9.6-9.36S17.72 1.8 12 1.8Z" />
      <path fill="white" d="M8.2 6.4c-.4-.38-1.07-.35-1.45.06l-.65.7c-.43.47-.6 1.13-.43 1.74.92 3.38 3.63 6.1 7.02 7.02.61.17 1.27 0 1.74-.43l.7-.65c.41-.38.44-1.05.06-1.45l-1.24-1.3c-.34-.36-.88-.44-1.31-.2l-.8.46a8.02 8.02 0 0 1-2.6-2.6l.46-.8c.24-.43.16-.97-.2-1.31L8.2 6.4Z" />
      <path d="M13.55 6.1c2.18.28 3.8 1.9 4.08 4.08M13.4 8.25c.96.17 1.56.77 1.73 1.73" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function GitHubGlyph({ size = 18, className }: SocialIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.52.1.72-.23.72-.5v-1.84c-2.94.64-3.56-1.25-3.56-1.25-.48-1.22-1.17-1.55-1.17-1.55-.96-.66.07-.65.07-.65 1.06.08 1.62 1.09 1.62 1.09.95 1.62 2.49 1.15 3.1.88.1-.69.37-1.15.68-1.42-2.35-.27-4.82-1.18-4.82-5.23 0-1.16.42-2.1 1.1-2.85-.11-.27-.48-1.35.1-2.81 0 0 .9-.29 2.89 1.09a10.05 10.05 0 0 1 5.26 0c2-1.38 2.89-1.09 2.89-1.09.58 1.46.21 2.54.1 2.81.69.75 1.1 1.69 1.1 2.85 0 4.06-2.47 4.96-4.83 5.22.38.33.72.97.72 1.96v2.9c0 .27.19.6.72.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  )
}

export function LinkedInGlyph({ size = 18, className }: SocialIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#0A66C2" />
      <path fill="white" d="M7.1 9.3H4.4v9.1h2.7V9.3ZM5.75 8.1a1.56 1.56 0 1 0 0-3.12 1.56 1.56 0 0 0 0 3.12ZM19.6 13.2c0-2.74-1.46-4.02-3.4-4.02-1.57 0-2.28.86-2.67 1.46V9.3h-2.7v9.1h2.7v-4.5c0-1.18.22-2.32 1.68-2.32s1.48 1.35 1.48 2.4v4.42h2.7l.01-5.2Z" />
    </svg>
  )
}

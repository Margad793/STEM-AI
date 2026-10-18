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

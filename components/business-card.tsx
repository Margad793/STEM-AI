'use client'

import { useEffect, useRef, useState } from 'react'
import { Globe2, Hash, Mail, Phone } from 'lucide-react'
import QRCode from 'qrcode'
import { getCarbonWaveTextureImage, getOrganizationAssets, ORGANIZATION_AVATAR_HEIGHT, ORGANIZATION_AVATAR_RIGHT, ORGANIZATION_AVATAR_TOP, ORGANIZATION_BACK_CONTENT_LEFT, ORGANIZATION_COMPANY_HEIGHT, ORGANIZATION_COMPANY_LEFT, ORGANIZATION_COMPANY_RIGHT, ORGANIZATION_COMPANY_TOP, ORGANIZATION_CONTACTS_BOTTOM, ORGANIZATION_CONTACTS_TOP, ORGANIZATION_LOGO_DIAMETER, ORGANIZATION_LOGO_LEFT, ORGANIZATION_LOGO_TOP, ORGANIZATION_PATTERN_WIDTH, ORGANIZATION_PERSON_NAME_TOP, ORGANIZATION_TEXT_LEFT, ORGANIZATION_TEXT_RIGHT, ORGANIZATION_TITLE_TOP } from '@/lib/card-design'
import type { CardDesign, Profile, Template, Texture } from '@/lib/card-types'
import { fitText, packContactRows } from '@/lib/fit-text'
import { getPublicSiteOrigin } from '@/lib/site'

const publicCardOrigin = getPublicSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL)
const publicCardHost = publicCardOrigin.replace(/^https?:\/\//i, '')

type CardCopy = {
  save: string
  scan: string
  flip: string
}

function CardQR({ url }: { url: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    let active = true
    QRCode.toString(url, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#172538ff', light: '#ffffffff' },
    }).then((result) => {
      if (active) setSvg(result)
    }).catch((error: unknown) => {
      console.error('Could not create card QR code.', error)
    })
    return () => {
      active = false
    }
  }, [url])

  return <div data-qr="1" className="size-[calc(48*var(--u))] shrink-0 overflow-hidden rounded-[calc(6*var(--u))] bg-white p-[calc(3*var(--u))] [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
}

function CardFace({
  back = false,
  exportMode = false,
  template,
  profile,
  t,
  texture,
  publicCode,
  design,
}: {
  back?: boolean
  exportMode?: boolean
  template: Template
  profile: Profile
  t: CardCopy
  texture: Texture
  publicCode: string
  design?: CardDesign
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const fit = () => {
      root.querySelectorAll<HTMLElement>('[data-fit]').forEach((element) => fitText(element, Number(element.dataset.fit) || 1))
      const contacts = root.querySelector<HTMLElement>('[data-contacts]')
      if (contacts) packContactRows(contacts)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(root)
    return () => observer.disconnect()
  }, [back, profile, template.name])

  const organization = getOrganizationAssets(design)
  const nameParts = profile.name.trim().split(/\s+/).filter(Boolean)
  const personNameLines = nameParts.length > 1 ? `${nameParts[0]}\n${nameParts.slice(1).join(' ')}` : profile.name
  const textureImage = organization ? undefined : texture === 'carbon-wave'
    ? getCarbonWaveTextureImage(template.name)
    : texture === 'arcs'
    ? undefined
    : texture === 'matte'
      ? undefined
      : texture === 'holographic'
        ? template.name === 'Minimalist Classic'
          ? 'linear-gradient(118deg, rgba(245,239,230,.95), rgba(198,185,210,.55) 38%, rgba(181,220,222,.48) 68%, rgba(247,220,190,.72)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.4) 0 1.5px, rgba(133,91,145,.14) 1.5px 3px, transparent 3px 5px), linear-gradient(32deg, rgba(238,160,202,.18), rgba(255,255,255,.2), rgba(91,210,211,.16))'
          : template.name === 'Soft Feminine Pastel'
            ? 'linear-gradient(118deg, rgba(255,220,228,.92), rgba(235,151,181,.7) 42%, rgba(250,194,211,.86) 72%, rgba(255,231,237,.9)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.5) 0 1.8px, rgba(150,65,105,.18) 1.8px 3.2px, transparent 3.2px 5px)'
            : template.name === 'Creative Glass'
              ? 'linear-gradient(118deg, rgba(65,28,112,.72), rgba(207,91,186,.46) 38%, rgba(54,190,210,.42) 70%, rgba(244,151,205,.48)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.34) 0 1.4px, rgba(42,20,78,.12) 1.4px 2.8px, transparent 2.8px 5px), linear-gradient(32deg, rgba(120,72,210,.2), rgba(255,255,255,.14) 48%, rgba(64,214,220,.18))'
              : `linear-gradient(${template.name === 'Minimalist Classic' || template.name === 'Soft Feminine Pastel' ? 'rgba(28,20,52,.28)' : 'rgba(28,20,52,.14)'}, ${template.name === 'Minimalist Classic' || template.name === 'Soft Feminine Pastel' ? 'rgba(28,20,52,.28)' : 'rgba(28,20,52,.14)'}), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.22) 0 1px, transparent 1px 5px), linear-gradient(120deg, rgba(255,105,180,.28), rgba(80,210,255,.22), rgba(255,220,110,.22))`
        : template.name === 'Minimalist Classic'
          ? 'linear-gradient(118deg, rgba(244,240,235,.98), rgba(235,230,224,.98) 48%, rgba(241,237,231,.98)), repeating-linear-gradient(115deg, rgba(70,48,66,1) 0 2.5px, rgba(255,255,255,.78) 2.5px 4px, transparent 4px 5px)'
          : template.name === 'Soft Feminine Pastel'
            ? 'linear-gradient(118deg, rgba(247,205,211,.9), rgba(224,143,169,.72) 48%, rgba(247,190,207,.86)), repeating-linear-gradient(115deg, rgba(255,255,255,.42) 0 1.5px, rgba(145,76,103,.16) 1.5px 3px, transparent 3px 5px)'
            : template.name === 'Creative Glass'
              ? 'linear-gradient(118deg, rgba(36,20,76,.78), rgba(187,91,190,.48) 42%, rgba(69,190,206,.42) 72%, rgba(225,128,194,.5)), repeating-linear-gradient(115deg, rgba(255,255,255,.36) 0 1.5px, rgba(35,20,70,.2) 1.5px 3px, transparent 3px 5px), repeating-linear-gradient(25deg, rgba(255,255,255,.18) 0 1px, transparent 1px 7px)'
              : `linear-gradient(${template.name === 'Minimalist Classic' || template.name === 'Soft Feminine Pastel' ? 'rgba(18,24,32,.3)' : 'rgba(18,24,32,.16)'}, ${template.name === 'Minimalist Classic' || template.name === 'Soft Feminine Pastel' ? 'rgba(18,24,32,.3)' : 'rgba(18,24,32,.16)'}), repeating-linear-gradient(115deg, rgba(255,255,255,.2) 0 1.5px, rgba(255,255,255,.03) 1.5px 3px, transparent 3px 5px), linear-gradient(135deg, rgba(30,40,50,.22), rgba(255,255,255,.12))`

  return (
    <div
      ref={rootRef}
      style={{
        backfaceVisibility: exportMode ? 'visible' : 'hidden',
        WebkitBackfaceVisibility: exportMode ? 'visible' : 'hidden',
        transformOrigin: 'center',
        transform: exportMode ? 'none' : back ? 'rotateY(180deg)' : 'rotateY(0deg)',
        color: organization ? '#26333a' : template.textColor,
        backgroundColor: organization ? '#ffffff' : undefined,
        backgroundImage: textureImage,
        textShadow: organization ? undefined : texture === 'arcs' && template.name === 'Creative Glass'
          ? '0 1px 3px rgba(24,14,38,.9), 0 0 2px rgba(255,255,255,.35)'
          : texture === 'metal' && template.name === 'Soft Feminine Pastel'
            ? '0 1px 2px rgba(255,255,255,.8), 0 0 1px rgba(100,45,70,.28)'
            : texture === 'metal' && template.name === 'Creative Glass'
              ? '0 1px 2px rgba(25,12,55,.85), 0 0 1px rgba(255,255,255,.7)'
              : undefined,
      }}
      className={`${exportMode ? 'relative' : 'absolute inset-0'} isolate flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[calc(18*var(--u))] border border-black/10 p-[calc(12*var(--u))] [transform-style:preserve-3d] ${template.background} ${template.ink}`}
    >
      {!organization && <div className={`pointer-events-none absolute inset-0 rounded-[calc(18*var(--u))] ${texture === 'matte' ? 'bg-black/[0.025]' : 'bg-white/[0.03]'}`} />}
      {!organization && texture === 'arcs' && <>
        <div className="pointer-events-none absolute right-[calc(-48*var(--u))] top-[calc(-64*var(--u))] size-[calc(160*var(--u))] rounded-full border-[calc(18*var(--u))] border-white/55" />
        <div className="pointer-events-none absolute bottom-[calc(-80*var(--u))] left-[calc(-48*var(--u))] size-[calc(176*var(--u))] rounded-full border-[calc(22*var(--u))] border-white/45" />
      </>}
      {organization && (
        <div
          data-organization-pattern="1"
          style={{ width: ORGANIZATION_PATTERN_WIDTH }}
          className="pointer-events-none absolute inset-y-0 left-0 z-0 overflow-hidden"
        >
          <img src={organization.patternSrc} alt="" className="size-full object-cover" />
        </div>
      )}
      {organization && !back && (
        <>
          {profile.companyLogo && (
            <div
              data-organization-logo="1"
              style={{ left: ORGANIZATION_LOGO_LEFT, top: ORGANIZATION_LOGO_TOP, width: ORGANIZATION_LOGO_DIAMETER }}
              className="absolute z-10 flex aspect-square items-center justify-center overflow-hidden rounded-full border border-current/20 bg-white"
            >
              <img src={profile.companyLogo} alt={`${profile.company} logo`} className="size-full object-cover" />
            </div>
          )}
          <div
            data-organization-header="1"
            style={{ top: ORGANIZATION_COMPANY_TOP, height: ORGANIZATION_COMPANY_HEIGHT, left: ORGANIZATION_COMPANY_LEFT, right: ORGANIZATION_COMPANY_RIGHT, color: organization.nameColor }}
            className="absolute z-10 flex items-center text-left"
          >
            <p data-fit="2" data-fit-split="2" className="line-clamp-2 min-w-0 break-words text-[calc(10.5*var(--u))] font-bold leading-[1.05] tracking-[0.04em]">{profile.company.toUpperCase()}</p>
          </div>
          {profile.photo && (
            <div
              data-organization-avatar="1"
              style={{ top: ORGANIZATION_AVATAR_TOP, height: ORGANIZATION_AVATAR_HEIGHT, right: ORGANIZATION_AVATAR_RIGHT }}
              className="absolute z-10 flex aspect-square items-center justify-center overflow-hidden rounded-full border border-current/25 bg-black/10"
            >
              <img src={profile.photo} alt={`${profile.name} photo`} className="size-full object-cover" />
            </div>
          )}
          <div
            data-organization-content="1"
            style={{ left: ORGANIZATION_TEXT_LEFT, right: ORGANIZATION_TEXT_RIGHT }}
            className="absolute inset-y-0 z-10 text-left"
          >
            <p data-fit="2" style={{ top: ORGANIZATION_PERSON_NAME_TOP }} className="line-clamp-2 absolute inset-x-0 break-words whitespace-pre-line text-[calc(11.8*var(--u))] font-bold leading-[1.18]">{personNameLines}</p>
            <p data-fit="1" style={{ top: ORGANIZATION_TITLE_TOP }} className="absolute inset-x-0 truncate text-[calc(7.7*var(--u))] font-normal leading-tight opacity-75">{profile.title}</p>
            <div data-contacts="1" style={{ top: ORGANIZATION_CONTACTS_TOP, bottom: ORGANIZATION_CONTACTS_BOTTOM }} className="absolute inset-x-0 flex flex-col justify-center overflow-hidden text-[calc(7.4*var(--u))] font-normal leading-[1.12] opacity-70">
              {profile.location.trim() && <p data-fit="2" className="line-clamp-2 min-w-0 break-words">{profile.location}</p>}
              {profile.showPhone && profile.phone.trim() && <p data-fit="1" className="min-w-0 truncate">{profile.phone}</p>}
              {profile.showBusinessEmail && profile.businessEmail.trim() && <p data-fit="1" className="min-w-0 truncate">{profile.businessEmail}</p>}
              {profile.showPersonalEmail && profile.personalEmail.trim() && <p data-fit="1" className="min-w-0 truncate">{profile.personalEmail}</p>}
              {profile.showRoomNumber && profile.roomNumber.trim() && <p data-fit="1" className="min-w-0 truncate">{profile.roomNumber}</p>}
              {profile.showWebsite && profile.website.trim() && <p data-fit="1" className="min-w-0 truncate">{profile.website}</p>}
            </div>
          </div>
        </>
      )}
      {back ? (
        <div style={organization ? { paddingLeft: ORGANIZATION_BACK_CONTENT_LEFT } : undefined} className="relative z-10 flex h-full min-h-0 w-full flex-col">
          <div className="mb-[calc(8*var(--u))] flex shrink-0 items-center justify-between gap-[calc(6*var(--u))] border-b border-current/15 pb-[calc(8*var(--u))]">
            <span data-fit="2" data-fit-split="2" className="line-clamp-2 min-w-0 break-words text-[calc(11*var(--u))] font-bold tracking-[0.18em]">{profile.company.toUpperCase()}</span>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-between gap-[calc(6*var(--u))]">
            <div className="flex min-w-0 flex-1 flex-col gap-[calc(6*var(--u))] text-[calc(8*var(--u))] font-medium leading-tight">
              {profile.showPhone && profile.phone.trim() && <p data-fit="1" className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"><Phone size={12} className="size-[1.5em] shrink-0" /><span className="min-w-0">{profile.phone}</span></p>}
              {profile.showRoomNumber && profile.roomNumber.trim() && <p data-fit="1" className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"><Hash size={12} className="size-[1.5em] shrink-0" /><span className="min-w-0">{profile.roomNumber}</span></p>}
              {profile.showBusinessEmail && profile.businessEmail.trim() && <p data-fit="1" className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"><Mail size={12} className="size-[1.5em] shrink-0" /><span className="min-w-0">{profile.businessEmail}</span></p>}
              {profile.showPersonalEmail && profile.personalEmail.trim() && <p data-fit="1" className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"><Mail size={12} className="size-[1.5em] shrink-0" /><span className="min-w-0">{profile.personalEmail}</span></p>}
              {profile.showWebsite && profile.website.trim() && <p data-fit="1" className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"><Globe2 size={12} className="size-[1.5em] shrink-0" /><span className="min-w-0">{profile.website}</span></p>}
            </div>
            <CardQR url={`${publicCardOrigin}/c/${encodeURIComponent(publicCode)}`} />
          </div>
          <div className="flex min-w-0 shrink-0 items-end justify-between gap-[calc(6*var(--u))] border-t border-current/15 pt-[calc(8*var(--u))] leading-tight">
            <p className="flex min-w-0 max-w-[45%] shrink items-center gap-[calc(4*var(--u))] text-[calc(8*var(--u))] font-medium opacity-65"><span className="shrink-0 text-[1.5em]">⌖</span><span data-fit="2" className="line-clamp-2 min-w-0 break-words">{profile.location}</span></p>
            <div className="min-w-0 flex-1 break-all text-right text-[calc(6*var(--u))] leading-tight font-medium opacity-65">{t.scan}<br />{publicCardHost}/c/{publicCode}</div>
          </div>
        </div>
      ) : organization ? null : (
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col justify-between">
          <div className="flex items-start justify-between gap-[calc(6*var(--u))]">
            <span className="line-clamp-2 min-w-0 flex-1 break-words text-center text-[calc(12*var(--u))] font-bold leading-tight tracking-[0.18em]">{profile.company.toUpperCase()}</span>
            <div className="flex size-[calc(28*var(--u))] shrink-0 items-center justify-center overflow-hidden rounded-full border border-current/20 text-[calc(12*var(--u))] font-bold">
              {profile.companyLogo ? <img src={profile.companyLogo} alt={`${profile.company} logo`} className="size-full object-cover" /> : (profile.company.trim()[0] || profile.name.trim()[0] || 'C').toUpperCase()}
            </div>
          </div>
          <div className="flex items-end gap-[calc(12*var(--u))]">
            <div className="flex size-[calc(48*var(--u))] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-current/25 bg-black/10 text-[calc(18*var(--u))] font-bold">
              {profile.photo ? <img src={profile.photo} alt={`${profile.name} photo`} className="size-full object-cover" /> : profile.name.split(' ').map((part) => part[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p data-fit="1" className="w-full overflow-hidden whitespace-nowrap text-[calc(15*var(--u))] font-semibold leading-none tracking-[0.18em]">{profile.name.toUpperCase()}</p>
              <p className="card-handwritten mt-[calc(6*var(--u))] text-[calc(14*var(--u))] font-medium opacity-75">{profile.title}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[calc(10*var(--u))] font-medium opacity-60"><span>{profile.showWebsite ? profile.website : ''}</span><span>{profile.location}</span></div>
        </div>
      )}
    </div>
  )
}

export function CardFacesExport({
  template,
  profile,
  texture,
  publicCode,
  design,
  language = 'en',
}: {
  template: Template
  profile: Profile
  texture: Texture
  publicCode: string
  design?: CardDesign
  language?: 'en' | 'mn'
}) {
  const copy = language === 'mn'
    ? { save: 'Хадгалах', scan: 'Холбогдохын тулд уншуулна уу', flip: 'Карт эргүүлэх' }
    : { save: 'Save', scan: 'Scan to connect', flip: 'Flip card' }
  return (
    <>
      <div className="flip-card relative isolate aspect-[1.7] w-full overflow-hidden">
        <CardFace exportMode template={template} profile={profile} t={copy} texture={texture} publicCode={publicCode} design={design} />
      </div>
      <div className="flip-card relative isolate aspect-[1.7] w-full overflow-hidden">
        <CardFace exportMode back template={template} profile={profile} t={copy} texture={texture} publicCode={publicCode} design={design} />
      </div>
    </>
  )
}

export function FlipCard({
  template,
  profile,
  t,
  texture,
  publicCode,
  design,
  compact = false,
}: {
  template: Template
  profile: Profile
  t: CardCopy
  texture: Texture
  publicCode: string
  design?: CardDesign
  compact?: boolean
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className={`flex w-full min-w-0 flex-col items-center ${compact ? 'gap-1.5' : 'gap-3'}`}>
      <button
        type="button"
        aria-label={t.flip}
        onClick={() => setFlipped((value) => !value)}
        className={`flip-card group relative aspect-[1.7] w-full min-w-0 [perspective:1200px] drop-shadow-[0_15px_23px_rgba(15,23,42,0.28)] ${compact ? 'max-w-[225px]' : 'max-w-[520px]'}`}
      >
        <div style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }} className="relative size-full min-w-0 transition-transform duration-700">
          <CardFace template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} design={design} />
          <CardFace back template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} design={design} />
        </div>
      </button>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Download, Mail, Phone } from 'lucide-react'
import { FlipCard } from '@/components/business-card'
import { PublicCardAssetActions } from '@/components/public-card-asset-actions'
import { FacebookGlyph, InstagramGlyph, ViberGlyph } from '@/components/social-icons'
import { getCardActionStyle, templateSlugs, templates } from '@/lib/card-design'
import type { Profile, Texture } from '@/lib/card-types'
import { supabase } from '@/lib/supabase-browser'
import { getPublicSiteOrigin } from '@/lib/site'
import { createContactVCard, encodeContactPhoto } from '@/lib/vcard'

const publicCardHost = getPublicSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL).replace(/^https?:\/\//i, '')

type PublicCard = {
  public_code: string
  name: string
  title: string
  company: string
  company_logo_url: string | null
  location: string
  bio: string
  email: string
  business_email: string | null
  personal_email: string | null
  show_phone: boolean | null
  show_business_email: boolean | null
  show_personal_email: boolean | null
  show_room_number: boolean | null
  show_website: boolean | null
  show_instagram: boolean | null
  show_facebook: boolean | null
  show_viber: boolean | null
  phone: string
  room_number: string | null
  website: string
  instagram: string
  facebook: string
  viber: string
  photo_url: string
  template: string
  texture: string
  language: 'en' | 'mn' | null
}

export default function PublicCardPage() {
  const params = useParams<{ code: string }>()
  const code = Array.isArray(params.code) ? params.code[0] : params.code
  const [card, setCard] = useState<PublicCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!supabase) {
      setError('This card is temporarily unavailable.')
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('cards')
          .select('public_code, name, title, company, company_logo_url, location, bio, email, business_email, personal_email, show_phone, show_business_email, show_personal_email, show_room_number, show_website, show_instagram, show_facebook, show_viber, phone, room_number, website, instagram, facebook, viber, photo_url, template, texture, language')
          .eq('public_code', code)
          .eq('is_published', true)
          .maybeSingle()
        if (!active) return
        if (queryError) throw queryError
        setCard(data as PublicCard | null)
      } catch (queryError) {
        if (active) setError(queryError instanceof Error ? queryError.message : 'Unable to load this card.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [code])

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-sm text-[#52606f]">Loading card...</main>
  if (error || !card) return <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#f7f8fa] p-6 text-center text-[#52606f]"><h1 className="text-lg font-semibold">Card unavailable</h1><p className="text-sm">{error || 'This card does not exist or has not been published.'}</p></main>

  const phone = card.phone?.trim() || ''
  const businessEmail = card.business_email || card.email || ''
  const personalEmail = card.personal_email || ''
  const instagram = (card.show_instagram ?? true) ? card.instagram?.trim() || '' : ''
  const viber = (card.show_viber ?? true) ? card.viber?.trim() || '' : ''
  const facebook = (card.show_facebook ?? true) ? card.facebook?.trim() || '' : ''
  const websiteValue = card.website?.trim() || ''
  const phoneVisible = (card.show_phone ?? true) && Boolean(phone)
  const businessEmailVisible = (card.show_business_email ?? true) && Boolean(businessEmail.trim())
  const personalEmailVisible = (card.show_personal_email ?? true) && Boolean(personalEmail.trim())
  const website = (card.show_website ?? true) && websiteValue && (/^https?:\/\//i.test(websiteValue) ? websiteValue : `https://${websiteValue}`)
  const roomNumber = (card.show_room_number ?? true) ? card.room_number?.trim() || '' : ''
  const selectedTemplate = templates[Math.max(0, templateSlugs.indexOf(card.template))]
  const texture = (['holographic', 'arcs', 'matte', 'metal', 'carbon-wave'].includes(card.texture) ? card.texture : 'arcs') as Texture
  const language = card.language === 'mn' ? 'mn' : 'en'
  const profile: Profile = {
    name: card.name,
    title: card.title,
    company: card.company,
    location: card.location,
    bio: card.bio,
    businessEmail,
    personalEmail,
    showPhone: phoneVisible,
    showBusinessEmail: businessEmailVisible,
    showPersonalEmail: personalEmailVisible,
    showRoomNumber: Boolean(roomNumber),
    showWebsite: Boolean(website),
    showInstagram: Boolean(instagram),
    showFacebook: Boolean(facebook),
    showViber: Boolean(viber),
    phone,
    roomNumber,
    website: card.website?.trim() || '',
    instagram,
    facebook,
    viber,
    photo: card.photo_url || '',
    companyLogo: card.company_logo_url || '',
  }
  const cardCopy = {
    save: language === 'mn' ? 'Хадгалах' : 'Save',
    scan: language === 'mn' ? 'Холбогдохын тулд уншуулна уу' : 'Scan to connect',
    flip: language === 'mn' ? 'Карт эргүүлэх' : 'Flip card',
  }

  const downloadContact = () => {
    void (async () => {
      try {
        const photo = card.photo_url ? await encodeContactPhoto(card.photo_url) : undefined
        const vcard = createContactVCard({
          name: card.name,
          company: card.company,
          title: card.title,
          phone: phoneVisible ? phone : undefined,
          businessEmail: businessEmailVisible ? businessEmail : undefined,
          personalEmail: personalEmailVisible ? personalEmail : undefined,
          website: website || undefined,
          street: roomNumber,
          locality: card.location,
        }, photo)
        const file = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = `${card.name.replace(/\s+/g, '-')}.vcf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 2000)
      } catch (error) {
        console.error('Unable to create contact card:', error)
        window.alert(language === 'mn'
          ? 'Харилцагчийн зурагтай файлыг бэлтгэж чадсангүй. Зургийн файлаа шалгаад дахин оролдоно уу.'
          : 'Could not prepare the contact photo. Please check the image and try again.')
      }
    })()
  }

  const actionCount = Number(phoneVisible) + Number(businessEmailVisible) + Number(personalEmailVisible)
  const textColor = selectedTemplate.name === 'Soft Feminine Pastel' ? '#573b48' : selectedTemplate.name === 'Creative Glass' ? '#3d315f' : '#26333a'

  return (
    <main style={{ color: textColor }} className={`relative min-h-screen w-full overflow-x-hidden ${selectedTemplate.publicBackground}`}>
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-3 py-6 sm:px-8 sm:py-8">
        <div className="flex w-full max-w-[760px] flex-col items-center">
          <div className="public-card-flip mt-3 mb-0 w-full">
            <FlipCard template={selectedTemplate} profile={profile} t={cardCopy} texture={texture} publicCode={code} />
          </div>
          <p className="public-card-prompt mt-6 mb-6 text-center text-base font-medium text-current/55">{language === 'mn' ? 'Холбоо барих мэдээллийг харахын тулд карт дээр товшино уу.' : 'Tap the card to see contact details'}</p>
          {actionCount > 0 && (
            <div className={`w-full max-w-[520px] grid gap-3 sm:gap-4 ${actionCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {phoneVisible && <a href={`tel:${phone}`} style={getCardActionStyle(selectedTemplate, texture)} className="flex h-12 items-center justify-center gap-2.5 rounded-xl border px-3 text-sm font-bold shadow-[0_10px_24px_rgba(20,30,50,0.25)] transition hover:brightness-105 active:scale-[0.99]"><Phone size={14} />{language === 'mn' ? 'Залгах' : 'Call now'}</a>}
              {businessEmailVisible && <a href={`mailto:${businessEmail}`} style={getCardActionStyle(selectedTemplate, texture)} className="flex h-12 items-center justify-center gap-2.5 rounded-xl border px-3 text-sm font-bold shadow-[0_10px_24px_rgba(20,30,50,0.25)] transition hover:brightness-105 active:scale-[0.99]"><Mail size={14} />{language === 'mn' ? 'Имэйл бичих' : 'Email'}</a>}
              {personalEmailVisible && <a href={`mailto:${personalEmail}`} style={getCardActionStyle(selectedTemplate, texture)} className="flex h-12 items-center justify-center gap-2.5 rounded-xl border px-3 text-sm font-bold shadow-[0_10px_24px_rgba(20,30,50,0.25)] transition hover:brightness-105 active:scale-[0.99]"><Mail size={14} />{language === 'mn' ? 'Имэйл бичих' : 'Email'}</a>}
            </div>
          )}
          {Boolean(instagram || facebook || viber) && (
            <div className="public-card-socials mt-3 flex justify-center gap-3">
              {instagram && <a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-11 items-center justify-center"><InstagramGlyph size={30} /></a>}
              {viber && <a href={viber} target="_blank" rel="noreferrer" aria-label="Viber" className="flex size-11 items-center justify-center"><ViberGlyph size={30} /></a>}
              {facebook && <a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex size-11 items-center justify-center"><FacebookGlyph size={30} /></a>}
            </div>
          )}
          {phoneVisible && (
            <button type="button" onClick={downloadContact} style={getCardActionStyle(selectedTemplate, texture)} className="public-card-save mx-auto mt-3 flex h-12 w-full max-w-[520px] items-center justify-center gap-2.5 rounded-xl border px-5 text-sm font-bold shadow-[0_10px_24px_rgba(20,30,50,0.25)] transition hover:brightness-105 active:scale-[0.99]">
              <Download size={16} strokeWidth={2.4} />{language === 'mn' ? 'Харилцагчийн жагсаалтад хадгалах' : 'Save Contact'}
            </button>
          )}
          <PublicCardAssetActions profile={profile} template={selectedTemplate} texture={texture} publicCode={code} language={language} />
          <p className="mt-3 break-all text-center text-[8px] leading-tight text-current/45">{publicCardHost}/c/{card.public_code}</p>
        </div>
      </div>
    </main>
  )
}

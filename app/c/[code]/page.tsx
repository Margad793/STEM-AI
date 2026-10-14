'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Download, Globe2, Mail, MapPin, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'

const publicCardHost = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cardly.com')
  .replace(/^https?:\/\//i, '')
  .replace(/\/$/, '')

type PublicCard = {
  public_code: string
  name: string
  title: string
  company: string
  location: string
  bio: string
  email: string
  phone: string
  website: string
  instagram: string
  facebook: string
  viber: string
  whatsapp: string
  photo_url: string
  template: string
  texture: string
}

const backgrounds: Record<string, string> = {
  'minimalist-classic': 'bg-[#eef1f4] text-[#26333a]',
  'luxury-dark-gold': 'bg-gradient-to-br from-[#f4f1ec] via-[#ebe7df] to-[#dcd8d0] text-[#26333a]',
  'soft-feminine-pastel': 'bg-gradient-to-br from-[#fff7f5] via-[#f8e8ea] to-[#f1d9df] text-[#573b48]',
  'modern-executive': 'bg-gradient-to-br from-[#eef3f8] via-[#e6edf5] to-[#d8e1ec] text-[#26333a]',
  'creative-glass': 'bg-gradient-to-br from-[#edf2ff] via-[#f4eefc] to-[#fbeaf5] text-[#3d315f]',
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
        const { data, error: queryError } = await supabase.rpc('get_public_card', { p_code: code })
        if (!active) return
        if (queryError) throw queryError
        const row = (data as PublicCard[] | null)?.[0] ?? null
        setCard(row)
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

  const website = card.website && (/^https?:\/\//i.test(card.website) ? card.website : `https://${card.website}`)

  const downloadContact = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.name}`,
      `ORG:${card.company}`,
      `TITLE:${card.title}`,
      `TEL;TYPE=CELL:${card.phone}`,
      `EMAIL:${card.email}`,
      ...(website ? [`URL:${website}`] : []),
      `ADR;TYPE=WORK:;;${card.location}`,
      'END:VCARD',
    ].join('\r\n')
    const file = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `${card.name.replace(/\s+/g, '-')}.vcf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const theme = backgrounds[card.template] || backgrounds['minimalist-classic']

  return <main className={`flex min-h-screen items-center justify-center px-4 py-10 ${theme}`}>
    <article className="w-full max-w-xl rounded-[28px] border border-black/10 bg-white/80 p-6 shadow-[0_22px_60px_rgba(25,35,50,.16)] backdrop-blur sm:p-10">
      <div className="flex flex-col items-center text-center">
        {card.photo_url ? <img src={card.photo_url} alt="" className="mb-5 size-24 rounded-full border-4 border-white object-cover shadow-md" /> : <div aria-hidden="true" className="mb-5 flex size-24 items-center justify-center rounded-full bg-[#172538] text-2xl font-semibold text-white">{card.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</div>}
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">{card.company}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{card.name}</h1>
        <p className="mt-1 text-base opacity-70">{card.title}</p>
        {card.bio && <p className="mt-5 max-w-md text-sm leading-6 opacity-75">{card.bio}</p>}
        {card.location && <p className="mt-4 flex items-center gap-2 text-sm opacity-70"><MapPin size={15} />{card.location}</p>}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {card.phone && <a href={`tel:${card.phone}`} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#172538] px-3 text-sm font-semibold text-white"><Phone size={16} />Call</a>}
        {card.email && <a href={`mailto:${card.email}`} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#172538] px-3 text-sm font-semibold text-white"><Mail size={16} />Email</a>}
        {website && <a href={website} target="_blank" rel="noreferrer" className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl border border-current/15 bg-white/70 px-3 text-sm font-semibold"><Globe2 size={16} />{card.website}</a>}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-medium">
        {card.instagram && <a href={card.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-current/15 bg-white/70 px-4 py-2">Instagram</a>}
        {card.viber && <a href={card.viber} className="rounded-full border border-current/15 bg-white/70 px-4 py-2">Viber</a>}
        {card.facebook && <a href={card.facebook} target="_blank" rel="noreferrer" className="rounded-full border border-current/15 bg-white/70 px-4 py-2">Facebook</a>}
        {card.whatsapp && <a href={card.whatsapp} target="_blank" rel="noreferrer" className="rounded-full border border-current/15 bg-white/70 px-4 py-2">WhatsApp</a>}
      </div>

      <button type="button" onClick={downloadContact} className="mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#172538] text-sm font-bold text-white shadow-[0_10px_24px_rgba(20,30,50,0.2)]">
        <Download size={16} />Save contact
      </button>
      <p className="mt-5 break-all text-center text-[8px] leading-tight opacity-45">{publicCardHost}/c/{card.public_code}</p>
    </article>
  </main>
}

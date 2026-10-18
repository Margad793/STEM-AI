'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight, Camera, Check, Download, ExternalLink, Globe2, Hash, LogOut, Mail, Menu, MessageCircle, MoreHorizontal, Phone, QrCode, Save, Settings2, Share2, Sparkles, Upload, UserRound, UsersRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toBlob } from 'html-to-image'
import QRCode from 'qrcode'
import Cropper, { type Area } from 'react-easy-crop'
import type { Session } from '@supabase/supabase-js'
import { AuthScreen } from '@/components/auth-screen'
import { FacebookGlyph, InstagramGlyph, ViberGlyph } from '@/components/social-icons'
import { getCardActionStyle, getCarbonWaveTextureImage, templates, templateSlugs, textures } from '@/lib/card-design'
import type { Profile, Template, Texture } from '@/lib/card-types'
import { fitText } from '@/lib/fit-text'
import { supabase, supabaseConfigured } from '@/lib/supabase-browser'
import { getPublicSiteOrigin } from '@/lib/site'

type Language = 'en' | 'mn'
type CardRow = Omit<Profile, 'photo' | 'companyLogo' | 'roomNumber' | 'businessEmail' | 'personalEmail' | 'showPhone' | 'showBusinessEmail' | 'showPersonalEmail' | 'showRoomNumber' | 'showWebsite' | 'showInstagram' | 'showFacebook' | 'showViber'> & { id: string; public_code: string; is_published: boolean; template: string; texture: Texture; language: Language; user_id: string; photo_url: string; company_logo_url: string; room_number: string; email: string; business_email: string; personal_email: string; show_phone: boolean; show_business_email: boolean; show_personal_email: boolean; show_room_number: boolean; show_website: boolean; show_instagram: boolean; show_facebook: boolean; show_viber: boolean }
const initialProfile: Profile = { name: 'Alex Morgan', title: 'Creative Director', company: 'Northstar Studio', location: 'Brooklyn, NY', bio: 'Building brands with a little more soul. I help ambitious teams turn good ideas into work people remember.', businessEmail: 'alex@northstar.co', personalEmail: '', showPhone: true, showBusinessEmail: true, showPersonalEmail: false, showRoomNumber: true, showWebsite: true, showInstagram: true, showFacebook: true, showViber: true, phone: '+1 917 555 0184', roomNumber: '', website: 'alexmorgan.co', instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', viber: 'viber://chat?number=%2B19175550184', photo: '', companyLogo: '' }
const emptyProfile: Profile = { name: '', title: '', company: '', location: '', bio: '', businessEmail: '', personalEmail: '', showPhone: true, showBusinessEmail: true, showPersonalEmail: true, showRoomNumber: true, showWebsite: true, showInstagram: true, showFacebook: true, showViber: true, phone: '', roomNumber: '', website: '', instagram: '', facebook: '', viber: '', photo: '', companyLogo: '' }
const publicCardOrigin = getPublicSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL)
const publicCardHost = publicCardOrigin.replace(/^https?:\/\//i, '')
const publicCardUrl = (code: string) => `${publicCardOrigin}/c/${encodeURIComponent(code)}`
const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    const details = 'details' in error && typeof error.details === 'string' ? error.details : ''
    const hint = 'hint' in error && typeof error.hint === 'string' ? error.hint : ''
    return [error.message, details, hint].filter(Boolean).join(' ')
  }
  return fallback
}
const getOwnedCardPhotoPath = (photoUrl: string, userId: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  try {
    const photo = new URL(photoUrl)
    const projectOrigin = new URL(supabaseUrl).origin
    const bucketPath = '/storage/v1/object/public/card-photos/'
    if (photo.origin !== projectOrigin || !photo.pathname.startsWith(bucketPath)) return null
    const path = photo.pathname.slice(bucketPath.length).split('/').map(decodeURIComponent).join('/')
    return path.startsWith(`${userId}/`) ? path : null
  } catch {
    return null
  }
}
const googleOAuthEnabled = false
const copy = {
  en: { workspace: 'Workspace', manage: 'Manage', myCard: 'My card', contacts: 'Contacts', analytics: 'Analytics', settings: 'Settings', pro: 'Pro plan', proDesc: 'Unlimited cards and custom domains.', managePlan: 'Manage plan', edit: 'Edit your card', view: 'View card', save: 'Save', saved: 'Saved', profile: 'Your profile', memorable: 'Make it memorable.', personal: 'Personal details', essentials: 'The essentials people need to know.', fullName: 'Full name', jobTitle: 'Job title', company: 'Company', location: 'Location', bio: 'Short bio', contact: 'Contact details', reach: 'Make it easy for people to reach you.', email: 'Email address', phone: 'Phone number', website: 'Website', templates: 'Card style', live: 'Preview', looks: 'How your card looks', tap: 'Tap the card to see contact details', open: 'Open public card', flip: 'Flip card', front: 'Show front', back: 'Contact details', saveContact: 'Save to contacts', saveCardImage: 'Save card image', savingCardImage: 'Preparing image...', cardImageHelp: 'Choose “Save Image” in the share menu to add it to Photos.', cardImageReady: 'Image shared. If you chose Save Image, it is now in Photos.', cardImageDownloaded: 'Image downloaded. Open it and choose Save Image to add it to Photos.', cardImageError: 'Could not create the card image. Please try again.', frontSide: 'Front', backSide: 'Back', call: 'Call now', emailAction: 'Email', digital: 'Digital business card', backEditor: 'Back', scan: 'Scan to connect', changeLanguage: 'Change language', switchToEnglish: 'Would you like to change the website language to English?', switchToMongolian: 'Would you like to change the website language to Mongolian?', yes: 'Yes', no: 'No', cancel: 'Cancel', pattern: 'Pattern & texture', patternDescription: 'Add a subtle surface treatment to your card.', chooseIdentity: 'Choose a polished visual identity for your card.', chooseStyle: 'Choose a visual direction for your card.', socialLinks: 'Social links', instagramUrl: 'Instagram URL', facebookUrl: 'Facebook URL', viberLink: 'Viber link', whatsappLink: 'WhatsApp link', photoPreview: 'Photo preview', profilePhoto: 'Profile photo', changePhoto: 'Change photo', uploadPhoto: 'Upload photo', companyLogo: 'Company logo', uploadCompanyLogo: 'Upload logo', changeCompanyLogo: 'Change logo', remove: 'Remove', photoHint: 'Shows in the circle beside your name on the card.', cropPhoto: 'Crop your photo', cropHint: 'Drag to reposition and slide to zoom, then apply.', zoomPhoto: 'Zoom photo', saving: 'Saving...', applyPhoto: 'Apply photo', tapPublic: 'Tap the card to see contact details' },
  mn: { workspace: 'Ажлын орчин', manage: 'Удирдах', myCard: 'Миний карт', contacts: 'Харилцагчид', analytics: 'Статистик', settings: 'Тохиргоо', pro: 'Pro багц', proDesc: 'Хязгааргүй карт болон өөрийн домэйн ашиглах боломж.', managePlan: 'Багцыг удирдах', edit: 'Картаа засах', view: 'Карт харах', save: 'Хадгалах', saved: 'Хадгаллаа', profile: 'Таны профайл', memorable: 'Мартагдашгүй болгоорой.', personal: 'Хувийн мэдээлэл', essentials: 'Таны тухай мэдэх шаардлагатай үндсэн мэдээлэл.', fullName: 'Овог, нэр', jobTitle: 'Албан тушаал', company: 'Байгууллага', location: 'Байршил', bio: 'Товч танилцуулга', contact: 'Холбоо барих мэдээлэл', reach: 'Тантай холбогдоход хялбар болгоорой.', email: 'Имэйл хаяг', phone: 'Утасны дугаар', website: 'Вэбсайт', templates: 'Картын загвар', live: 'Урьдчилан харах', looks: 'Картын харагдах байдал', tap: 'Холбоо барих мэдээллийг харахын тулд карт дээр товшино уу.', open: 'Нийтийн картыг нээх', flip: 'Карт эргүүлэх', front: 'Нүүрэн талыг харуулах', back: 'Холбоо барих мэдээлэл', saveContact: 'Харилцагчийн жагсаалтад хадгалах', saveCardImage: 'Карт хадгалах', savingCardImage: 'Зураг бэлдэж байна...', cardImageHelp: 'Photos руу хадгалахын тулд хуваалцах цэснээс “Save Image”-ийг сонгоно уу.', cardImageReady: 'Зургийг хуваалцлаа. “Save Image” сонгосон бол Photos-д хадгалагдсан.', cardImageDownloaded: 'Зураг татагдлаа. Photos-д оруулахын тулд зургийг нээгээд Save Image сонгоно уу.', cardImageError: 'Картын зураг үүсгэж чадсангүй. Дахин оролдоно уу.', frontSide: 'Нүүр тал', backSide: 'Ар тал', call: 'Залгах', emailAction: 'Имэйл бичих', digital: 'Дижитал нэрийн хуудас', backEditor: 'Буцах', scan: 'Холбогдохын тулд уншуулна уу', changeLanguage: 'Хэл солих', switchToEnglish: 'Вэбсайтын хэлийг англи хэл рүү өөрчлөх үү?', switchToMongolian: 'Вэбсайтын хэлийг монгол хэл рүү өөрчлөх үү?', yes: 'Тийм', no: 'Үгүй', cancel: 'Болих', pattern: 'Хээ ба гадаргуу', patternDescription: 'Картын гадаргууд нарийн хээ, өнгөлгөө нэмнэ.', chooseIdentity: 'Картаа тохирсон өнгө төрхийг сонгоно уу.', chooseStyle: 'Картаа тохирсон загвар сонгоно уу.', socialLinks: 'Сошиал холбоосууд', instagramUrl: 'Instagram холбоос', facebookUrl: 'Facebook холбоос', viberLink: 'Viber холбоос', whatsappLink: 'WhatsApp холбоос', photoPreview: 'Зургийг урьдчилан харах', profilePhoto: 'Профайл зураг', changePhoto: 'Зураг солих', uploadPhoto: 'Зураг оруулах', companyLogo: 'Компанийн лого', uploadCompanyLogo: 'Лого оруулах', changeCompanyLogo: 'Лого солих', remove: 'Устгах', photoHint: 'Таны нэрийн хажуу дахь дугуй дүрсэнд харагдана.', cropPhoto: 'Зургийг тайрах', cropHint: 'Зургийг чирж байрлалыг тохируулан, томруулж эсвэл жижгэрүүлээд хэрэглэнэ үү.', zoomPhoto: 'Зургийг томруулах', saving: 'Хадгалж байна...', applyPhoto: 'Зураг хэрэглэх', tapPublic: 'Холбоо барих мэдээллийг харахын тулд карт дээр товшино уу.' },
}

export default function Page() {
  const [language, setLanguage] = useState<Language>('en')
  const [languagePreferenceLoaded, setLanguagePreferenceLoaded] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [cardLoading, setCardLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saveNotice, setSaveNotice] = useState('')
  const [savingCard, setSavingCard] = useState(false)
  const [signOutConfirmation, setSignOutConfirmation] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [googleLinking, setGoogleLinking] = useState(false)
  const [cardId, setCardId] = useState<string | null>(null)
  const [publicCode, setPublicCode] = useState<string | null>(null)
  const [savedPhotoUrl, setSavedPhotoUrl] = useState('')
  const [pendingPhotoDeletions, setPendingPhotoDeletions] = useState<string[]>([])
  const [savedCompanyLogoUrl, setSavedCompanyLogoUrl] = useState('')
  const [pendingCompanyLogoDeletions, setPendingCompanyLogoDeletions] = useState<string[]>([])
  const [linkCopied, setLinkCopied] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [selectedTexture, setSelectedTexture] = useState<Texture>('arcs')
  const [publicView, setPublicView] = useState(false)
  const [saved, setSaved] = useState(false)
  const [languageConfirmation, setLanguageConfirmation] = useState<Language | null>(null)
  const [profile, setProfile] = useState(initialProfile)
  const t = copy[language]
  const template = templates[selectedTemplate]
  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('cardly-language')
    if (storedLanguage === 'en' || storedLanguage === 'mn') setLanguage(storedLanguage)
    setLanguagePreferenceLoaded(true)
  }, [])
  useEffect(() => {
    if (languagePreferenceLoaded) window.localStorage.setItem('cardly-language', language)
  }, [language, languagePreferenceLoaded])
  useEffect(() => {
    if (!saveNotice) return
    const timeout = window.setTimeout(() => setSaveNotice(''), 2000)
    return () => window.clearTimeout(timeout)
  }, [saveNotice])
  useEffect(() => {
    if (!saveError) return
    const timeout = window.setTimeout(() => setSaveError(''), 6000)
    return () => window.clearTimeout(timeout)
  }, [saveError])

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      setCardLoading(false)
      return
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession)
        setAuthLoading(false)
        setAuthError('')
      }
    })
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setAuthError(error.message)
      setSession(data.session)
      setAuthLoading(false)
    }).catch((error: unknown) => {
      if (active) {
        setAuthError(error instanceof Error ? error.message : 'Unable to check your sign-in status.')
        setAuthLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session || !supabase) {
      setAccessChecked(true)
      setHasAccess(false)
      return
    }

    let active = true
    setAccessChecked(false)
    setAuthError('')
    void (async () => {
      try {
        const { data, error } = await supabase.from('cardly_access').select('user_id').eq('user_id', session.user.id).maybeSingle()
        if (error) throw error
        if (active) setHasAccess(Boolean(data))
      } catch (error) {
        if (active) {
          setAuthError(error instanceof Error ? error.message : 'Unable to verify account access.')
          setHasAccess(false)
        }
      } finally {
        if (active) setAccessChecked(true)
      }
    })()

    return () => {
      active = false
    }
  }, [session?.user.id])

  useEffect(() => {
    if (!session || !supabase || !hasAccess) {
      setCardLoading(false)
      return
    }

    let active = true
    setCardLoading(true)
    setSaveError('')
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('id, user_id, public_code, is_published, name, title, company, company_logo_url, location, bio, email, business_email, personal_email, show_phone, show_business_email, show_personal_email, show_room_number, show_website, show_instagram, show_facebook, show_viber, phone, room_number, website, instagram, facebook, viber, photo_url, template, texture, language')
          .eq('user_id', session.user.id)
          .maybeSingle()
        if (!active) return
        if (error) throw error
        if (data) {
          const row = data as CardRow
          setCardId(row.id)
          setPublicCode(row.public_code)
          setSavedPhotoUrl(row.photo_url)
          setPendingPhotoDeletions([])
          setSavedCompanyLogoUrl(row.company_logo_url ?? '')
          setPendingCompanyLogoDeletions([])
          setProfile({
            name: row.name,
            title: row.title,
            company: row.company,
            location: row.location,
            bio: row.bio,
            businessEmail: row.business_email || row.email || '',
            personalEmail: row.personal_email ?? '',
            showPhone: row.show_phone ?? true,
            showBusinessEmail: row.show_business_email ?? true,
            showPersonalEmail: (row.show_personal_email ?? true) && !(row.show_business_email ?? true),
            showRoomNumber: row.show_room_number ?? true,
            showWebsite: row.show_website ?? true,
            showInstagram: row.show_instagram ?? true,
            showFacebook: row.show_facebook ?? true,
            showViber: row.show_viber ?? true,
            phone: row.phone,
            roomNumber: row.room_number ?? '',
            website: row.website,
            instagram: row.instagram,
            facebook: row.facebook,
            viber: row.viber,
            photo: row.photo_url,
            companyLogo: row.company_logo_url ?? '',
          })
          const templateIndex = templateSlugs.indexOf(row.template)
          setSelectedTemplate(templateIndex < 0 ? 0 : templateIndex)
          setSelectedTexture(row.texture)
        } else {
          setCardId(null)
          setPublicCode(null)
          setSavedPhotoUrl('')
          setPendingPhotoDeletions([])
          setSavedCompanyLogoUrl('')
          setPendingCompanyLogoDeletions([])
          setProfile({ ...emptyProfile, businessEmail: session.user.email ?? '' })
          setSelectedTemplate(0)
          setSelectedTexture('arcs')
        }
      } catch (error) {
        if (active) setSaveError(error instanceof Error ? error.message : 'Unable to load your card.')
      } finally {
        if (active) setCardLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [session?.user.id, hasAccess])

  const requestLanguageChange = (nextLanguage: Language) => {
    if (nextLanguage !== language) setLanguageConfirmation(nextLanguage)
  }
  const update = (key: keyof Profile) => (value: string) => setProfile((current) => ({ ...current, [key]: value }))
  const saveCard = async () => {
    if (!supabase || !session || savingCard) return
    setSavingCard(true)
    setSaved(false)
    setSaveError('')
    setSaveNotice('')

    const uploadedImagePaths: string[] = []
    try {
      const uploadImage = async (dataUrl: string, label: string) => {
        const imageBlob = await (await fetch(dataUrl)).blob()
        if (imageBlob.size > 5 * 1024 * 1024) throw new Error(`${label} must be 5 MB or smaller.`)
        const extension = imageBlob.type === 'image/png' ? 'png' : imageBlob.type === 'image/webp' ? 'webp' : 'jpg'
        const imagePath = `${session.user.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('card-photos').upload(imagePath, imageBlob, {
          contentType: imageBlob.type || 'image/jpeg',
          upsert: false,
        })
        if (uploadError) throw uploadError
        uploadedImagePaths.push(imagePath)
        return supabase.storage.from('card-photos').getPublicUrl(imagePath).data.publicUrl
      }
      const photoUrl = profile.photo.startsWith('data:') ? await uploadImage(profile.photo, 'Profile photo') : profile.photo
      const companyLogoUrl = profile.companyLogo.startsWith('data:') ? await uploadImage(profile.companyLogo, 'Company logo') : profile.companyLogo

      const values = {
        name: profile.name,
        title: profile.title,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        email: profile.businessEmail,
        business_email: profile.businessEmail,
        personal_email: profile.personalEmail,
        show_phone: profile.showPhone,
        show_business_email: profile.showBusinessEmail,
        show_personal_email: profile.showPersonalEmail,
        show_room_number: profile.showRoomNumber,
        show_website: profile.showWebsite,
        show_instagram: profile.showInstagram,
        show_facebook: profile.showFacebook,
        show_viber: profile.showViber,
        phone: profile.phone,
        room_number: profile.roomNumber,
        website: profile.website,
        instagram: profile.instagram,
        facebook: profile.facebook,
        viber: profile.viber,
        photo_url: photoUrl,
        company_logo_url: companyLogoUrl,
        template: templateSlugs[selectedTemplate],
        texture: selectedTexture,
        language,
        is_published: true,
      }
      const result = cardId
        ? await supabase.from('cards').update(values).eq('id', cardId).select('id, public_code').single()
        : await supabase.from('cards').insert({ ...values, user_id: session.user.id }).select('id, public_code').single()
      if (result.error) throw result.error

      setCardId(result.data.id)
      setPublicCode(result.data.public_code)
      if (photoUrl !== profile.photo) update('photo')(photoUrl)
      if (companyLogoUrl !== profile.companyLogo) update('companyLogo')(companyLogoUrl)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 1800)
      setSaveNotice(language === 'en' ? 'Your card was saved.' : 'Таны карт амжилттай хадгалагдлаа.')
      const previousPhotoPath = getOwnedCardPhotoPath(savedPhotoUrl, session.user.id)
      const previousCompanyLogoPath = getOwnedCardPhotoPath(savedCompanyLogoUrl, session.user.id)
      const pathsToDelete = [...new Set([
        ...pendingPhotoDeletions,
        ...pendingCompanyLogoDeletions,
        ...(savedPhotoUrl !== photoUrl && previousPhotoPath && !uploadedImagePaths.includes(previousPhotoPath) ? [previousPhotoPath] : []),
        ...(savedCompanyLogoUrl !== companyLogoUrl && previousCompanyLogoPath && !uploadedImagePaths.includes(previousCompanyLogoPath) ? [previousCompanyLogoPath] : []),
      ])]
      if (pathsToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage.from('card-photos').remove(pathsToDelete)
        if (deleteError) {
          const photoPaths = pathsToDelete.filter((path) => path === previousPhotoPath || pendingPhotoDeletions.includes(path))
          const logoPaths = pathsToDelete.filter((path) => path === previousCompanyLogoPath || pendingCompanyLogoDeletions.includes(path))
          setPendingPhotoDeletions(photoPaths)
          setPendingCompanyLogoDeletions(logoPaths)
          setSaveError(`Card saved, but previous image cleanup failed: ${deleteError.message}`)
        } else {
          setPendingPhotoDeletions([])
          setPendingCompanyLogoDeletions([])
        }
      } else if ((savedPhotoUrl && savedPhotoUrl !== photoUrl && !previousPhotoPath) || (savedCompanyLogoUrl && savedCompanyLogoUrl !== companyLogoUrl && !previousCompanyLogoPath)) {
        setSaveError('Card saved, but a previous image URL is not a managed card-photos file and could not be deleted automatically.')
      }
      setSavedPhotoUrl(photoUrl)
      setSavedCompanyLogoUrl(companyLogoUrl)
    } catch (error) {
      const detail = getErrorMessage(error, 'Unable to save your card.')
      if (uploadedImagePaths.length > 0) {
        const { error: cleanupError } = await supabase.storage.from('card-photos').remove(uploadedImagePaths)
        if (cleanupError) {
          setSaveError(`${detail} Newly uploaded images could not be cleaned up: ${cleanupError.message}`)
          return
        }
      }
      setSaveError(detail)
    } finally {
      setSavingCard(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    setSigningOut(true)
    setAuthError('')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setSignOutConfirmation(false)
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Unable to sign out.'))
    } finally {
      setSigningOut(false)
    }
  }

  const connectGoogle = async () => {
    if (!supabase) return
    setGoogleLinking(true)
    setSaveError('')
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to connect your Google account.')
      setGoogleLinking(false)
    }
  }

  if (authLoading || (session && (!accessChecked || (hasAccess && cardLoading)))) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-sm text-[#52606f]">{language === 'en' ? 'Loading your account...' : 'Бүртгэлийг ачаалж байна...'}</main>
  if (!session || !supabaseConfigured) return <AuthScreen language={language} onLanguageChange={setLanguage} />
  if (!hasAccess) return <AuthScreen language={language} onLanguageChange={setLanguage} session={session} accessError={authError} />
  if (publicView) return <PublicCard language={language} t={t} onBack={() => setPublicView(false)} template={template} profile={profile} texture={selectedTexture} publicCode={publicCode} />
  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f8fa] text-[#18202d]">
      {saveNotice && (
        <div
          role="status"
          className="pointer-events-none fixed left-1/2 top-1/2 z-[70] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-900 shadow-lg"
        >
          {saveNotice}
        </div>
      )}
      {signOutConfirmation && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#101828]/45 p-4"
          role="presentation"
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            aria-describedby="sign-out-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="sign-out-title" className="text-lg font-semibold">
              {language === "en" ? "Sign out?" : "Гарах уу?"}
            </h2>
            <p
              id="sign-out-description"
              className="mt-2 text-sm leading-relaxed text-[#52606f]"
            >
              {language === "en"
                ? "Are you sure you want to sign out?"
                : "Та бүртгэлээсээ гарахдаа итгэлтэй байна уу?"}
            </p>
            {authError && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-relaxed text-red-800"
              >
                {authError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSignOutConfirmation(false)}
                disabled={signingOut}
                className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-semibold text-[#52606f] disabled:opacity-60"
              >
                {language === "en" ? "Cancel" : "Болих"}
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={signingOut}
                className="rounded-lg bg-[#172538] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {signingOut
                  ? language === "en"
                    ? "Signing out..."
                    : "Гарч байна..."
                  : language === "en"
                    ? "Sign out"
                    : "Гарах"}
              </button>
            </div>
          </section>
        </div>
      )}
      <header className="fixed inset-x-0 top-0 z-50 flex min-w-0 h-[76px] items-center justify-between gap-2 overflow-hidden border-b border-[#e7e9ee] bg-white/95 px-3 shadow-[0_1px_8px_rgba(24,32,45,0.04)] backdrop-blur sm:px-9">
        <div className="flex min-w-0 shrink items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f7f4ed]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_gbudftgbudftgbud-6IOh1Fmz2F5ytWKVOX16A263gpQwEa.jpg"
              alt="Cardliy logo"
              className="size-full object-cover"
            />
          </div>
          <div>
            <p className="font-serif text-[18px] font-medium italic tracking-[-0.045em] text-[#18202d]">
              Cardliy
            </p>
          </div>
        </div>
        <div className="flex min-w-0 shrink items-center gap-1.5">
          <div className="flex rounded-full border border-[#dfe3e8] bg-[#eef1f4] p-0.5 shadow-inner">
            <button
              onClick={() => requestLanguageChange("en")}
              className={`rounded-full px-2 py-1 text-[10px] font-bold transition-all duration-200 ${language === "en" ? "bg-[#172538] text-white shadow-sm" : "text-[#8994a2] hover:text-[#52606f]"}`}
            >
              EN
            </button>
            <button
              onClick={() => requestLanguageChange("mn")}
              className={`rounded-full px-2 py-1 text-[10px] font-bold transition-all duration-200 ${language === "mn" ? "bg-[#172538] text-white shadow-sm" : "text-[#8994a2] hover:text-[#52606f]"}`}
            >
              MN
            </button>
          </div>
          <button
            onClick={() => setPublicView(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 py-2 text-xs font-semibold text-[#52606f] transition hover:bg-[#f7f8fa]"
          >
            <ExternalLink size={17} strokeWidth={2.2} />{" "}
            <span className="hidden min-[381px]:inline">{t.view}</span>
          </button>
          {googleOAuthEnabled &&
            !session.user.identities?.some(
              (identity) => identity.provider === "google",
            ) && (
              <button
                type="button"
                onClick={connectGoogle}
                disabled={googleLinking}
                aria-label={
                  language === "en"
                    ? "Connect Google account"
                    : "Google хаяг холбох"
                }
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#dfe3e8] bg-white px-2.5 py-2 text-xs font-semibold text-[#52606f] transition hover:bg-[#f7f8fa] disabled:opacity-60"
              >
                <span className="font-bold text-base text-[#4285f4]">G</span>
                <span className="hidden min-[520px]:inline">
                  {googleLinking
                    ? language === "en"
                      ? "Connecting..."
                      : "Холбож байна..."
                    : language === "en"
                      ? "Connect Google"
                      : "Google холбох"}
                </span>
              </button>
            )}
          <button
            type="button"
            onClick={() => setSignOutConfirmation(true)}
            aria-label={language === "en" ? "Sign out" : "Гарах"}
            title={language === "en" ? "Sign out" : "Гарах"}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-2.5 py-2 text-xs font-semibold text-[#52606f] transition hover:bg-[#f7f8fa]"
          >
            <LogOut size={16} />
            <span className="hidden min-[460px]:inline">
              {language === "en" ? "Sign out" : "Гарах"}
            </span>
          </button>
        </div>
      </header>
      {(saveError || authError) && (
        <div
          role="alert"
          className="fixed left-1/2 top-[84px] z-40 w-[min(92vw,600px)] -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg"
        >
          {saveError || authError}
        </div>
      )}
      {publicCode && (
        <section className="mx-auto mt-[88px] flex max-w-[1380px] flex-nowrap items-center gap-2 rounded-xl border border-[#dfe3e8] bg-white px-3 py-3 shadow-sm sm:mx-9 sm:gap-3 sm:px-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#52606f] sm:text-xs">
              {language === "en" ? "Card link" : "Картын холбоос"}
            </p>
            <a
              href={publicCardUrl(publicCode)}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs text-[#5169b7] underline sm:text-sm"
            >
              {publicCardUrl(publicCode)}
            </a>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard
                  .writeText(publicCardUrl(publicCode))
                  .then(() => {
                    setLinkCopied(true);
                    window.setTimeout(() => setLinkCopied(false), 1600);
                  })
                  .catch((error: unknown) =>
                    setSaveError(
                      error instanceof Error
                        ? error.message
                        : "Could not copy the link.",
                    ),
                  );
              }}
              className="flex h-9 w-[92px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#dfe3e8] px-1.5 text-[10px] font-semibold text-[#52606f] sm:h-auto sm:w-auto sm:px-3 sm:py-2 sm:text-xs"
            >
              {linkCopied
                ? language === "en"
                  ? "Copied"
                  : "Хууллаа"
                : language === "en"
                  ? "Copy link"
                  : "Хуулах"}
            </button>
          </div>
        </section>
      )}
      {languageConfirmation && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101828]/45 p-4"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-dialog-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2
              id="language-dialog-title"
              className="text-lg font-semibold text-[#18202d]"
            >
              {t.changeLanguage}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#52606f]">
              {languageConfirmation === "mn"
                ? t.switchToMongolian
                : t.switchToEnglish}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLanguageConfirmation(null)}
                className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-semibold text-[#52606f] hover:bg-[#f7f8fa]"
              >
                {t.no}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage(languageConfirmation);
                  setLanguageConfirmation(null);
                }}
                className="rounded-lg bg-[#172538] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24354b]"
              >
                {t.yes}
              </button>
            </div>
          </section>
        </div>
      )}
      <div
        className={`mx-auto grid w-full min-w-0 max-w-[1450px] grid-cols-1 gap-8 p-3 ${publicCode ? "pt-4" : "pt-[92px]"} sm:p-9 ${publicCode ? "sm:pt-6" : "sm:pt-[108px]"} xl:grid-cols-[minmax(420px,1fr)_390px]`}
      >
        <section className="min-w-0">
          <div className="mb-7 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium text-[#8c96a3]">
                {t.profile}
              </p>
              <h2 className="text-[25px] font-semibold tracking-[-0.045em]">
                {t.memorable}
              </h2>
            </div>
            <Button
              onClick={saveCard}
              disabled={savingCard}
              className="flex shrink-0 h-9 gap-2 rounded-lg bg-[#172538] px-4 text-xs hover:bg-[#24354b] sm:flex"
            >
              <Save size={14} />{" "}
              {savingCard ? t.saving : saved ? t.saved : t.save}
            </Button>
          </div>
          <div className="flex flex-col gap-5">
            <section className="order-5 rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-7">
              <SectionHeader
                icon={Sparkles}
                title={t.pattern}
                description={t.patternDescription}
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="contents">
                  {textures.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTexture(item.id)}
                      aria-pressed={selectedTexture === item.id}
                      className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-[#9cadd0] ${selectedTexture === item.id ? "border-[#6d82bf] bg-[#f6f8fc] ring-2 ring-[#e5eafa]" : "border-[#e5e8ec] bg-white"}`}
                    >
                      <div
                        style={item.id === 'carbon-wave' ? { backgroundImage: getCarbonWaveTextureImage('Luxury Dark & Gold') } : undefined}
                        className={`mb-3 h-16 rounded-lg ${item.id === "holographic" ? "bg-[linear-gradient(120deg,#ef8db8,#82d8db,#f8dc87)]" : item.id === "arcs" ? "bg-[#e9edf4] [background-image:radial-gradient(circle_at_90%_0%,transparent_0_28px,#93a5c6_29px_33px,transparent_34px),radial-gradient(circle_at_10%_100%,transparent_0_24px,#b8c5da_25px_29px,transparent_30px)]" : item.id === "matte" ? "bg-[#e9e5df]" : item.id === "carbon-wave" ? "bg-[#202832]" : "bg-[repeating-linear-gradient(115deg,#3d4650_0_2px,#67727d_2px_4px,#252d35_4px_7px)]"}`}
                      />
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[#263343]">
                          {language === "en" ? item.name : item.mnName}
                        </span>
                        <span
                          className={`size-3 rounded-full ${item.id === "holographic" ? "bg-gradient-to-br from-pink-400 via-cyan-300 to-amber-300" : item.id === "arcs" ? "border-2 border-[#60749d]" : item.id === "matte" ? "bg-[#d9dee6]" : "bg-gradient-to-r from-[#67717d] to-[#222a33]"}`}
                        />
                      </div>
                      <p className="text-xs leading-relaxed text-[#8c96a3]">
                        {language === "en"
                          ? item.description
                          : item.mnDescription}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section className="hidden rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <SectionHeader
                  icon={PaletteIcon}
                  title={t.templates}
                  description={t.chooseIdentity}
                />
                <span className="rounded-full bg-[#f0f3f8] px-2.5 py-1 text-[10px] font-bold text-[#60749d]">
                  {selectedTemplate + 1}/5
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="contents">
                  {templates.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedTemplate(index)}
                      aria-pressed={selectedTemplate === index}
                      className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${selectedTemplate === index ? "border-[#6d82bf] bg-[#f6f8fc] ring-2 ring-[#e5eafa]" : "border-[#e5e8ec] bg-white hover:border-[#bdc7d8]"}`}
                    >
                      <div
                        className={`relative mb-3 aspect-[1.7] overflow-hidden rounded-lg ${item.preview} p-3 shadow-sm`}
                      >
                        <span className="absolute -right-3 -top-5 size-16 rounded-full border-[8px] border-white/20" />
                        <span
                          className="relative block max-w-[80%] truncate text-[9px] font-bold tracking-[0.12em]"
                          style={{ color: item.accent }}
                        >
                          {profile.company.toUpperCase()}
                        </span>
                        <span
                          className={`relative mt-5 block truncate text-sm font-semibold ${item.ink}`}
                        >
                          {profile.name.toUpperCase()}
                        </span>
                        <span
                          className={`relative block truncate text-[8px] opacity-70 ${item.ink}`}
                        >
                          {profile.title}
                        </span>
                      </div>
                      <span className="block truncate text-xs font-bold text-[#263343]">
                        {language === "en" ? item.name : item.mnName}
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-[#8c96a3]">
                        {language === "en"
                          ? item.description
                          : item.mnDescription}
                      </span>
                      {selectedTemplate === index && (
                        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[#172538] text-white">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-7">
              <SectionHeader
                icon={UserRound}
                title={t.personal}
                description={t.essentials}
              />
              <PhotoField profile={profile} update={update} t={t} />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label={t.fullName}
                  value={profile.name}
                  onChange={update("name")}
                />
                <Field
                  label={t.jobTitle}
                  value={profile.title}
                  onChange={update("title")}
                />
                <Field
                  label={t.company}
                  value={profile.company}
                  onChange={update("company")}
                />
                <Field
                  label={t.location}
                  value={profile.location}
                  onChange={update("location")}
                />
              </div>
              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-[#4b5868]">
                  {t.bio}
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => update("bio")(e.target.value)}
                  className="min-h-[92px] w-full resize-none rounded-xl border border-[#e1e5ea] bg-[#fbfcfd] px-3.5 py-3 text-sm leading-6 text-[#263343] outline-none transition focus:border-[#93a4cb] focus:ring-3 focus:ring-[#e9edfa]"
                />
              </div>
            </section>
            <section className="rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-7">
              <SectionHeader
                icon={Phone}
                title={t.contact}
                description={t.reach}
              />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label={language === "en" ? "Business email" : "Ажлын имэйл"}
                  value={profile.businessEmail}
                  onChange={update("businessEmail")}
                  icon={Mail}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show business email" : "Ажлын имэйлийг харуулах"}
                      enabled={profile.showBusinessEmail}
                      onChange={(showBusinessEmail) =>
                        setProfile((current) => ({
                          ...current,
                          showBusinessEmail,
                          showPersonalEmail: showBusinessEmail ? false : current.showPersonalEmail,
                        }))
                      }
                    />
                  }
                />
                <Field
                  label={language === "en" ? "Personal email" : "Хувийн имэйл"}
                  value={profile.personalEmail}
                  onChange={update("personalEmail")}
                  icon={Mail}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show personal email" : "Хувийн имэйлийг харуулах"}
                      enabled={profile.showPersonalEmail}
                      onChange={(showPersonalEmail) =>
                        setProfile((current) => ({
                          ...current,
                          showPersonalEmail,
                          showBusinessEmail: showPersonalEmail ? false : current.showBusinessEmail,
                        }))
                      }
                    />
                  }
                />
                <Field
                  label={t.phone}
                  value={profile.phone}
                  onChange={update("phone")}
                  icon={Phone}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show phone number" : "Утасны дугаарыг харуулах"}
                      enabled={profile.showPhone}
                      onChange={(showPhone) => setProfile((current) => ({ ...current, showPhone }))}
                    />
                  }
                />
                <Field
                  label={language === "en" ? "Room number" : "Өрөөний дугаар"}
                  value={profile.roomNumber}
                  onChange={update("roomNumber")}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show room number" : "Өрөөний дугаарыг харуулах"}
                      enabled={profile.showRoomNumber}
                      onChange={(showRoomNumber) => setProfile((current) => ({ ...current, showRoomNumber }))}
                    />
                  }
                />
                <Field
                  label={t.website}
                  value={profile.website}
                  onChange={update("website")}
                  icon={Globe2}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show website" : "Вэбсайтыг харуулах"}
                      enabled={profile.showWebsite}
                      onChange={(showWebsite) => setProfile((current) => ({ ...current, showWebsite }))}
                    />
                  }
                />
                <Field
                  label={t.instagramUrl}
                  value={profile.instagram}
                  onChange={update("instagram")}
                  icon={InstagramGlyph}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show Instagram" : "Instagram холбоосыг харуулах"}
                      enabled={profile.showInstagram}
                      onChange={(showInstagram) => setProfile((current) => ({ ...current, showInstagram }))}
                    />
                  }
                />
                <Field
                  label={t.viberLink}
                  value={profile.viber}
                  onChange={update("viber")}
                  icon={MessageCircle}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show Viber" : "Viber холбоосыг харуулах"}
                      enabled={profile.showViber}
                      onChange={(showViber) => setProfile((current) => ({ ...current, showViber }))}
                    />
                  }
                />
                <Field
                  label={t.facebookUrl}
                  value={profile.facebook}
                  onChange={update("facebook")}
                  icon={FacebookGlyph}
                  control={
                    <VisibilityToggle
                      label={language === "en" ? "Show Facebook" : "Facebook холбоосыг харуулах"}
                      enabled={profile.showFacebook}
                      onChange={(showFacebook) => setProfile((current) => ({ ...current, showFacebook }))}
                    />
                  }
                />
              </div>
            </section>
            <section className="rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-7">
              <SectionHeader
                icon={PaletteIcon}
                title={t.templates}
                description={t.chooseStyle}
              />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {templates.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedTemplate(index)}
                    className={`rounded-xl border p-2 text-left transition ${selectedTemplate === index ? "border-[#7186c2] ring-2 ring-[#e9edfa]" : "border-[#e5e8ec]"}`}
                  >
                    <div className={`h-16 rounded-lg ${item.background}`} />
                    <p className="mt-2 truncate text-[11px] font-semibold">
                      {language === "en" ? item.name : item.mnName}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>
        <PreviewPanel
          texture={selectedTexture}
          t={t}
          template={template}
          profile={profile}
          language={language}
          publicCode={publicCode}
        />
      </div>
    </main>
  );
}

function downloadVCard(profile: Profile) {
  const website = profile.website.trim()
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `ORG:${profile.company}`,
    `TITLE:${profile.title}`,
    ...(profile.showPhone && profile.phone.trim() ? [`TEL;TYPE=CELL:${profile.phone}`] : []),
    ...(profile.showBusinessEmail && profile.businessEmail.trim() ? [`EMAIL;TYPE=WORK:${profile.businessEmail}`] : []),
    ...(profile.showPersonalEmail && profile.personalEmail.trim() ? [`EMAIL;TYPE=HOME:${profile.personalEmail}`] : []),
    ...(profile.showWebsite && website ? [`URL:${/^https?:\/\//i.test(website) ? website : `https://${website}`}`] : []),
    ...(profile.showRoomNumber && (profile.roomNumber || profile.location) ? [`ADR;TYPE=WORK:;;${profile.roomNumber};${profile.location}`] : profile.location ? [`ADR;TYPE=WORK:;;;${profile.location}`] : []),
    'END:VCARD',
  ].join('\r\n')
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${profile.name.replace(/\s+/g, '-')}.vcf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect
function PhotoField({ profile, update, t }: { profile: Profile; update: (key: keyof Profile) => (value: string) => void; t: typeof copy.en }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [working, setWorking] = useState(false)
  const close = () => {
    setPending('')
    setArea(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }
  const apply = async () => {
    if (!pending || !area || working) return
    setWorking(true)
    try {
      update('photo')(await cropToDataUrl(pending, area))
      close()
    } catch {
      setError('Could not crop that image - please try another one.')
      close()
    } finally {
      setWorking(false)
    }
  }
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG or JPG).')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be smaller than 8 MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      close()
      setPending(String(reader.result || ''))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border-2 border-dashed border-[#d9dee6] bg-[#fbfcfd] p-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e1e5ea] bg-[#eef1f4] text-base font-semibold text-[#8996a3]">
          {profile.photo ? <img src={profile.photo} alt={t.photoPreview} className="size-full object-cover" /> : profile.name.split(' ').map((n) => n[0]).join('').slice(0, 3).toUpperCase() || '?'}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          <div>
            <p className="text-xs font-semibold text-[#4b5868]">{t.profilePhoto}</p>
            <p className="mt-0.5 text-xs text-[#8c96a3]">{t.photoHint}</p>
          </div>
          <div className="flex w-full min-w-0 flex-nowrap gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} aria-label={profile.photo ? t.changePhoto : t.uploadPhoto} className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-[#172538] px-1.5 text-[10px] font-semibold whitespace-nowrap text-white shadow-[0_2px_8px_rgba(23,37,56,0.25)] transition hover:bg-[#24354b] sm:gap-2 sm:px-4 sm:text-xs">
              <Upload size={14} className="shrink-0" />
              <span className="min-w-0 truncate">{profile.photo ? (t.changePhoto === 'Change photo' ? 'Change' : 'Солих') : t.uploadPhoto}</span>
            </button>
            {profile.photo && <button type="button" onClick={() => update('photo')('')} className="h-9 min-w-0 flex-1 truncate rounded-lg border border-[#dfe3e8] bg-white px-1.5 text-[10px] font-semibold whitespace-nowrap text-[#52606f] transition hover:bg-[#f7f8fa] sm:px-4 sm:text-xs">{t.remove}</button>}
          </div>
          {error && <p className="text-xs font-semibold text-[#c2413a]">{error}</p>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
        </div>
      </div>
      <CompanyLogoField profile={profile} update={update} t={t} />
      {pending && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-[360px] rounded-2xl bg-white p-4 shadow-2xl">
          <p className="text-sm font-semibold text-[#263343]">{t.cropPhoto}</p>
          <p className="mt-1 text-xs text-[#8c96a3]">{t.cropHint}</p>
          <div className="relative mt-3 h-[260px] w-full overflow-hidden rounded-xl bg-[#141c28]">
            <Cropper image={pending} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, cropped) => setArea(cropped)} />
          </div>
          <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label={t.zoomPhoto} className="mt-3 w-full accent-[#172538]" />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={close} className="h-9 max-w-full rounded-lg border border-[#dfe3e8] bg-white px-2.5 text-[11px] font-semibold text-[#52606f] transition hover:bg-[#f7f8fa] sm:px-4 sm:text-xs">{t.cancel}</button>
            <button type="button" onClick={apply} disabled={!area || working} className="h-9 rounded-lg bg-[#172538] px-4 text-xs font-semibold text-white transition hover:bg-[#24354b] disabled:cursor-not-allowed disabled:opacity-60">{working ? t.saving : t.applyPhoto}</button>
          </div>
        </div>
      </div>}
    </>
  )
}

function CompanyLogoField({
  profile,
  update,
  t,
}: {
  profile: Profile
  update: (key: keyof Profile) => (value: string) => void
  t: typeof copy.en
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Company logos must be 5 MB or smaller.')
      return
    }
    setError('')
    event.target.value = ''
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('Could not read that image.'))
        reader.readAsDataURL(file)
      })
      update('companyLogo')(await compressCompanyLogo(dataUrl))
    } catch {
      setError('Could not process that image. Please try another file.')
    }
  }

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#e5e8ec] bg-white p-3">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e1e5ea] bg-[#eef1f4] text-[#8996a3]">
        {profile.companyLogo ? (
          <img src={profile.companyLogo} alt={t.companyLogo} className="size-full object-cover" />
        ) : (
          <Camera size={18} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#4b5868]">{t.companyLogo}</p>
        <p className="mt-0.5 text-xs text-[#8c96a3]">{t === copy.en ? 'Shown in the round mark on your card.' : 'Картын дугуй тэмдэгт харагдана.'}</p>
        <div className="mt-2 flex w-full min-w-0 flex-nowrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} aria-label={profile.companyLogo ? t.changeCompanyLogo : t.uploadCompanyLogo} className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-[#172538] px-1.5 text-[10px] font-semibold whitespace-nowrap text-white shadow-[0_2px_8px_rgba(23,37,56,0.25)] transition hover:bg-[#24354b] sm:gap-2 sm:px-4 sm:text-xs">
            <Upload size={14} className="shrink-0" />
            <span className="min-w-0 truncate">{profile.companyLogo ? (t === copy.en ? 'Change' : 'Солих') : (t === copy.en ? 'Upload' : 'Оруулах')}</span>
          </button>
          {profile.companyLogo && <button type="button" onClick={() => update('companyLogo')('')} className="h-9 min-w-0 flex-1 truncate rounded-lg border border-[#dfe3e8] bg-white px-1.5 text-[10px] font-semibold whitespace-nowrap text-[#52606f] transition hover:bg-[#f7f8fa] sm:px-4 sm:text-xs">{t.remove}</button>}
        </div>
        {error && <p role="alert" className="mt-2 text-xs font-semibold text-[#c2413a]">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  )
}

async function compressCompanyLogo(src: string): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('Could not load the company logo.'))
    element.src = src
  })
  const maxDimension = 512
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare the company logo.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const compressed = canvas.toDataURL('image/webp', 0.9)
  return compressed.startsWith('data:image/webp,') ? compressed : canvas.toDataURL('image/png')
}

async function cropToDataUrl(src: string, area: { x: number; y: number; width: number; height: number }): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
  const outputSize = 384
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx || area.width <= 0 || area.height <= 0) throw new Error('Could not prepare the cropped photo.')
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, outputSize, outputSize)
  return canvas.toDataURL('image/jpeg', 0.82)
}
function CardQR({ url }: { url: string }) { const [svg, setSvg] = useState(''); useEffect(() => { let alive = true; QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#172538ff', light: '#ffffffff' } }).then((result) => { if (alive) setSvg(result) }).catch(() => { if (alive) setSvg('') }); return () => { alive = false } }, [url]); return <div data-qr="1" className="size-[calc(48*var(--u))] shrink-0 overflow-hidden rounded-[calc(6*var(--u))] bg-white p-[calc(3*var(--u))] [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} /> }
function PaletteIcon(props: React.SVGProps<SVGSVGElement>) { return <Camera {...props} /> }
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>
function NavItem({ icon: Icon, label, active = false }: { icon: IconComponent; label: string; active?: boolean }) { return <button className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${active ? 'bg-[#edf1fa] text-[#5169b7]' : 'text-[#788392] hover:bg-[#f7f8fa]'}`}><Icon size={16} />{label}{active && <span className="ml-auto size-1.5 rounded-full bg-[#6278bd]" />}</button> }
function SectionHeader({ icon: Icon, title, description }: { icon: IconComponent; title: string; description: string }) { return <div className="flex items-start gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-[#f0f3f8] text-[#60749d]"><Icon size={15} /></div><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-[#8c96a3]">{description}</p></div></div> }
function Field({ label, value, onChange, icon: Icon, control }: { label: React.ReactNode; value: string; onChange: (value: string) => void; icon?: IconComponent; control?: React.ReactNode }) {
  const inputId = useId()
  return <div className="block"><div className="mb-2 flex min-h-5 items-center justify-between gap-2"><label htmlFor={inputId} className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#4b5868]">{label}</label>{control}</div><div className="relative">{Icon && <Icon size={15} className="absolute left-3.5 top-3.5 text-[#9aa4af]" />}<input id={inputId} value={value} onChange={(event) => onChange(event.target.value)} className={`h-11 w-full rounded-xl border-2 border-[#d9dee6] bg-[#fbfcfd] text-sm text-[#263343] outline-none transition focus:border-[#93a4cb] focus:ring-3 focus:ring-[#e9edfa] ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'}`} /></div></div>
}
function VisibilityToggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      title={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6278bd]/40 focus-visible:ring-offset-2 ${
        enabled ? 'bg-[#6278bd]' : 'bg-[#cbd2dc]'
      }`}
    >
      <span
        className={`size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.28)] transition-transform duration-200 ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function CardFace({
  back = false,
  template,
  profile,
  t,
  texture = "arcs",
  publicCode,
  exportMode = false,
}: {
  back?: boolean;
  template: Template;
  profile: Profile;
  t: typeof copy.en;
  texture?: Texture;
  publicCode: string | null;
  exportMode?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fit = () =>
      root
        .querySelectorAll<HTMLElement>("[data-fit]")
        .forEach((el) => fitText(el, Number(el.dataset.fit) || 1));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
  }, [back, profile, template.name]);
  return (
    <div
      ref={rootRef}
      style={{
        backfaceVisibility: exportMode ? "visible" : "hidden",
        WebkitBackfaceVisibility: exportMode ? "visible" : "hidden",
        transformOrigin: "center",
        transform: exportMode ? "none" : back ? "rotateY(180deg)" : "rotateY(0deg)",
        color: template.textColor,
        textShadow:
          texture === "arcs" && template.name === "Creative Glass"
            ? "0 1px 3px rgba(24,14,38,.9), 0 0 2px rgba(255,255,255,.35)"
            : texture === "metal" && template.name === "Soft Feminine Pastel"
              ? "0 1px 2px rgba(255,255,255,.8), 0 0 1px rgba(100,45,70,.28)"
              : texture === "metal" && template.name === "Creative Glass"
                ? "0 1px 2px rgba(25,12,55,.85), 0 0 1px rgba(255,255,255,.7)"
                : undefined,
        backgroundImage:
          texture === "carbon-wave"
            ? getCarbonWaveTextureImage(template.name)
            : texture === "holographic"
            ? template.name === "Minimalist Classic"
              ? "linear-gradient(118deg, rgba(245,239,230,.95), rgba(198,185,210,.55) 38%, rgba(181,220,222,.48) 68%, rgba(247,220,190,.72)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.4) 0 1.5px, rgba(133,91,145,.14) 1.5px 3px, transparent 3px 5px), linear-gradient(32deg, rgba(238,160,202,.18), rgba(255,255,255,.2), rgba(91,210,211,.16))"
              : template.name === "Soft Feminine Pastel"
                ? "linear-gradient(118deg, rgba(255,220,228,.92), rgba(235,151,181,.7) 42%, rgba(250,194,211,.86) 72%, rgba(255,231,237,.9)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.5) 0 1.8px, rgba(150,65,105,.18) 1.8px 3.2px, transparent 3.2px 5px)"
                : template.name === "Creative Glass"
                  ? "linear-gradient(118deg, rgba(65,28,112,.72), rgba(207,91,186,.46) 38%, rgba(54,190,210,.42) 70%, rgba(244,151,205,.48)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.34) 0 1.4px, rgba(42,20,78,.12) 1.4px 2.8px, transparent 2.8px 5px), linear-gradient(32deg, rgba(120,72,210,.2), rgba(255,255,255,.14) 48%, rgba(64,214,220,.18))"
                  : `linear-gradient(${template.name === "Minimalist Classic" || template.name === "Soft Feminine Pastel" ? "rgba(28,20,52,.28)" : "rgba(28,20,52,.14)"}, ${template.name === "Minimalist Classic" || template.name === "Soft Feminine Pastel" ? "rgba(28,20,52,.28)" : "rgba(28,20,52,.14)"}), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.22) 0 1px, transparent 1px 5px), linear-gradient(120deg, rgba(255,105,180,.28), rgba(80,210,255,.22), rgba(255,220,110,.22))`
            : texture === "metal"
              ? template.name === "Minimalist Classic"
                ? "linear-gradient(118deg, rgba(244,240,235,.98), rgba(235,230,224,.98) 48%, rgba(241,237,231,.98)), repeating-linear-gradient(115deg, rgba(70,48,66,1) 0 2.5px, rgba(255,255,255,.78) 2.5px 4px, transparent 4px 5px)"
                : template.name === "Soft Feminine Pastel"
                  ? "linear-gradient(118deg, rgba(247,205,211,.9), rgba(224,143,169,.72) 48%, rgba(247,190,207,.86)), repeating-linear-gradient(115deg, rgba(255,255,255,.42) 0 1.5px, rgba(145,76,103,.16) 1.5px 3px, transparent 3px 5px)"
                  : template.name === "Creative Glass"
                    ? "linear-gradient(118deg, rgba(36,20,76,.78), rgba(187,91,190,.48) 42%, rgba(69,190,206,.42) 72%, rgba(225,128,194,.5)), repeating-linear-gradient(115deg, rgba(255,255,255,.36) 0 1.5px, rgba(35,20,70,.2) 1.5px 3px, transparent 3px 5px), repeating-linear-gradient(25deg, rgba(255,255,255,.18) 0 1px, transparent 1px 7px)"
                    : `linear-gradient(${template.name === "Minimalist Classic" || template.name === "Soft Feminine Pastel" ? "rgba(18,24,32,.3)" : "rgba(18,24,32,.16)"}, ${template.name === "Minimalist Classic" || template.name === "Soft Feminine Pastel" ? "rgba(18,24,32,.3)" : "rgba(18,24,32,.16)"}), repeating-linear-gradient(115deg, rgba(255,255,255,.2) 0 1.5px, rgba(255,255,255,.03) 1.5px 3px, transparent 3px 5px), linear-gradient(135deg, rgba(30,40,50,.22), rgba(255,255,255,.12))`
              : undefined,
      }}
      className={`${exportMode ? "relative" : "absolute inset-0"} isolate flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[calc(18*var(--u))] border border-black/10 p-[calc(12*var(--u))] [transform-style:preserve-3d] ${template.background} ${template.ink}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[calc(18*var(--u))] bg-white/[0.03]" />
      {texture === "arcs" && (
        <>
          <div className="pointer-events-none absolute right-[calc(-48*var(--u))] top-[calc(-64*var(--u))] size-[calc(160*var(--u))] rounded-full border-[calc(18*var(--u))] border-white/55" />
          <div className="pointer-events-none absolute bottom-[calc(-80*var(--u))] left-[calc(-48*var(--u))] size-[calc(176*var(--u))] rounded-full border-[calc(22*var(--u))] border-white/45" />
        </>
      )}
      {back ? (
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col">
          <div className="mb-[calc(8*var(--u))] flex shrink-0 items-center justify-between gap-[calc(6*var(--u))] border-b border-current/15 pb-[calc(8*var(--u))]">
            <span
              data-fit="1"
              className="min-w-0 truncate text-[calc(11*var(--u))] font-bold tracking-[0.18em]"
            >
              {profile.company.toUpperCase()}
            </span>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-between gap-[calc(6*var(--u))]">
            <div className="flex min-w-0 flex-1 flex-col gap-[calc(6*var(--u))] text-[calc(8*var(--u))] font-medium leading-tight">
              {profile.showPhone && profile.phone.trim() && (
                <p
                  data-fit="1"
                  className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"
                >
                  <Phone size={12} className="size-[1.5em] shrink-0" />
                  <span className="min-w-0">{profile.phone}</span>
                </p>
              )}
              {profile.showRoomNumber && profile.roomNumber.trim() && (
                <p
                  data-fit="1"
                  className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"
                >
                  <Hash size={12} className="size-[1.5em] shrink-0" />
                  <span className="min-w-0">{profile.roomNumber}</span>
                </p>
              )}
              {profile.showBusinessEmail && profile.businessEmail.trim() && (
                <p
                  data-fit="1"
                  className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"
                >
                  <Mail size={12} className="size-[1.5em] shrink-0" />
                  <span className="min-w-0">{profile.businessEmail}</span>
                </p>
              )}
              {profile.showPersonalEmail && profile.personalEmail.trim() && (
                <p
                  data-fit="1"
                  className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"
                >
                  <Mail size={12} className="size-[1.5em] shrink-0" />
                  <span className="min-w-0">{profile.personalEmail}</span>
                </p>
              )}
              {profile.showWebsite && profile.website.trim() && (
                <p
                  data-fit="1"
                  className="flex min-w-0 items-center gap-[calc(10*var(--u))] truncate"
                >
                  <Globe2 size={12} className="size-[1.5em] shrink-0" />
                  <span className="min-w-0">{profile.website}</span>
                </p>
              )}
            </div>
            {publicCode ? (
              <CardQR url={publicCardUrl(publicCode)} />
            ) : (
              <div className="flex size-[calc(48*var(--u))] shrink-0 items-center justify-center rounded-[calc(4*var(--u))] border border-current/20 text-[calc(6*var(--u))] opacity-60">
                {t.save}
              </div>
            )}
          </div>
          <div className="flex min-w-0 shrink-0 items-end justify-between gap-[calc(6*var(--u))] border-t border-current/15 pt-[calc(8*var(--u))] leading-tight">
            <p
              data-fit="1"
              className="flex min-w-0 max-w-[45%] shrink items-center gap-[calc(4*var(--u))] truncate text-[calc(8*var(--u))] font-medium opacity-65"
            >
              <span className="shrink-0 text-[1.5em]">⌖</span>
              <span className="min-w-0">{profile.location}</span>
            </p>
            <div className="min-w-0 flex-1 break-all text-right text-[calc(6*var(--u))] leading-tight font-medium opacity-65">
              {t.scan}
              <br />
              {publicCardHost}/c/{publicCode ?? "—"}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col justify-between">
          <div className="flex items-start justify-between gap-[calc(6*var(--u))]">
            <span
              className="line-clamp-2 min-w-0 flex-1 break-words text-center text-[calc(12*var(--u))] font-bold leading-tight tracking-[0.18em]"
            >
              {profile.company.toUpperCase()}
            </span>
            <div className="flex size-[calc(28*var(--u))] shrink-0 items-center justify-center overflow-hidden rounded-full border border-current/20 text-[calc(12*var(--u))] font-bold">
              {profile.companyLogo ? (
                <img
                  src={profile.companyLogo}
                  alt={`${profile.company} logo`}
                  className="size-full object-cover"
                />
              ) : (
                (
                  profile.company.trim()[0] ||
                  profile.name.trim()[0] ||
                  "C"
                ).toUpperCase()
              )}
            </div>
          </div>
          <div className="flex items-end gap-[calc(12*var(--u))]">
            <div className="flex size-[calc(48*var(--u))] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-current/25 bg-black/10 text-[calc(18*var(--u))] font-bold">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={`${profile.name} photo`}
                  className="size-full object-cover"
                />
              ) : (
                profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                data-fit="1"
                className="w-full overflow-hidden whitespace-nowrap text-[calc(15*var(--u))] font-semibold leading-none tracking-[0.18em]"
              >
                {profile.name.toUpperCase()}
              </p>
              <p className="card-handwritten mt-[calc(6*var(--u))] text-[calc(14*var(--u))] font-medium opacity-75">
                {profile.title}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[calc(10*var(--u))] font-medium opacity-60">
            <span>{profile.showWebsite ? profile.website : ''}</span>
            <span>{profile.location}</span>
          </div>
        </div>
      )}
    </div>
  );
}
function FlipCard({ template, profile, t, compact = false, texture = 'arcs', publicCode = null }: { template: Template; profile: Profile; t: typeof copy.en; compact?: boolean; texture?: Texture; publicCode?: string | null }) { const [flipped, setFlipped] = useState(false); return <div className={`flex w-full min-w-0 flex-col items-center ${compact ? 'gap-1.5' : 'gap-3'}`}><button type="button" aria-label={t.flip} onClick={() => setFlipped((value) => !value)} className={`flip-card group relative aspect-[1.7] w-full min-w-0 [perspective:1200px] drop-shadow-[0_15px_23px_rgba(15,23,42,0.28)] ${compact ? 'max-w-[225px]' : 'max-w-[520px]'}`}><div style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }} className="relative size-full min-w-0 transition-transform duration-700"><CardFace template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} /><CardFace back template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} /></div></button></div> }
function SocialIcon({ icon: Icon, tone }: { icon: typeof Camera; tone: string }) { return <span className={`inline-flex size-5 items-center justify-center rounded-md text-white ${tone}`}><Icon size={13} strokeWidth={2.4} /></span> }
function SocialGlyph({ name }: { name: 'instagram' | 'facebook' | 'linkedin' | 'viber' | 'whatsapp' }) { const Icon = name === 'instagram' ? Camera : name === 'facebook' ? UserRound : MessageCircle; return <Icon aria-hidden="true" size={16} strokeWidth={2.2} /> }
async function imageBlobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read image data.'))
    reader.readAsDataURL(blob)
  })
}
async function imageBlobToPngDataUrl(blob: Blob): Promise<string> {
  const image = new Image()
  image.src = await imageBlobToDataUrl(blob)
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare an image for export.')
  context.drawImage(image, 0, 0)
  return canvas.toDataURL('image/png')
}
async function createImageReadyExportNode(source: HTMLElement): Promise<{ node: HTMLElement; cleanup: () => void }> {
  const node = source.cloneNode(true) as HTMLElement
  node.style.position = 'fixed'
  node.style.left = '0'
  node.style.top = '0'
  node.style.zIndex = '-1'
  node.style.opacity = '0'
  document.body.appendChild(node)
  try {
    const images = Array.from(node.querySelectorAll('img'))
    await Promise.all(images.map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve, reject) => {
          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => reject(new Error(`Unable to load image: ${image.src}`)), { once: true })
        })
      }
      if (!image.naturalWidth) throw new Error(`Unable to load image: ${image.src}`)
      await image.decode()
      const imageUrl = image.currentSrc || image.src
      const response = await fetch(imageUrl, { mode: 'cors', cache: 'force-cache' })
      if (!response.ok) throw new Error(`Unable to fetch image: ${imageUrl}`)
      image.srcset = ''
      image.src = await imageBlobToPngDataUrl(await response.blob())
      await image.decode()
    }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    return { node, cleanup: () => node.remove() }
  } catch (error) {
    node.remove()
    throw error
  }
}
function CardAssetActions({
  profile,
  t,
  language,
  texture,
  template,
  publicCode,
  compact = false,
}: {
  profile: Profile
  t: typeof copy.en
  language: Language
  texture: Texture
  template: Template
  publicCode: string | null
  compact?: boolean
}) {
  const imageExportRef = useRef<HTMLDivElement>(null)
  const [savingImage, setSavingImage] = useState(false)
  const [activeAction, setActiveAction] = useState<'qr' | 'card' | null>(null)
  const saveImageFile = async (blob: Blob, filename: string, title: string) => {
    const file = new File([blob], filename, { type: 'image/png' })
    const isMobileDevice = navigator.userAgentData?.mobile
      ?? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobileDevice && navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title })
      return
    }
    const imageUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60_000)
  }
  const saveCardImage = async () => {
    if (!imageExportRef.current || savingImage) return
    setSavingImage(true)
    setActiveAction('card')
    try {
      await document.fonts.ready
      const { node: exportNode, cleanup } = await createImageReadyExportNode(imageExportRef.current)
      try {
        const captureOptions = {
          backgroundColor: '#eef1f4',
          cacheBust: false,
          pixelRatio: 2,
          style: { position: 'relative', left: '0px', top: '0px', zIndex: 'auto', opacity: '1' },
        } as const
        const hasPhotos = exportNode.querySelector('img') !== null
        let blob: Blob | null = null
        for (let attempt = 0; attempt < (hasPhotos ? 3 : 1); attempt += 1) {
          const images = Array.from(exportNode.querySelectorAll('img'))
          await Promise.all(images.map((image) => image.decode()))
          blob = await toBlob(exportNode, captureOptions)
          if (!blob) throw new Error('Image export returned no data.')
          if (attempt < (hasPhotos ? 2 : 0)) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
          }
        }
        if (!blob) throw new Error('Image export returned no data.')
        await saveImageFile(blob, `${(profile.name.trim() || 'card').replace(/[^a-z0-9-_]+/gi, '-')}-card.png`, profile.name || t.digital)
      } finally {
        cleanup()
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Could not save the card image.', error)
    } finally {
      setSavingImage(false)
      setActiveAction(null)
    }
  }
  const saveQrImage = async () => {
    if (!publicCode || savingImage) return
    setSavingImage(true)
    setActiveAction('qr')
    try {
      const dataUrl = await QRCode.toDataURL(publicCardUrl(publicCode), {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#172538', light: '#ffffff' },
      })
      const response = await fetch(dataUrl)
      if (!response.ok) throw new Error('Could not prepare the QR image.')
      await saveImageFile(await response.blob(), `${(profile.name.trim() || 'card').replace(/[^a-z0-9-_]+/gi, '-')}-qr.png`, `${profile.name || t.digital} QR`)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Could not save the QR image.', error)
    } finally {
      setSavingImage(false)
      setActiveAction(null)
    }
  }
  return (
    <>
      <div className={`grid w-full gap-2 ${publicCode ? 'grid-cols-2' : 'grid-cols-1'} ${compact ? '' : 'mx-auto mt-3 max-w-[520px] gap-3'}`}>
        {publicCode && (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => void saveQrImage()}
              disabled={savingImage}
              title={language === 'en' ? 'Save QR' : 'QR хадгалах'}
              style={compact ? { fontSize: '9px', lineHeight: 1, WebkitTextSizeAdjust: 'none' } : undefined}
              className={`flex w-full min-w-0 items-center justify-center rounded-xl border border-current/15 bg-white/75 font-semibold transition hover:bg-white disabled:cursor-wait disabled:opacity-60 ${compact ? 'h-7 gap-1 px-1 text-[9px] leading-none' : 'h-12 gap-2 px-3 text-sm'}`}
            >
              <QrCode size={compact ? 10 : 17} className="shrink-0" />
              <span style={compact ? { fontSize: '9px', lineHeight: 1, WebkitTextSizeAdjust: 'none' } : undefined} className="min-w-0 truncate">{activeAction === 'qr' ? t.savingCardImage : compact && language === 'mn' ? 'QR хадгалах' : language === 'en' ? 'Save QR' : 'QR хадгалах'}</span>
            </button>
          </div>
        )}
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => void saveCardImage()}
            disabled={savingImage}
            title={t.saveCardImage}
            style={compact ? { fontSize: '9px', lineHeight: 1, WebkitTextSizeAdjust: 'none' } : undefined}
            className={`flex w-full min-w-0 items-center justify-center rounded-xl border border-current/15 bg-white/75 font-semibold transition hover:bg-white disabled:cursor-wait disabled:opacity-60 ${compact ? 'h-7 gap-1 px-1 text-[9px] leading-none' : 'h-12 gap-2 px-3 text-sm'}`}
          >
            <Share2 size={compact ? 10 : 17} className="shrink-0" />
            <span style={compact ? { fontSize: '9px', lineHeight: 1, WebkitTextSizeAdjust: 'none' } : undefined} className="min-w-0 truncate">{activeAction === 'card' ? t.savingCardImage : compact ? language === 'en' ? 'Save card' : 'Карт хадгалах' : t.saveCardImage}</span>
          </button>
        </div>
      </div>
      <div
        ref={imageExportRef}
        aria-hidden="true"
        className="flip-card pointer-events-none fixed left-[-10000px] top-0 z-[-1] flex w-[600px] flex-col gap-3 bg-[#eef1f4] p-10 text-[#26333a]"
      >
        <div className="flip-card relative isolate aspect-[1.7] w-full overflow-hidden">
          <CardFace exportMode template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} />
        </div>
        <div className="flip-card relative isolate aspect-[1.7] w-full overflow-hidden">
          <CardFace exportMode back template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} />
        </div>
      </div>
    </>
  )
}
function PreviewPanel({ template, profile, t, language, texture, publicCode }: { template: Template; profile: Profile; t: typeof copy.en; language: Language; texture: Texture; publicCode: string | null }) {
  const hasPhone = profile.showPhone && Boolean(profile.phone.trim())
  const emails = [
    profile.showBusinessEmail ? profile.businessEmail.trim() : '',
    profile.showPersonalEmail ? profile.personalEmail.trim() : '',
  ].filter(Boolean)
  return (
    <aside className="flex flex-col items-center justify-center xl:sticky xl:top-8 xl:h-[calc(100vh-112px)]">
      <p className="mb-3 w-full max-w-[min(245px,calc(100vw-2rem))] text-left text-xs font-semibold text-[#8996a8]">{t.live}</p>
      <div className="relative w-full max-w-[min(245px,calc(100vw-2rem))] shrink-0 rounded-[34px] border-[7px] border-[#303e51] bg-[#0d1623] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="absolute left-1/2 top-0 z-20 h-4 w-24 -translate-x-1/2 rounded-b-2xl bg-[#303e51]" />
        <div className={`flex min-h-[430px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-[24px] px-2.5 py-5 ${template.publicBackground}`}>
          <div className="order-1 mb-0 flex w-full min-w-0 max-w-[205px] shrink-0 justify-center overflow-hidden">
            <FlipCard compact template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} />
          </div>
          {(hasPhone || emails.length > 0) && (
            <div className={`order-3 mt-3 grid w-full min-w-0 max-w-[205px] gap-2 ${Number(hasPhone) + emails.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {hasPhone && <a href={`tel:${profile.phone}`} style={getCardActionStyle(template, texture)} className="flex h-7 min-w-0 items-center justify-center gap-1 rounded-lg border px-1 text-[9px] font-bold shadow-sm transition hover:brightness-105"><Phone size={10} className="shrink-0" /><span className="truncate">{t.call}</span></a>}
              {emails.map((email) => <a key={email} href={`mailto:${email}`} style={getCardActionStyle(template, texture)} className="flex h-7 min-w-0 items-center justify-center gap-1 rounded-lg border px-1 text-[9px] font-bold shadow-sm transition hover:brightness-105"><Mail size={10} className="shrink-0" /><span className="truncate">{t.emailAction}</span></a>)}
            </div>
          )}
          {Boolean((profile.showInstagram && profile.instagram.trim()) || (profile.showViber && profile.viber.trim()) || (profile.showFacebook && profile.facebook.trim())) && (
            <div className="order-4 mt-3 flex gap-2">
              {profile.showInstagram && profile.instagram.trim() && <a href={profile.instagram.trim()} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-6 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-[#536273]"><InstagramGlyph size={13} /></a>}
              {profile.showViber && profile.viber.trim() && <a href={profile.viber.trim()} target="_blank" rel="noreferrer" aria-label="Viber" className="flex size-6 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-[#536273]"><ViberGlyph size={13} /></a>}
              {profile.showFacebook && profile.facebook.trim() && <a href={profile.facebook.trim()} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex size-6 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-[#536273]"><FacebookGlyph size={13} /></a>}
            </div>
          )}
          <p className="order-2 mt-3 max-w-[185px] text-center text-[8px] leading-tight text-[#8996a8]">{t.tap}</p>
          {hasPhone && (
            <button type="button" onClick={() => downloadVCard(profile)} style={getCardActionStyle(template, texture)} className="order-5 mt-4 flex h-7 w-full max-w-[205px] shrink-0 items-center justify-center gap-1.5 rounded-lg border text-[9px] font-bold shadow-sm transition hover:brightness-105">
              <Download size={11} /> <span className="text-[9px] font-bold leading-none">{language === 'en' ? 'Save Contact' : t.saveContact}</span>
            </button>
          )}
          <div className="order-6 mt-2 w-full max-w-[205px]">
            <CardAssetActions compact profile={profile} t={t} language={language} texture={texture} template={template} publicCode={publicCode} />
          </div>
        </div>
      </div>
    </aside>
  )
}
function PublicCard({ onBack, template, profile, language, t, texture, publicCode }: { onBack: () => void; template: Template; profile: Profile; language: Language; t: typeof copy.en; texture: Texture; publicCode: string | null }) {
  const publicTextColor = template.name === 'Soft Feminine Pastel' ? '#573b48' : template.name === 'Creative Glass' ? '#3d315f' : '#26333a'
  const hasPhone = profile.showPhone && Boolean(profile.phone.trim())
  const emails = [
    profile.showBusinessEmail ? profile.businessEmail.trim() : '',
    profile.showPersonalEmail ? profile.personalEmail.trim() : '',
  ].filter(Boolean)
  const actionCount = Number(hasPhone) + emails.length

  return (
    <main
      style={{ color: publicTextColor }}
      className={`relative min-h-screen w-full overflow-x-hidden ${template.publicBackground}`}
    >
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-3 py-6 sm:px-8 sm:py-8">
        <div className="flex w-full max-w-[760px] flex-col items-center">
          <button
            onClick={onBack}
            className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/10 px-3 py-2 text-xs font-semibold text-current/70 sm:left-8 sm:top-8"
          >
            <X size={14} /> {t.backEditor}
          </button>
          <div className="public-card-flip mt-3 mb-0 w-full">
            <FlipCard template={template} profile={profile} t={t} texture={texture} publicCode={publicCode} />
          </div>
          <p className="public-card-prompt mt-6 mb-6 text-center text-base font-medium text-current/55">{t.tapPublic}</p>
          <div className="w-full">
            {actionCount > 0 && (
              <div className={`mx-auto grid w-full max-w-[520px] gap-3 sm:gap-4 ${actionCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {hasPhone && (
                  <a href={`tel:${profile.phone}`} style={getCardActionStyle(template, texture)} className="flex h-12 items-center justify-center gap-2.5 rounded-xl border px-3 text-sm font-bold shadow-[0_10px_24px_rgba(20,30,50,0.25)] transition hover:brightness-105 active:scale-[0.99]">
                    <Phone size={14} /> {t.call}
                  </a>
                )}
                {emails.map((email) => (
                  <a key={email} href={`mailto:${email}`} style={getCardActionStyle(template, texture)} className="flex h-12 items-center justify-center gap-2.5 rounded-xl border px-3 text-sm font-bold shadow-[0_10px_24px_rgba(20,30,50,0.25)] transition hover:brightness-105 active:scale-[0.99]">
                    <Mail size={14} /> {t.emailAction}
                  </a>
                ))}
              </div>
            )}
          </div>
          {Boolean((profile.showInstagram && profile.instagram.trim()) || (profile.showViber && profile.viber.trim()) || (profile.showFacebook && profile.facebook.trim())) && (
            <div className="public-card-socials mt-3 flex justify-center gap-3">
              {profile.showInstagram && profile.instagram.trim() && <a href={profile.instagram.trim()} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-11 items-center justify-center rounded-full border border-white/70 bg-white"><InstagramGlyph size={18} /></a>}
              {profile.showViber && profile.viber.trim() && <a href={profile.viber.trim()} target="_blank" rel="noreferrer" aria-label="Viber" className="flex size-11 items-center justify-center rounded-full border border-white/70 bg-white"><ViberGlyph size={18} /></a>}
              {profile.showFacebook && profile.facebook.trim() && <a href={profile.facebook.trim()} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex size-11 items-center justify-center rounded-full border border-white/70 bg-white"><FacebookGlyph size={18} /></a>}
            </div>
          )}
          {hasPhone && (
            <button
              type="button"
              onClick={() => downloadVCard(profile)}
              style={getCardActionStyle(template, texture)}
              className="mx-auto mt-3 flex h-12 w-full max-w-[520px] items-center justify-center gap-2.5 rounded-xl border px-5 text-sm font-bold shadow-[0_10px_24px_rgba(20,30,50,0.25)] transition hover:brightness-105 active:scale-[0.99]"
            >
              <Download size={16} strokeWidth={2.4} /> {language === 'en' ? 'Save Contact' : t.saveContact}
            </button>
          )}
          <CardAssetActions profile={profile} t={t} language={language} texture={texture} template={template} publicCode={publicCode} />
        </div>
      </div>
    </main>
  )
}

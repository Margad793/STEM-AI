'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronDown, Download, EyeOff, Languages, Leaf, QrCode, Share2, SmartphoneNfc } from 'lucide-react'

type Language = 'en' | 'mn'

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_gbudftgbudftgbud-6IOh1Fmz2F5ytWKVOX16A263gpQwEa.jpg'
// Drop a photo of the physical NFC card at this path (public/nfc-card.png).
// Until it exists the built-in CSS card artwork is shown instead.
const NFC_CARD_IMAGE = '/nfc-card.png'
// public/nfc-phone.png — the screen after the NFC card has been scanned.
const NFC_PHONE_IMAGE = '/nfc-phone.png'
// public/nfc-phone-idle.png — the "hold the NFC card to the phone" state.
// Until it exists the CSS phone with that same text is shown instead.
const NFC_PHONE_IDLE_IMAGE = '/nfc-phone-idle.png'

const landingCopy = {
  en: {
    navSignIn: 'Sign in',
    eyebrow: 'Digital business card',
    h1a: 'Your business card appears',
    h1b: 'the moment a phone comes close',
    sub: 'Cardliy is a digital business card you share with an NFC card, a QR code or a plain link. Build your profile once and hand it over — no app to install.',
    ctaPrimary: 'Get started',
    ctaSecondary: 'How it works',
    chip1: 'No app needed',
    chip2: 'NFC · QR · LINK',
    chip3: 'MN · EN',
    sceneIdle: 'Hold the NFC card to the phone',
    nfcCardLabel: 'NFC business card',
    cap1: '① Bring the NFC card close to the phone',
    cap2: '② Your digital card opens',
    howEyebrow: 'How it works?',
    step1Title: 'Create your card',
    step1Desc: 'Add your name, title, photo and details, hit save, and your digital card is ready.',
    step2Title: 'Plenty of ways to share',
    step2Desc: 'Hand it over with an NFC card, a QR code or a Link — whoever you meet.',
    step3Title: 'Instant actions',
    step3Desc: 'The visitor opens your card on their phone, saves your number to Contacts and keeps the card image and QR code as a photo.',
    featEyebrow: 'Advantages',
    f1Title: 'No paper waste',
    f1Desc: 'An NFC card means no printed business cards to reprint or throw away.',
    f2Title: 'Card and QR code',
    f2Desc: 'Hold the card to the phone, or scan the QR code — your card opens either way.',
    f3Title: 'Save contact details',
    f3Desc: 'Contacts keeps the number together with the rest of your details.',
    f4Title: 'Social links',
    f4Desc: 'Add your Instagram, Facebook and Viber straight as links.',
    f5Title: 'Switch language',
    f5Desc: 'The card works in Mongolian and English.',
    f6Title: 'Hide what you want',
    f6Desc: 'Choose which details stay off your public card.',
    ctaTitle: 'Create your card today',
    ctaSub: 'Setting up your profile takes a couple of minutes.',
    ctaButton: 'Create account',
    footer: '© 2026 Cardliy · Digital business cards',
    back: 'Back',
    changeLanguage: 'Change language',
    switchToEnglish: 'Change the website language to English?',
    switchToMongolian: 'Change the website language to Mongolian?',
    yes: 'Yes',
    no: 'No',
  },
  mn: {
    navSignIn: 'Нэвтрэх',
    eyebrow: 'Дижитал нэрийн хуудас',
    h1a: 'Карт ойртох мөчид л',
    h1b: 'таны нэрийн хуудас гарч ирнэ',
    sub: 'Cardliy нь NFC карт, QR код эсвэл Link-ээр дамжуулан бусадтай хуваалцах дижитал нэрийн хуудас. Профайлаа нэг удаа үүсгээд, харилцагчдаа апп таталгүйгээр мэдээллээ шууд дамжуулаарай.',
    ctaPrimary: 'Эхлэх',
    ctaSecondary: 'Хэрхэн ажилладаг вэ?',
    chip1: 'Апп шаардлагагүй',
    chip2: 'NFC · QR · LINK',
    chip3: 'MN · EN',
    sceneIdle: 'NFC картыг утсанд хүргэнэ үү',
    nfcCardLabel: 'NFC нэрийн хуудас',
    cap1: '① NFC картыг утсанд ойртуулна',
    cap2: '② Нэрийн хуудас нээгдэнэ',
    howEyebrow: 'Хэрхэн ажилладаг вэ?',
    step1Title: 'Нэрийн хуудас үүсгэх',
    step1Desc: 'Нэр, албан тушаал, зураг, мэдээллээ оруулаад, хадгалахад таны нэрийн хуудас үүснэ.',
    step2Title: 'Олон хуваалцах боломж',
    step2Desc: 'NFC карт, QR код эсвэл Link-р дамжуулан бусдад өөрийн нэрийн хуудсаа тараах.',
    step3Title: 'Шууд холбоосууд',
    step3Desc: 'Харилцагч нэрийн хуудсыг утсан дээрээ гаргаж ирсэнээр CONTACTS дотор дугаар хадгалах, картны зураг болон QR-г зургаар хадгалах боломжтой.',
    featEyebrow: 'Давуу талууд',
    f1Title: 'Цаасан хаягдал гарахгүй',
    f1Desc: 'NFC кардыг ашигласнаар цаасан нэрийн хуудас шаардлагагүй болно.',
    f2Title: 'Карт болон QR код',
    f2Desc: 'Картыг утсанд ойртуулаад харин QR кодыг утсаар уншуулаад л нэрийн хуудас нээгдэнэ.',
    f3Title: 'Холбоо барих мэдээлэл хадгалах',
    f3Desc: 'Contacts дотор дугаарын хамтаар бусад мэдээллийг хадгална.',
    f4Title: 'Цахим хаягийн холбоос',
    f4Desc: 'Instagram, Facebook, Viber гэсэн 3 цахим хаягаа шууд холбоос байдлаар оруулах.',
    f5Title: 'Хэл солих боломж',
    f5Desc: 'Нэрийн хуудас монгол, англи хэл дээр ажиллах боломжтой',
    f6Title: 'Мэдээллээ нуух',
    f6Desc: 'Нэрийн хуудсан дээр гаргаж ирэхгүй мэдээллүүдээ нуух боломжтой.',
    ctaTitle: 'Өөрийн нэрийн хуудсаа үүсгэ',
    ctaSub: 'Профайлаа бэлтгэхэд хэдхэн минут шаардлагатай.',
    ctaButton: 'Бүртгэл үүсгэх',
    footer: '© 2026 Cardliy · Дижитал нэрийн хуудас',
    back: 'Буцах',
    changeLanguage: 'Хэл солих',
    switchToEnglish: 'Вэбсайтын хэлийг англи хэл рүү өөрчлөх үү?',
    switchToMongolian: 'Вэбсайтын хэлийг монгол хэл рүү өөрчлөх үү?',
    yes: 'Тийм',
    no: 'Үгүй',
  },
} as const

const featureIcons = [Leaf, QrCode, Download, Share2, Languages, EyeOff]

export function Landing({
  language,
  onLanguageChange,
  onSignIn,
}: {
  language: Language
  onLanguageChange: (language: Language) => void
  onSignIn: (mode: 'signIn' | 'signUp') => void
}) {
  const t = landingCopy[language]
  const [cardImageFailed, setCardImageFailed] = useState(false)
  const [phoneResultImage, setPhoneResultImage] = useState<string | null>(null)
  const [phoneIdleImage, setPhoneIdleImage] = useState<string | null>(null)
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null)

  useEffect(() => {
    const probe = (src: string, onLoad: (loaded: string) => void) => {
      const image = new Image()
      image.onload = () => onLoad(src)
      image.src = src
    }
    probe(NFC_PHONE_IMAGE, setPhoneResultImage)
    probe(NFC_PHONE_IDLE_IMAGE, setPhoneIdleImage)
  }, [])

  const scrollToHow = () => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const requestLanguageChange = (nextLanguage: Language) => {
    if (nextLanguage !== language) setPendingLanguage(nextLanguage)
  }

  const confirmLanguageChange = () => {
    if (pendingLanguage) onLanguageChange(pendingLanguage)
    setPendingLanguage(null)
  }

  const featureKeys = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const

  return (
    <main className="min-h-screen w-full bg-[#f7f8fa] text-[#18202d]">
      <section className="landing-hero">
        <header className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex min-w-0 items-center gap-2"
            aria-label="Cardliy"
          >
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-[#f7f4ed]">
              <img src={LOGO_URL} alt="Cardliy logo" className="size-full object-cover" />
            </span>
            <span className="font-serif text-[19px] font-medium italic tracking-[-0.045em] text-white">Cardliy</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-white/20 bg-white/10 p-0.5">
              <button
                type="button"
                onClick={() => requestLanguageChange('en')}
                aria-pressed={language === 'en'}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${language === 'en' ? 'bg-white text-[#172538]' : 'text-[#b7c3d6] hover:text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => requestLanguageChange('mn')}
                aria-pressed={language === 'mn'}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${language === 'mn' ? 'bg-white text-[#172538]' : 'text-[#b7c3d6] hover:text-white'}`}
              >
                MN
              </button>
            </div>
            <button
              type="button"
              onClick={() => onSignIn('signIn')}
              className="rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              {t.navSignIn}
            </button>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1180px] items-center gap-8 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-14 lg:pb-24 lg:pt-10">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a9c4ec]">
              {t.eyebrow}
            </span>
            <h1 className="mt-5 text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[44px] lg:text-[52px]">
              {t.h1a} <span className="text-[#8fb6ff]">{t.h1b}</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed text-[#b7c3d6] sm:text-base">{t.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSignIn('signUp')}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#172538] transition hover:bg-[#e9eef7]"
              >
                {t.ctaPrimary}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={scrollToHow}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t.ctaSecondary}
                <ChevronDown size={16} />
              </button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#9fb0c6]">
              {[t.chip1, t.chip2, t.chip3].map((chip) => (
                <li key={chip} className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#7fd0a0]" strokeWidth={3} />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <div className="nfc-stage">
              <div className="nfc-scene">
                <span className="nfc-glow" aria-hidden="true" />

                <div className="nfc-phone-float">
                  <div className="nfc-phone">
                    <div className={`nfc-phone-state nfc-phase-idle${phoneResultImage ? '' : ' nfc-phase-hold'}`}>
                      {phoneIdleImage ? (
                        <img src={phoneIdleImage} alt="" className="nfc-phone-img" />
                      ) : (
                        <div className="nfc-phone-face">
                          <div className="nfc-idle">
                            <SmartphoneNfc size={34} strokeWidth={1.6} />
                            <p>{t.sceneIdle}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {phoneResultImage && (
                      <img src={phoneResultImage} alt="" className="nfc-phone-img nfc-phase-result" />
                    )}
                  </div>
                </div>

                <div className="nfc-clip">
                  <div className="nfc-tap-card">
                    {cardImageFailed ? (
                      <div className="nfc-card-art nfc-card-css">
                        <span className="nfc-chip" aria-hidden="true" />
                        <div className="nfc-card-foot">
                          <div>
                            <p className="nfc-card-brand">Cardliy</p>
                            <p className="nfc-card-label">{t.nfcCardLabel}</p>
                          </div>
                          <SmartphoneNfc size={22} className="text-[#d7b56a]" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={NFC_CARD_IMAGE}
                        alt=""
                        className="nfc-card-art"
                        onError={() => setCardImageFailed(true)}
                      />
                    )}
                  </div>
                </div>

                <div className="nfc-ripple-anchor" aria-hidden="true">
                  <span className="nfc-ripple nfc-ripple-1" />
                  <span className="nfc-ripple nfc-ripple-2" />
                  <span className="nfc-ripple nfc-ripple-3" />
                </div>
              </div>
            </div>
            <div className="nfc-captions" aria-hidden="true">
              <p className="nfc-caption nfc-caption-1">{t.cap1}</p>
              <p className="nfc-caption nfc-caption-2">{t.cap2}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-[#f7f8fa]">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6d82bf]">{t.howEyebrow}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { title: t.step1Title, desc: t.step1Desc },
              { title: t.step2Title, desc: t.step2Desc },
              { title: t.step3Title, desc: t.step3Desc },
            ].map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-[#e5e8ec] bg-white p-6 shadow-[0_1px_3px_rgba(24,32,45,0.04)]">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#172538] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#18202d]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#52606f]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e7e9ee] bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6d82bf]">{t.featEyebrow}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key, index) => {
              const Icon = featureIcons[index]
              return (
                <div key={key} className="rounded-2xl border border-[#e5e8ec] bg-[#fbfcfd] p-6 transition hover:-translate-y-0.5 hover:border-[#c3cee4]">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-[#e5e8ec] bg-white text-[#3d5a91]">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[#18202d]">{t[`${key}Title` as const]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#52606f]">{t[`${key}Desc` as const]}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="landing-hero">
        <div className="mx-auto max-w-[1180px] px-5 py-16 text-center sm:px-8 lg:py-20">
          <h2 className="text-[27px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[36px]">{t.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-[#b7c3d6] sm:text-base">{t.ctaSub}</p>
          <button
            type="button"
            onClick={() => onSignIn('signUp')}
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#172538] transition hover:bg-[#e9eef7]"
          >
            {t.ctaButton}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="border-t border-[#e7e9ee] bg-[#f7f8fa]">
        <div className="mx-auto flex max-w-[1180px] items-center px-5 py-8 sm:px-8">
          <p className="text-xs text-[#8c96a3]">{t.footer}</p>
        </div>
      </footer>

      {pendingLanguage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101828]/45 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-language-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="landing-language-title" className="text-lg font-semibold text-[#18202d]">
              {t.changeLanguage}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#52606f]">
              {pendingLanguage === 'mn' ? t.switchToMongolian : t.switchToEnglish}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingLanguage(null)}
                className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-semibold text-[#52606f] hover:bg-[#f7f8fa]"
              >
                {t.no}
              </button>
              <button
                type="button"
                onClick={confirmLanguageChange}
                className="rounded-lg bg-[#172538] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24354b]"
              >
                {t.yes}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

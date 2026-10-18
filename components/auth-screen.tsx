'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-browser'

type Language = 'en' | 'mn'
const googleOAuthEnabled = false

const authCopy = {
  en: {
    signIn: 'Sign in',
    signUp: 'Create account',
    email: 'Email address',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    promo: 'Promo code',
    signInButton: 'Sign in',
    signUpButton: 'Create account',
    googleSignIn: 'Continue with Google',
    googleSignUp: 'Create account with Google',
    googleLinkHint: 'Use your existing Gmail account. The promo code is still required to create a Cardliy account.',
    or: 'or',
    promoHint: 'Enter the account invitation code to register.',
    missingPromo: 'Enter the promo code to create an account.',
    invalidPromo: 'That promo code is not valid.',
    missingConfig: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the development server.',
    checkEmail: 'Account created. Check your email to confirm your address, then sign in.',
    resendConfirmation: 'Resend confirmation email',
    confirmationResent: 'Confirmation email sent. Check your inbox and spam folder.',
    emailNotConfirmed: 'Your account exists but your email is not confirmed yet. Check your inbox or resend the confirmation email.',
    loading: 'Please wait...',
    signInError: 'Could not sign in.',
    signUpError: 'Could not create your account.',
    connectionError: 'Cannot connect to Supabase. Check that the project is active, the project URL is correct, and your device has internet access.',
    language: 'Change language',
    changeToEnglish: 'Change the website language to English?',
    changeToMongolian: 'Change the website language to Mongolian?',
    yes: 'Yes',
    no: 'No',
    accessTitle: 'Account access is not active',
    accessDescription: 'Your sign-in succeeded, but this account does not have Cardliy access yet. If you registered with the valid promo code, ask the site administrator to run the latest supabase/promo-code-trigger.sql in Supabase SQL Editor, then sign out and sign in again. Otherwise, the administrator must grant access to this account.',
    signOut: 'Sign out',
  },
  mn: {
    signIn: 'Нэвтрэх',
    signUp: 'Бүртгэл үүсгэх',
    email: 'Имэйл хаяг',
    password: 'Нууц үг',
    showPassword: 'Нууц үг харуулах',
    hidePassword: 'Нууц үг нуух',
    promo: 'Урамшууллын код',
    signInButton: 'Нэвтрэх',
    signUpButton: 'Бүртгэл үүсгэх',
    googleSignIn: 'Google-ээр үргэлжлүүлэх',
    googleSignUp: 'Google хаягаар бүртгэл үүсгэх',
    googleLinkHint: 'Өөрийн Gmail хаягийг ашиглана уу. Cardliy бүртгэл үүсгэхэд урамшууллын код шаардлагатай.',
    or: 'эсвэл',
    promoHint: 'Бүртгүүлэхийн тулд урилгын код оруулна уу.',
    missingPromo: 'Бүртгэл үүсгэхийн тулд урамшууллын код оруулна уу.',
    invalidPromo: 'Урамшууллын код буруу байна.',
    missingConfig: '.env.local файлд NEXT_PUBLIC_SUPABASE_URL болон NEXT_PUBLIC_SUPABASE_ANON_KEY утгуудыг оруулаад серверээ дахин эхлүүлнэ үү.',
    checkEmail: 'Бүртгэл үүслээ. Имэйлээ баталгаажуулаад нэвтэрнэ үү.',
    resendConfirmation: 'Баталгаажуулах имэйлийг дахин илгээх',
    confirmationResent: 'Баталгаажуулах имэйлийг илгээлээ. Inbox болон Spam хавтсаа шалгана уу.',
    emailNotConfirmed: 'Таны бүртгэл үүссэн боловч имэйл баталгаажаагүй байна. Inbox-оо шалгах эсвэл баталгаажуулах имэйлийг дахин илгээнэ үү.',
    loading: 'Түр хүлээнэ үү...',
    signInError: 'Нэвтрэх боломжгүй байна.',
    signUpError: 'Бүртгэл үүсгэх боломжгүй байна.',
    connectionError: 'Supabase-тэй холбогдож чадсангүй. Төсөл идэвхтэй эсэх, URL зөв эсэх болон интернэт холболтоо шалгана уу.',
    language: 'Хэл солих',
    changeToEnglish: 'Вэбсайтын хэлийг англи хэл рүү өөрчлөх үү?',
    changeToMongolian: 'Вэбсайтын хэлийг монгол хэл рүү өөрчлөх үү?',
    yes: 'Тийм',
    no: 'Үгүй',
    accessTitle: 'Бүртгэлийн эрх идэвхгүй байна',
    accessDescription: 'Та амжилттай нэвтэрсэн боловч энэ бүртгэлд Cardliy ашиглах эрх олгогдоогүй байна. Зөв promo кодоор бүртгүүлсэн бол сайтын админаас Supabase SQL Editor дээр шинэчилсэн supabase/promo-code-trigger.sql файлыг ажиллуулахыг хүсээд, дараа нь гараад дахин нэвтэрнэ үү. Үгүй бол админ энэ бүртгэлд эрх олгох шаардлагатай.',
    signOut: 'Гарах',
  },
}

export function AuthScreen({ language, onLanguageChange, session, accessError }: { language: Language; onLanguageChange: (language: Language) => void; session?: Session | null; accessError?: string }) {
  const t = authCopy[language]
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [confirmation, setConfirmation] = useState<Language | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [canResendConfirmation, setCanResendConfirmation] = useState(false)

  const chooseLanguage = (nextLanguage: Language) => {
    if (language !== nextLanguage) setConfirmation(nextLanguage)
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      setError(t.missingConfig)
      return
    }

    if (mode === 'signUp') {
      if (!promoCode) {
        setError(t.missingPromo)
        return
      }
      if (promoCode !== 'CARDLY2026') {
        setError(t.invalidPromo)
        return
      }
      window.sessionStorage.setItem('cardly_pending_promo', promoCode)
    }

    setBusy(true)
    setError('')
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (oauthError) throw oauthError
    } catch (oauthError) {
      const detail = oauthError instanceof Error ? oauthError.message : ''
      const isConnectionError = oauthError instanceof TypeError || /load failed|failed to fetch|networkerror/i.test(detail)
      setError(isConnectionError ? t.connectionError : detail || t.signInError)
      setBusy(false)
    }
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setCanResendConfirmation(false)

    if (!supabase) {
      setError(t.missingConfig)
      return
    }

    if (mode === 'signUp' && !promoCode) {
      setError(t.missingPromo)
      return
    }

    if (mode === 'signUp' && promoCode !== 'CARDLY2026') {
      setError(t.invalidPromo)
      return
    }

    setBusy(true)
    try {
      if (mode === 'signIn') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { promo_code: promoCode },
            emailRedirectTo: window.location.origin,
          },
        })
        if (signUpError) throw signUpError
        if (!data.session) setMessage(t.checkEmail)
      }
    } catch (authError) {
      const detail = authError instanceof Error ? authError.message : ''
      const isConnectionError = authError instanceof TypeError || /load failed|failed to fetch|networkerror/i.test(detail)
      const errorCode = typeof authError === 'object' && authError !== null && 'code' in authError
        ? String(authError.code)
        : ''
      const emailUnconfirmed = errorCode === 'email_not_confirmed' || /email not confirmed/i.test(detail)
      setCanResendConfirmation(mode === 'signIn' && emailUnconfirmed)
      setError(isConnectionError ? t.connectionError : emailUnconfirmed ? t.emailNotConfirmed : detail || (mode === 'signIn' ? t.signInError : t.signUpError))
    } finally {
      setBusy(false)
    }
  }

  const resendConfirmation = async () => {
    if (!supabase || !email) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (resendError) throw resendError
      setCanResendConfirmation(false)
      setMessage(t.confirmationResent)
    } catch (resendError) {
      const detail = resendError instanceof Error ? resendError.message : ''
      const isConnectionError = resendError instanceof TypeError || /load failed|failed to fetch|networkerror/i.test(detail)
      setError(isConnectionError ? t.connectionError : detail || t.signUpError)
    } finally {
      setBusy(false)
    }
  }

  if (session) return <main className="auth-screen flex min-h-screen items-center justify-center p-4 text-[#eef4ff]">
    <section className="auth-panel w-full max-w-md rounded-2xl border p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_gbudftgbudftgbud-6IOh1Fmz2F5ytWKVOX16A263gpQwEa.jpg" alt="Cardliy logo" className="size-9 rounded-[10px] object-cover" />
          <p className="auth-brand font-serif text-2xl font-medium italic tracking-[-0.045em]">Cardliy</p>
        </div>
        <button type="button" onClick={() => void supabase?.auth.signOut()} className="text-xs font-semibold text-[#52606f]">{t.signOut}</button>
      </div>
      <h1 className="text-lg font-semibold">{t.accessTitle}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#7c8795]">{t.accessDescription}</p>
      {accessError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{accessError}</p>}
    </section>
  </main>

  return <main className="auth-screen flex min-h-screen items-center justify-center p-4 text-[#eef4ff]">
    <section className="auth-panel w-full max-w-md rounded-2xl border p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_gbudftgbudftgbud-6IOh1Fmz2F5ytWKVOX16A263gpQwEa.jpg" alt="Cardliy logo" className="size-9 rounded-[10px] object-cover" />
          <p className="auth-brand font-serif text-2xl font-medium italic tracking-[-0.045em]">Cardliy</p>
        </div>
        <div className="flex gap-1 rounded-full border border-[#dfe3e8] bg-[#eef1f4] p-0.5">
          <button type="button" onClick={() => chooseLanguage('en')} aria-pressed={language === 'en'} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${language === 'en' ? 'border-[#263b57] bg-[#17263a] text-white shadow-sm' : 'border-transparent bg-transparent text-[#8994a2]'}`}>EN</button>
          <button type="button" onClick={() => chooseLanguage('mn')} aria-pressed={language === 'mn'} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${language === 'mn' ? 'border-[#263b57] bg-[#17263a] text-white shadow-sm' : 'border-transparent bg-transparent text-[#8994a2]'}`}>MN</button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f1f3f6] p-1">
        <button type="button" onClick={() => { setMode('signIn'); setError(''); setMessage('') }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'signIn' ? 'bg-white text-[#172538] shadow-sm' : 'text-[#7c8795]'}`}>{t.signIn}</button>
        <button type="button" onClick={() => { setMode('signUp'); setError(''); setMessage('') }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'signUp' ? 'bg-white text-[#172538] shadow-sm' : 'text-[#7c8795]'}`}>{t.signUp}</button>
      </div>

      {!supabase && <p role="alert" className="mb-5 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.missingConfig}</p>}
      <form onSubmit={submit} className="space-y-4">
        <label className="auth-label block text-xs font-semibold">{t.email}
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input mt-2 h-11 w-full rounded-xl border-2 px-3.5 text-base outline-none focus:border-[#a9c8f4] sm:text-sm" />
        </label>
        <label className="auth-label block text-xs font-semibold">{t.password}
          <span className="relative mt-2 block">
            <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input h-11 w-full rounded-xl border-2 px-3.5 pr-12 text-base outline-none focus:border-[#a9c8f4] sm:text-sm" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? t.hidePassword : t.showPassword} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-[#7c8795] hover:text-[#172538] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#a9c8f4]">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
        {mode === 'signUp' && <label className="auth-label block text-xs font-semibold">{t.promo}
          <input type="text" required value={promoCode} onChange={(event) => setPromoCode(event.target.value)} aria-describedby="promo-hint" className="auth-input mt-2 h-11 w-full rounded-xl border-2 px-3.5 text-base outline-none focus:border-[#a9c8f4] sm:text-sm" />
          <span id="promo-hint" className="auth-muted mt-1 block font-normal">{t.promoHint}</span>
        </label>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-800">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-xs text-green-800">{message}</p>}
        <button type="submit" disabled={busy || !supabase} className="h-11 w-full rounded-xl border border-[#263b57] bg-[#17263a] text-sm font-semibold text-white transition hover:bg-[#20344f] disabled:cursor-not-allowed disabled:opacity-60">{busy ? t.loading : mode === 'signIn' ? t.signInButton : t.signUpButton}</button>
        {googleOAuthEnabled && mode === 'signIn' && <>
          <div className="flex items-center gap-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9aa4af]"><span className="h-px flex-1 bg-[#e5e8ec]" />{t.or}<span className="h-px flex-1 bg-[#e5e8ec]" /></div>
          <button type="button" onClick={signInWithGoogle} disabled={busy || !supabase} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#d9dee6] bg-white text-sm font-semibold text-[#263343] transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-60"><span aria-hidden="true" className="font-bold text-base text-[#4285f4]">G</span>{t.googleSignIn}</button>
          <p className="text-center text-xs leading-relaxed text-[#8c96a3]">{t.googleLinkHint}</p>
        </>}
        {googleOAuthEnabled && mode === 'signUp' && <>
          <div className="flex items-center gap-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9aa4af]"><span className="h-px flex-1 bg-[#e5e8ec]" />{t.or}<span className="h-px flex-1 bg-[#e5e8ec]" /></div>
          <button type="button" onClick={signInWithGoogle} disabled={busy || !supabase} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#d9dee6] bg-white text-sm font-semibold text-[#263343] transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-60"><span aria-hidden="true" className="font-bold text-base text-[#4285f4]">G</span>{t.googleSignUp}</button>
          <p className="text-center text-xs leading-relaxed text-[#8c96a3]">{t.googleLinkHint}</p>
        </>}
      </form>
    </section>

    {confirmation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/45 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="auth-language-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="auth-language-title" className="text-lg font-semibold">{t.language}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#52606f]">{confirmation === 'mn' ? t.changeToMongolian : t.changeToEnglish}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmation(null)} className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-semibold text-[#52606f]">{t.no}</button>
          <button type="button" onClick={() => { onLanguageChange(confirmation); setConfirmation(null) }} className="rounded-lg bg-[#172538] px-4 py-2 text-sm font-semibold text-white">{t.yes}</button>
        </div>
      </section>
    </div>}
  </main>
}

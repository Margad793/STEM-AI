'use client'

import { useRef, useState } from 'react'
import { QrCode, Share2 } from 'lucide-react'
import { toBlob } from 'html-to-image'
import QRCode from 'qrcode'
import type { Profile, Template, Texture } from '@/lib/card-types'
import { getPublicSiteOrigin } from '@/lib/site'
import { CardFacesExport } from '@/components/business-card'

const publicCardOrigin = getPublicSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL)

async function imageBlobToPngDataUrl(blob: Blob) {
  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read image data.'))
    reader.readAsDataURL(blob)
  })
  const image = new Image()
  image.src = dataUrl
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare an image for export.')
  context.drawImage(image, 0, 0)
  return canvas.toDataURL('image/png')
}

async function waitForImage(image: HTMLImageElement) {
  image.loading = 'eager'
  image.decoding = 'sync'
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        window.clearTimeout(timeout)
        image.removeEventListener('load', onLoad)
        image.removeEventListener('error', onError)
      }
      const onLoad = () => {
        cleanup()
        resolve()
      }
      const onError = () => {
        cleanup()
        reject(new Error(`Unable to load image: ${image.src}`))
      }
      const timeout = window.setTimeout(() => {
        cleanup()
        reject(new Error(`Timed out loading image: ${image.src}`))
      }, 15_000)
      image.addEventListener('load', onLoad, { once: true })
      image.addEventListener('error', onError, { once: true })
      if (image.complete) {
        cleanup()
        if (image.naturalWidth) resolve()
        else reject(new Error(`Unable to load image: ${image.src}`))
      }
    })
  }
  if (!image.naturalWidth) throw new Error(`Unable to load image: ${image.src}`)
  await image.decode()
}

async function prepareImagesForExport(source: HTMLElement) {
  const node = source.cloneNode(true) as HTMLElement
  node.style.position = 'fixed'
  node.style.left = '0'
  node.style.top = '0'
  node.style.zIndex = '-1'
  node.style.opacity = '0'
  document.body.appendChild(node)
  try {
    await Promise.all(Array.from(node.querySelectorAll('img')).map(async (image) => {
      await waitForImage(image)
      const imageUrl = image.currentSrc || image.src
      const response = await fetch(imageUrl, { mode: 'cors', cache: 'no-store' })
      if (!response.ok) throw new Error(`Unable to fetch image: ${imageUrl}`)
      image.srcset = ''
      image.src = await imageBlobToPngDataUrl(await response.blob())
      await waitForImage(image)
    }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    return { node, cleanup: () => node.remove() }
  } catch (error) {
    node.remove()
    throw error
  }
}

export function PublicCardAssetActions({
  profile,
  template,
  texture,
  publicCode,
}: {
  profile: Profile
  template: Template
  texture: Texture
  publicCode: string
}) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [activeAction, setActiveAction] = useState<'qr' | 'card' | null>(null)
  const [feedback, setFeedback] = useState<{ action: 'qr' | 'card'; message: string } | null>(null)
  const cardBaseName = (profile.name.trim() || 'card').replace(/[^a-z0-9-_]+/gi, '-')

  const saveImage = async (blob: Blob, fileName: string, title: string) => {
    const file = new File([blob], fileName, { type: 'image/png' })
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title })
      return 'Image shared. Choose Save Image to keep it.'
    }
    const imageUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60_000)
    return 'Image downloaded.'
  }

  const saveQr = async () => {
    setActiveAction('qr')
    setFeedback(null)
    try {
      const dataUrl = await QRCode.toDataURL(`${publicCardOrigin}/c/${encodeURIComponent(publicCode)}`, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#172538', light: '#ffffff' },
      })
      const response = await fetch(dataUrl)
      if (!response.ok) throw new Error('Could not prepare the QR image.')
      const message = await saveImage(await response.blob(), `${cardBaseName}-qr.png`, `${profile.name || 'Business card'} QR`)
      setFeedback({ action: 'qr', message: message.replace('Image', 'QR image') })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Could not save the public card QR code.', error)
      setFeedback({ action: 'qr', message: 'Could not create the QR image.' })
    } finally {
      setActiveAction(null)
    }
  }

  const saveCard = async () => {
    if (!exportRef.current) return
    setActiveAction('card')
    setFeedback(null)
    try {
      await document.fonts.ready
      const { node, cleanup } = await prepareImagesForExport(exportRef.current)
      try {
        const options = {
          backgroundColor: '#eef1f4',
          cacheBust: false,
          pixelRatio: 2,
          style: { position: 'relative', left: '0px', top: '0px', zIndex: 'auto', opacity: '1' },
        } as const
        const hasImages = node.querySelector('img') !== null
        let blob: Blob | null = null
        for (let attempt = 0; attempt < (hasImages ? 3 : 1); attempt += 1) {
          await Promise.all(Array.from(node.querySelectorAll('img')).map(waitForImage))
          blob = await toBlob(node, options)
          if (!blob) throw new Error('Image export returned no data.')
          if (attempt < (hasImages ? 2 : 0)) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
          }
        }
        if (!blob) throw new Error('Image export returned no data.')
        const message = await saveImage(blob, `${cardBaseName}-card.png`, profile.name || 'Business card')
        setFeedback({ action: 'card', message: message.replace('Image', 'Card image') })
      } finally {
        cleanup()
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Could not save the public card image.', error)
      setFeedback({ action: 'card', message: 'Could not create the card image. Please try again.' })
    } finally {
      setActiveAction(null)
    }
  }

  return (
    <>
      <div className="mx-auto mt-3 grid w-full max-w-[520px] grid-cols-2 gap-3">
        <div className="min-w-0">
          <button type="button" onClick={() => void saveQr()} disabled={activeAction !== null} className="flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-current/15 bg-white/75 px-3 text-sm font-semibold transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
            <QrCode size={17} className="shrink-0" />
            <span className="truncate">{activeAction === 'qr' ? 'Preparing image...' : 'Save QR'}</span>
          </button>
          {feedback?.action === 'qr' && <p aria-live="polite" className="mt-1 text-center text-xs opacity-65">{feedback.message}</p>}
        </div>
        <div className="min-w-0">
          <button type="button" onClick={() => void saveCard()} disabled={activeAction !== null} className="flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-current/15 bg-white/75 px-3 text-sm font-semibold transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
            <Share2 size={17} className="shrink-0" />
            <span className="truncate">{activeAction === 'card' ? 'Preparing image...' : 'Save card'}</span>
          </button>
          {feedback?.action === 'card' && <p aria-live="polite" className="mt-1 text-center text-xs opacity-65">{feedback.message}</p>}
        </div>
      </div>
      <div ref={exportRef} aria-hidden="true" className="flip-card pointer-events-none fixed left-[-10000px] top-0 z-[-1] flex w-[600px] flex-col gap-3 bg-[#eef1f4] p-10 text-[#26333a]">
        <CardFacesExport template={template} profile={profile} texture={texture} publicCode={publicCode} />
      </div>
    </>
  )
}

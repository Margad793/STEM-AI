import { Leaf } from 'lucide-react'

export function EcoImpact({
  tapCount,
  language,
  error,
  compact = false,
}: {
  tapCount: number | null
  language: 'en' | 'mn'
  error?: string
  compact?: boolean
}) {
  const count = tapCount ?? 0
  const savings = error
    ? language === 'en' ? 'Impact unavailable' : 'Нөлөөллийн тоо боломжгүй'
    : tapCount === null
      ? language === 'en' ? '— taps · — L water saved' : '— товшилт · — л ус хэмнэв'
      : language === 'en'
        ? `${count.toLocaleString()} taps · ~${(count * 2).toLocaleString()} L water saved`
        : `${count.toLocaleString()} товшилт · ~${(count * 2).toLocaleString()} л ус хэмнэв`

  return (
    <p
      role={error ? 'status' : undefined}
      title={error || (language === 'en' ? 'Estimated water savings: about 2 L per card visit' : 'Ойролцоогоор нэг нээлтэд 2 л ус хэмнэнэ')}
      className={`inline-flex max-w-full items-center rounded-full border font-semibold leading-tight ${
        compact
          ? 'gap-0 px-1 py-[2px] text-[6px]'
          : 'gap-0.5 px-1.5 py-0.5 text-[8px] sm:gap-1 sm:px-2 sm:py-1 sm:text-[10px]'
      } ${
        error
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800'
      }`}
    >
      {!error && <Leaf size={compact ? 7 : 9} className={`shrink-0 text-emerald-600 ${compact ? '' : 'sm:size-[11px]'}`} aria-hidden="true" />}
      {savings}
    </p>
  )
}

export function EcoImpact({
  tapCount,
  language,
  error,
}: {
  tapCount: number | null
  language: 'en' | 'mn'
  error?: string
}) {
  const count = tapCount ?? 0
  const savings = tapCount === null
    ? '— sheets · — L saved'
    : `~${(count * 10).toLocaleString()} sheets · ~${(count * 2).toLocaleString()} L saved`

  return (
    <p
      title={error || (language === 'en' ? 'Estimated savings: 10 sheets ≈ 2 L water per card visit' : 'Нэг нээлтэд 10 хуудас ≈ 2 л ус хэмнэнэ гэсэн ойролцоо тооцоо')}
      className="max-w-full truncate text-right text-[9px] font-medium leading-tight text-current/60 sm:text-[10px]"
    >
      {savings}
    </p>
  )
}

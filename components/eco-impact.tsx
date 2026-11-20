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

  return (
    <div className="rounded-xl border border-[#dfe9df] bg-[#f7fbf7] p-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-xs font-semibold text-[#3f6a4d]">
          {language === 'en' ? 'Eco / Paper-saving impact' : 'Ногоон / Цаас хэмнэх нөлөө'}
        </p>
        <p className="text-[11px] text-[#6f8175]">
          {language === 'en' ? '10 sheets ≈ 2 L water' : '10 хуудас ≈ 2 л ус'}
        </p>
      </div>
      <p className="mt-1 text-xs text-[#6f8175]">
        {language === 'en' ? 'Each public card visit from NFC, QR or link counts automatically' : 'NFC, QR эсвэл холбоосоор нийтийн картыг нээх бүр автоматаар тоологдоно'}
      </p>
      <p className="mt-3 text-sm font-semibold text-[#31533d]">
        {tapCount === null
          ? language === 'en' ? 'Loading tap count...' : 'Товшилтын тоо ачаалж байна...'
          : language === 'en'
            ? `${count.toLocaleString()} card taps · ~${(count * 10).toLocaleString()} sheets and ~${(count * 2).toLocaleString()} L of water saved`
            : `${count.toLocaleString()} товшилт · ~${(count * 10).toLocaleString()} цаас, ~${(count * 2).toLocaleString()} литр ус хэмнэсэн`}
      </p>
      {error && <p role="status" className="mt-2 text-xs text-amber-800">{error}</p>}
    </div>
  )
}

// The organization card's contact block has room for a fixed number of rows,
// but the rows themselves come and go — an empty field or a hidden toggle
// (phone, room number, email, website) simply drops out. Rows therefore keep
// a shared, modest spacing and the whole group stays centered in its band:
// whatever is present reads as one even block with equal room above and
// below, instead of leaving a hole where a missing row used to be.
const CONTACT_ROW_GAP_RATIO = 0.35

export function packContactRows(container: HTMLElement) {
  const rows = Array.from(container.children) as HTMLElement[]
  if (!rows.length) return
  // Measure the rows at their natural height first. A gap left over from a
  // previous pass makes flexbox squeeze the rows, and measuring that squeezed
  // height would hide the overflow and keep a gap that no longer fits.
  // Heights come from getBoundingClientRect (fractional) because offsetHeight
  // rounds down — a fraction of a pixel per row adds up to real overflow on a
  // small card. clientHeight of the band is floored, which is the safe
  // direction: it can only make the block a touch tighter, never larger.
  rows.forEach((row) => { row.style.flexShrink = '0' })
  const rowSize = parseFloat(getComputedStyle(container).fontSize) || 0
  const contentHeight = rows.reduce((total, row) => total + row.getBoundingClientRect().height, 0)
  const free = container.clientHeight - contentHeight
  if (free < 0) {
    // The rows alone do not fit the band (a full block, or a wrapped
    // location): no gap, packed from the top, and the rows compress exactly
    // like they always did when the block was full.
    container.style.justifyContent = 'flex-start'
    container.style.gap = '0px'
    rows.forEach((row) => { row.style.flexShrink = '' })
    return
  }
  container.style.justifyContent = 'center'
  container.style.gap = rows.length > 1
    ? `${Math.min(CONTACT_ROW_GAP_RATIO * rowSize, free / (rows.length - 1))}px`
    : '0px'
}

export function fitText(element: HTMLElement, maxLines: number) {
  if (!element.clientWidth) return
  element.style.fontSize = ''
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  // Elements marked with data-fit-split (the organization name) stay on a
  // single line while they fit and split into two balanced lines at a word
  // boundary once they do not — never mid-word. The split happens before the
  // per-line measuring below, so each resulting line is then fitted on its own.
  const splitTarget = Number(element.dataset.fitSplit) || 0
  if (splitTarget > 1 && context && !(element.textContent || '').includes('\n')) {
    const style = getComputedStyle(element)
    const text = (element.textContent || '').trim()
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length > 1) {
      context.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
      const letterSpacing = parseFloat(style.letterSpacing) || 0
      const fullWidth = context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing
      if (fullWidth > element.clientWidth) {
        // Pick the word boundary closest to the middle of the total length so
        // the two lines end up as balanced as possible.
        const total = words.reduce((sum, word) => sum + word.length, 0)
        let bestIndex = 1
        let bestDiff = Infinity
        let length = 0
        for (let index = 0; index < words.length - 1; index += 1) {
          length += words[index].length
          const diff = Math.abs(total - 2 * length)
          if (diff < bestDiff) {
            bestDiff = diff
            bestIndex = index + 1
          }
        }
        element.textContent = `${words.slice(0, bestIndex).join(' ')}\n${words.slice(bestIndex).join(' ')}`
      }
    }
  }

  // Text with explicit line breaks (the split name lines) must keep every
  // logical line on a single visual line, so the widest line decides the font
  // size. Wrapping multi-line text is allowed to flow onto up to maxLines
  // visual lines first — it only shrinks once the content no longer fits
  // within those lines (checked via scrollHeight).
  const explicitLines = (element.textContent || '').split('\n')

  for (let pass = 0; pass < 10; pass += 1) {
    const style = getComputedStyle(element)
    const fontSize = parseFloat(style.fontSize)
    let scale = 1

    if (context) {
      context.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
      const letterSpacing = parseFloat(style.letterSpacing) || 0
      const widthOf = (text: string) => context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing
      if (explicitLines.length > 1) {
        const widestLine = Math.max(...explicitLines.map(widthOf))
        if (widestLine > element.clientWidth) scale = (element.clientWidth * 0.98) / widestLine
      } else if (maxLines <= 1 && element.scrollWidth > element.clientWidth) {
        const fullWidth = widthOf(element.textContent || '')
        if (fullWidth > element.clientWidth) scale = (element.clientWidth * 0.98) / fullWidth
      }
    } else if (element.scrollWidth > element.clientWidth) {
      scale = (element.clientWidth * 0.98) / element.scrollWidth
    }

    if (maxLines > 1 && element.scrollHeight > element.clientHeight && element.clientHeight > 0) {
      scale = Math.min(scale, Math.sqrt(element.clientHeight / element.scrollHeight))
    }

    if (scale > 0.999) break
    element.style.fontSize = `${fontSize * scale}px`
  }
}

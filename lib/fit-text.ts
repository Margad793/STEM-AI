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

export function fitText(element: HTMLElement, maxLines: number) {
  if (!element.clientWidth) return
  element.style.fontSize = ''
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  for (let pass = 0; pass < 10; pass += 1) {
    const style = getComputedStyle(element)
    const fontSize = parseFloat(style.fontSize)
    let scale = 1

    if (context) {
      context.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
      const textWidth = context.measureText(element.textContent || '').width
      const letterSpacing = parseFloat(style.letterSpacing) || 0
      const spacedWidth = textWidth + Math.max(0, (element.textContent || '').length - 1) * letterSpacing
      if (spacedWidth > element.clientWidth) scale = (element.clientWidth * 0.98) / spacedWidth
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

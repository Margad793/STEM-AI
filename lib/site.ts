const defaultSiteOrigin = 'https://cardliy.com'

export function getPublicSiteOrigin(configuredOrigin?: string): string {
  const origin = configuredOrigin?.trim() || defaultSiteOrigin
  try {
    const url = new URL(origin)
    if (url.hostname === 'cardly.com' || url.hostname === 'www.cardly.com') {
      url.hostname = url.hostname.replace('cardly.com', 'cardliy.com')
    }
    return url.toString().replace(/\/$/, '')
  } catch {
    return origin.replace(/\/$/, '')
  }
}

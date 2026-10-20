import type { CardDesign, Template, Texture } from './card-types'

export type OrganizationAssets = {
  code: string
  patternSrc: string
  nameColor?: string
}

// Registered organization codes live here; entering a matching code in the
// editor swaps the card to that organization's unique design.
const organizationAssets: OrganizationAssets[] = [
  { code: 'muls26', patternSrc: '/assets/orgs/muls26/pattern.png', nameColor: '#1F4D2B' },
]

export const ORGANIZATION_PATTERN_WIDTH = '14.5%'
// Back face: the same strip runs down the left edge there, so every text on
// the back (header, contact rows, location, scan line) is pushed to the right
// of it instead of sitting on top of the green. The card box carries 12u of
// padding, so 37u of extra left padding lands the text at 49u from the card
// edge — the 14.5% (≈42.9u) strip plus a 6u breathing gap. Only applied when
// an organization design is active.
export const ORGANIZATION_BACK_CONTENT_LEFT = 'calc(37 * var(--u))'
// Organization card front layout, all percentages of the card box (aspect 1.7).
//
// Logo badge: a circle as wide as 14.5% of the card (≈24% of its height),
// vertically centered at 23% so its edges land at 11%–35%, centered
// horizontally on the right edge of the green strip (7% + 14.5%/2 = 14.5%) —
// half of it covers the strip and half sits on the white area.
export const ORGANIZATION_LOGO_DIAMETER = '14.5%'
export const ORGANIZATION_LOGO_LEFT = '7%'
export const ORGANIZATION_LOGO_TOP = '11%'
// Organization name: two lines at ~3.2% of card width (bold, uppercase,
// leading ~1.05), running from 24% to 80% (20% margin on the right) inside
// the 18%–28% vertical band, sharing its 23% vertical center with the logo.
export const ORGANIZATION_COMPANY_LEFT = '24%'
export const ORGANIZATION_COMPANY_RIGHT = '20%'
export const ORGANIZATION_COMPANY_TOP = '18%'
export const ORGANIZATION_COMPANY_HEIGHT = '10%'
// Person's text column: starts 54% from the left edge and stops 10% before
// the right edge. Every text in it (name, job title, contacts) shares that
// 54%–90% band and shrinks dynamically (data-fit) when it would not fit. The
// name block (bold, ~4% of card width, up to 2 lines, leading ~1.18) starts at
// 34%, the job title (~2.6% of card width, regular) at 49% — about 2% below
// the name — and the contact block (~2.5% of card width, leading ~1.12) fills
// 63.5%–91%, leaving 9% above the bottom edge. Name, job title and contacts
// all share the same left line. Only the location may wrap onto a second
// line; the other contact rows stay on one line and shrink instead.
export const ORGANIZATION_TEXT_LEFT = '54%'
export const ORGANIZATION_TEXT_RIGHT = '10%'
export const ORGANIZATION_PERSON_NAME_TOP = '34%'
export const ORGANIZATION_TITLE_TOP = '49%'
export const ORGANIZATION_CONTACTS_TOP = '63.5%'
export const ORGANIZATION_CONTACTS_BOTTOM = '9%'
// Profile photo: sits left of the text column and spans vertically from the
// top edge of the name block (34%) to the bottom edge of the job title (53%),
// so its diameter is 19% of the card height; its right edge stops 7u (≈2.4%)
// before the shared 54% left line.
export const ORGANIZATION_AVATAR_TOP = '34%'
export const ORGANIZATION_AVATAR_HEIGHT = '19%'
export const ORGANIZATION_AVATAR_RIGHT = '48.4%'

export function getOrganizationAssets(design: CardDesign | null | undefined): OrganizationAssets | null {
  const code = (design?.organizationCode ?? '').trim().toLowerCase()
  if (!code) return null
  return organizationAssets.find((item) => item.code === code) ?? null
}

export const textures: { id: Texture; name: string; mnName: string; description: string; mnDescription: string }[] = [
  { id: 'holographic', name: 'CD Iridescent / Holographic', mnName: 'Солонгорсон голографик', description: 'Microscopic grooves with a soft iridescent sheen.', mnDescription: 'Нарийн ховилтой, зөөлөн солонгорсон өнгөлгөө.' },
  { id: 'arcs', name: 'Geometric Arcs', mnName: 'Геометр нум', description: 'Elegant static arcs at the corners of the card.', mnDescription: 'Картын буланг чимэх дэгжин геометр нум.' },
  { id: 'matte', name: 'Clean Matte', mnName: 'Матт гадаргуу', description: 'Flat, smooth, non-reflective surface.', mnDescription: 'Гөлгөр, гялбаагүй энгийн гадаргуу.' },
  { id: 'metal', name: 'Carbon / Brushed Metal', mnName: 'Карбон / металл', description: 'Luxury brushed steel or carbon micro-texture.', mnDescription: 'Сойздон өнгөлсөн ган эсвэл карбоны тансаг бичил хээ.' },
  { id: 'carbon-wave', name: 'Carbon Wave Lines', mnName: 'Карбон долгионт зураас', description: 'Flowing engraved lines over a carbon finish.', mnDescription: 'Карбон гадаргуу дээрх урсгал мэт долгионт сийлбэртэй зураас.' },
]

export function getCarbonWaveTextureImage(templateName: string) {
  const lightSurface = templateName === 'Minimalist Classic' || templateName === 'Soft Feminine Pastel'
  const palette = templateName === 'Minimalist Classic'
    ? 'linear-gradient(118deg, #eeeae4 0%, #aeb5b9 22%, #f7f4ee 42%, #89939b 63%, #e5e1da 100%)'
    : templateName === 'Soft Feminine Pastel'
      ? 'linear-gradient(118deg, #f6d9df 0%, #bc929e 22%, #f9e8eb 43%, #a97584 64%, #f2d9df 100%)'
      : templateName === 'Modern Executive'
        ? 'linear-gradient(118deg, #17253a 0%, #62748b 22%, #263952 44%, #8392a4 63%, #1c2b40 100%)'
        : templateName === 'Creative Glass'
          ? 'linear-gradient(118deg, #33294f 0%, #72778a 22%, #3c4864 44%, #788b91 63%, #49365f 100%)'
          : 'linear-gradient(118deg, #101419 0%, #58616b 20%, #161b21 42%, #74808b 58%, #14191f 78%, #333c46 100%)'
  const highlight = lightSurface ? 'rgba(255,255,255,.56)' : 'rgba(255,255,255,.4)'
  const shadow = lightSurface ? 'rgba(34,43,52,.34)' : 'rgba(0,0,0,.5)'
  const wave = `repeating-radial-gradient(ellipse 150% 78% at 0% 52%, transparent 0 8px, ${highlight} 9px 10px, ${shadow} 11px 12px, transparent 13px 20px)`
  const brushed = `repeating-linear-gradient(112deg, rgba(255,255,255,.13) 0 1px, transparent 1px 3px, rgba(0,0,0,${lightSurface ? '.12' : '.2'}) 3px 4px, transparent 4px 7px)`
  return `${wave}, ${brushed}, ${palette}`
}

export function getCardTextureImage(template: Template, texture: Texture) {
  if (texture === 'carbon-wave') return getCarbonWaveTextureImage(template.name)
  if (texture === 'matte' || texture === 'arcs') return undefined
  if (texture === 'holographic') {
    if (template.name === 'Minimalist Classic') return 'linear-gradient(118deg, rgba(245,239,230,.95), rgba(198,185,210,.55) 38%, rgba(181,220,222,.48) 68%, rgba(247,220,190,.72)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.4) 0 1.5px, rgba(133,91,145,.14) 1.5px 3px, transparent 3px 5px), linear-gradient(32deg, rgba(238,160,202,.18), rgba(255,255,255,.2), rgba(91,210,211,.16))'
    if (template.name === 'Soft Feminine Pastel') return 'linear-gradient(118deg, rgba(255,220,228,.92), rgba(235,151,181,.7) 42%, rgba(250,194,211,.86) 72%, rgba(255,231,237,.9)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.5) 0 1.8px, rgba(150,65,105,.18) 1.8px 3.2px, transparent 3.2px 5px)'
    if (template.name === 'Creative Glass') return 'linear-gradient(118deg, rgba(65,28,112,.72), rgba(207,91,186,.46) 38%, rgba(54,190,210,.42) 70%, rgba(244,151,205,.48)), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.34) 0 1.4px, rgba(42,20,78,.12) 1.4px 2.8px, transparent 2.8px 5px), linear-gradient(32deg, rgba(120,72,210,.2), rgba(255,255,255,.14) 48%, rgba(64,214,220,.18))'
    const shade = template.name === 'Minimalist Classic' || template.name === 'Soft Feminine Pastel' ? '.28' : '.14'
    return `linear-gradient(rgba(28,20,52,${shade}), rgba(28,20,52,${shade})), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.22) 0 1px, transparent 1px 5px), linear-gradient(120deg, rgba(255,105,180,.28), rgba(80,210,255,.22), rgba(255,220,110,.22))`
  }
  if (template.name === 'Minimalist Classic') return 'linear-gradient(118deg, rgba(244,240,235,.98), rgba(235,230,224,.98) 48%, rgba(241,237,231,.98)), repeating-linear-gradient(115deg, rgba(70,48,66,1) 0 2.5px, rgba(255,255,255,.78) 2.5px 4px, transparent 4px 5px)'
  if (template.name === 'Soft Feminine Pastel') return 'linear-gradient(118deg, rgba(247,205,211,.9), rgba(224,143,169,.72) 48%, rgba(247,190,207,.86)), repeating-linear-gradient(115deg, rgba(255,255,255,.42) 0 1.5px, rgba(145,76,103,.16) 1.5px 3px, transparent 3px 5px)'
  if (template.name === 'Creative Glass') return 'linear-gradient(118deg, rgba(36,20,76,.78), rgba(187,91,190,.48) 42%, rgba(69,190,206,.42) 72%, rgba(225,128,194,.5)), repeating-linear-gradient(115deg, rgba(255,255,255,.36) 0 1.5px, rgba(35,20,70,.2) 1.5px 3px, transparent 3px 5px), repeating-linear-gradient(25deg, rgba(255,255,255,.18) 0 1px, transparent 1px 7px)'
  const shade = template.name === 'Minimalist Classic' || template.name === 'Soft Feminine Pastel' ? '.3' : '.16'
  return `linear-gradient(rgba(18,24,32,${shade}), rgba(18,24,32,${shade})), repeating-linear-gradient(115deg, rgba(255,255,255,.2) 0 1.5px, rgba(255,255,255,.03) 1.5px 3px, transparent 3px 5px), linear-gradient(135deg, rgba(30,40,50,.22), rgba(255,255,255,.12))`
}

export function getCardActionStyle(template: Template, texture: Texture, design?: CardDesign | null) {
  // Organization cards carry their own identity (white card with a dark green
  // accent), so their Call / Email / Save Contact actions use that palette
  // instead of the selected template's.
  const organization = getOrganizationAssets(design)
  if (organization) {
    return {
      backgroundColor: organization.nameColor ?? '#1F4D2B',
      backgroundImage: undefined,
      borderColor: 'rgba(38,51,58,.25)',
      color: '#ffffff',
    }
  }
  const templateBackground = template.name === 'Minimalist Classic'
    ? 'linear-gradient(135deg, #f4f0eb, #e5ded4)'
    : template.name === 'Luxury Dark & Gold'
      ? 'linear-gradient(135deg, #25272b, #111316)'
      : template.name === 'Soft Feminine Pastel'
        ? 'linear-gradient(135deg, #f7e5e5, #edcbd2)'
        : template.name === 'Modern Executive'
          ? 'linear-gradient(135deg, #263952, #172337)'
          : 'linear-gradient(135deg, #5142a4, #a34e9a)'
  const textureImage = getCardTextureImage(template, texture)
  const arcsOverlay = texture === 'arcs'
    ? 'radial-gradient(circle at 100% 0%, transparent 0 30px, rgba(255,255,255,.2) 31px 34px, transparent 35px), radial-gradient(circle at 0% 100%, transparent 0 24px, rgba(255,255,255,.14) 25px 28px, transparent 29px)'
    : undefined
  const backgroundImage = texture === 'carbon-wave'
    ? textureImage
    : [arcsOverlay, textureImage, templateBackground].filter(Boolean).join(', ')

  return {
    backgroundColor: template.name === 'Minimalist Classic'
      ? '#f4f0eb'
      : template.name === 'Soft Feminine Pastel'
        ? '#f7e5e5'
        : template.name === 'Modern Executive'
          ? '#1d2b42'
          : template.name === 'Creative Glass'
            ? '#5142a4'
            : '#15171b',
    backgroundImage,
    borderColor: `${template.textColor}40`,
    color: template.textColor,
  }
}

export const templates: Template[] = [
  { name: 'Minimalist Classic', mnName: 'Минималист сонгодог', description: 'Crisp paper and quiet elegance', mnDescription: 'Цэвэр цэмцгэр цаас, даруухан дэгжин төрх.', accent: '#9b6038', background: 'bg-[#f4f0eb]', ink: 'text-[#26333a]', textColor: '#26333a', preview: 'bg-[#f4f0eb]', publicBackground: 'bg-[#eef1f4]' },
  { name: 'Luxury Dark & Gold', mnName: 'Тансаг хар ба алт', description: 'Obsidian depth with gold details', mnDescription: 'Гүн хар өнгө, алтлаг чимэглэл.', accent: '#e2c27b', background: 'bg-[#15171b]', ink: 'text-[#f7efe1]', textColor: '#f7efe1', preview: 'bg-[#15171b]', publicBackground: 'bg-gradient-to-br from-[#f4f1ec] via-[#ebe7df] to-[#dcd8d0]' },
  { name: 'Soft Feminine Pastel', mnName: 'Зөөлөн пастел', description: 'Blush tones and rounded warmth', mnDescription: 'Ягаан туяа, зөөлөн дулаан өнгө.', accent: '#b86173', background: 'bg-[#f7e5e5]', ink: 'text-[#573b48]', textColor: '#573b48', preview: 'bg-[#f7e5e5]', publicBackground: 'bg-gradient-to-br from-[#fff7f5] via-[#f8e8ea] to-[#f1d9df]' },
  { name: 'Modern Executive', mnName: 'Орчин үеийн удирдлага', description: 'Sharp navy structure for leaders', mnDescription: 'Удирдах албан тушаалтанд зориулсан цэгцтэй хөх загвар.', accent: '#a9c8f4', background: 'bg-[#1d2b42]', ink: 'text-white', textColor: '#ffffff', preview: 'bg-[#1d2b42]', publicBackground: 'bg-gradient-to-br from-[#eef3f8] via-[#e6edf5] to-[#d8e1ec]' },
  { name: 'Creative Glass', mnName: 'Бүтээлч шилэн', description: 'Vibrant gradient with glass texture', mnDescription: 'Шилэн хээтэй, тод өнгийн уусалт.', accent: '#b8fff1', background: 'bg-gradient-to-br from-[#5142a4] to-[#e58bca]', ink: 'text-white', textColor: '#ffffff', preview: 'bg-gradient-to-br from-[#5142a4] to-[#e58bca]', publicBackground: 'bg-gradient-to-br from-[#edf2ff] via-[#f4eefc] to-[#fbeaf5]' },
]

export const templateSlugs = ['minimalist-classic', 'luxury-dark-gold', 'soft-feminine-pastel', 'modern-executive', 'creative-glass']

import type { Template, Texture } from './card-types'

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

export const templates: Template[] = [
  { name: 'Minimalist Classic', mnName: 'Минималист сонгодог', description: 'Crisp paper and quiet elegance', mnDescription: 'Цэвэр цэмцгэр цаас, даруухан дэгжин төрх.', accent: '#9b6038', background: 'bg-[#f4f0eb]', ink: 'text-[#26333a]', textColor: '#26333a', preview: 'bg-[#f4f0eb]', publicBackground: 'bg-[#eef1f4]' },
  { name: 'Luxury Dark & Gold', mnName: 'Тансаг хар ба алт', description: 'Obsidian depth with gold details', mnDescription: 'Гүн хар өнгө, алтлаг чимэглэл.', accent: '#e2c27b', background: 'bg-[#15171b]', ink: 'text-[#f7efe1]', textColor: '#f7efe1', preview: 'bg-[#15171b]', publicBackground: 'bg-gradient-to-br from-[#f4f1ec] via-[#ebe7df] to-[#dcd8d0]' },
  { name: 'Soft Feminine Pastel', mnName: 'Зөөлөн пастел', description: 'Blush tones and rounded warmth', mnDescription: 'Ягаан туяа, зөөлөн дулаан өнгө.', accent: '#b86173', background: 'bg-[#f7e5e5]', ink: 'text-[#573b48]', textColor: '#573b48', preview: 'bg-[#f7e5e5]', publicBackground: 'bg-gradient-to-br from-[#fff7f5] via-[#f8e8ea] to-[#f1d9df]' },
  { name: 'Modern Executive', mnName: 'Орчин үеийн удирдлага', description: 'Sharp navy structure for leaders', mnDescription: 'Удирдах албан тушаалтанд зориулсан цэгцтэй хөх загвар.', accent: '#a9c8f4', background: 'bg-[#1d2b42]', ink: 'text-white', textColor: '#ffffff', preview: 'bg-[#1d2b42]', publicBackground: 'bg-gradient-to-br from-[#eef3f8] via-[#e6edf5] to-[#d8e1ec]' },
  { name: 'Creative Glass', mnName: 'Бүтээлч шилэн', description: 'Vibrant gradient with glass texture', mnDescription: 'Шилэн хээтэй, тод өнгийн уусалт.', accent: '#b8fff1', background: 'bg-gradient-to-br from-[#5142a4] to-[#e58bca]', ink: 'text-white', textColor: '#ffffff', preview: 'bg-gradient-to-br from-[#5142a4] to-[#e58bca]', publicBackground: 'bg-gradient-to-br from-[#edf2ff] via-[#f4eefc] to-[#fbeaf5]' },
]

export const templateSlugs = ['minimalist-classic', 'luxury-dark-gold', 'soft-feminine-pastel', 'modern-executive', 'creative-glass']

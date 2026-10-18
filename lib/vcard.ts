type VCardData = {
  name: string
  company: string
  title: string
  phone?: string
  businessEmail?: string
  personalEmail?: string
  website?: string
  street?: string
  locality?: string
}

const foldPhotoLine = (line: string) => {
  const firstLineLength = 75 - 'PHOTO;ENCODING=b;TYPE=JPEG:'.length
  const chunks = [line.slice(0, firstLineLength)]
  for (let index = firstLineLength; index < line.length; index += 74) {
    chunks.push(` ${line.slice(index, index + 74)}`)
  }
  return chunks.join('\r\n')
}

const escapeVCardValue = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')

export async function encodeContactPhoto(photoUrl: string) {
  const response = await fetch(photoUrl)
  if (!response.ok) throw new Error(`Could not load the contact photo (${response.status}).`)

  const sourceBlob = await response.blob()
  if (!sourceBlob.type.startsWith('image/')) throw new Error('The contact photo is not a supported image.')

  const imageUrl = URL.createObjectURL(sourceBlob)
  try {
    const image = new Image()
    image.src = imageUrl
    await image.decode()

    const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare the contact photo.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const jpeg = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Could not encode the contact photo.')),
        'image/jpeg',
        0.82,
      )
    })
    const bytes = new Uint8Array(await jpeg.arrayBuffer())
    let binary = ''
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
    }
    return btoa(binary)
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export function createContactVCard({
  name,
  company,
  title,
  phone,
  businessEmail,
  personalEmail,
  website,
  street,
  locality,
}: VCardData, photoBase64?: string) {
  const nameParts = name.trim().split(/\s+/).filter(Boolean)
  const familyName = nameParts.length > 1 ? nameParts.pop()! : ''
  const givenName = nameParts.join(' ') || name.trim()
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCardValue(familyName)};${escapeVCardValue(givenName)};;;`,
    `FN:${escapeVCardValue(name)}`,
    ...(company.trim() ? [`ORG:${escapeVCardValue(company)}`] : []),
    ...(title.trim() ? [`TITLE:${escapeVCardValue(title)}`] : []),
    ...(photoBase64 ? [foldPhotoLine(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`)] : []),
    ...(phone?.trim() ? [`TEL;TYPE=CELL:${escapeVCardValue(phone)}`] : []),
    ...(businessEmail?.trim() ? [`EMAIL;TYPE=WORK:${escapeVCardValue(businessEmail)}`] : []),
    ...(personalEmail?.trim() ? [`EMAIL;TYPE=HOME:${escapeVCardValue(personalEmail)}`] : []),
    ...(website?.trim() ? [`URL:${escapeVCardValue(website)}`] : []),
    ...(street?.trim() || locality?.trim()
      ? [`ADR;TYPE=WORK:;;${escapeVCardValue(street ?? '')};${escapeVCardValue(locality ?? '')};;;`]
      : []),
    'END:VCARD',
  ]
  return lines.join('\r\n')
}

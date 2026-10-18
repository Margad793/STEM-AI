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

const escapeVCardValue = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')

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
}: VCardData) {
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

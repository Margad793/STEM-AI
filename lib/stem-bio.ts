export type StemBioInput = {
  fullName: string
  jobTitle: string
  company: string
  location: string
  researchHighlight: string
}

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '')
}

function fitToLength(value: string, maxLength: number) {
  if (value.length <= maxLength) return value
  const clipped = value.slice(0, Math.max(0, maxLength - 1))
  const lastSpace = clipped.lastIndexOf(' ')
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`
}

export function generateLocalStemBio(input: StemBioInput) {
  const name = clean(input.fullName)
  const title = clean(input.jobTitle)
  const company = clean(input.company)
  const location = clean(input.location)
  const highlight = clean(input.researchHighlight)
  const article = /^[aeiou]/i.test(title) ? 'an' : 'a'
  const identity = name
    ? `${name}${title ? ` is ${article} ${title}` : ' is a STEM professional'}`
    : title ? `${article[0].toUpperCase()}${article.slice(1)} ${title}` : 'A STEM professional'
  const affiliation = company ? ` at ${company}` : ''
  const locationText = location ? `, based in ${location}` : ''
  let firstSentence = `${identity}${affiliation}${locationText}.`
  let secondSentence = highlight
    ? `Their research focuses on ${highlight}.`
    : 'They build practical STEM solutions and welcome collaboration.'

  if (firstSentence.length + secondSentence.length + 1 > 239 && locationText) {
    firstSentence = `${identity}${affiliation}.`
  }
  if (firstSentence.length >= 180) {
    firstSentence = `${fitToLength(`${identity}${affiliation}`, 178)}.`
  }

  secondSentence = fitToLength(secondSentence, Math.max(1, 239 - firstSentence.length - 1))
  return `${firstSentence} ${secondSentence}`
}

'use client'

import { FlipCard } from '@/components/business-card'
import { templates } from '@/lib/card-design'
import type { CardDesign, Profile } from '@/lib/card-types'

const profile: Profile = {
  name: 'Alex Morgan',
  title: 'Creative Director',
  company: 'Northstar Studio',
  location: 'Brooklyn, NY',
  bio: '',
  businessEmail: 'alex@northstar.co',
  personalEmail: '',
  showPhone: true,
  showBusinessEmail: true,
  showPersonalEmail: false,
  showRoomNumber: false,
  showWebsite: true,
  showInstagram: false,
  showFacebook: false,
  showViber: false,
  phone: '+1 917 555 0184',
  roomNumber: '',
  website: 'alexmorgan.co',
  instagram: '',
  facebook: '',
  viber: '',
  photo: '',
  companyLogo: '',
}

const t = { save: 'Save', scan: 'Scan to connect', flip: 'Flip card' }

const cases: { label: string; design: CardDesign }[] = [
  { label: 'legacy', design: { colorId: null, patternId: null, organizationCode: '' } },
  { label: 'muls26', design: { colorId: null, patternId: null, organizationCode: 'MULS26' } },
  { label: 'muls26-lowercase', design: { colorId: null, patternId: null, organizationCode: 'muls26' } },
  { label: 'unknown-org', design: { colorId: null, patternId: null, organizationCode: 'unknown' } },
  { label: 'muls26+burgundy+dots', design: { colorId: 'burgundy', patternId: 'dots', organizationCode: 'muls26' } },
]

export default function DevCardPreview() {
  return (
    <main style={{ background: '#eef1f4' }} className="flex flex-wrap content-start gap-6 p-6">
      {cases.map((item) => (
        <section key={item.label} data-case={item.label} style={{ width: 380 }}>
          <p style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.label}</p>
          <FlipCard template={templates[0]} profile={profile} t={t} texture="arcs" publicCode="abc1234567" design={item.design} />
        </section>
      ))}
    </main>
  )
}

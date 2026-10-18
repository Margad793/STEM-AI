export type Profile = {
  name: string
  title: string
  company: string
  location: string
  bio: string
  businessEmail: string
  personalEmail: string
  showPhone: boolean
  showBusinessEmail: boolean
  showPersonalEmail: boolean
  showRoomNumber: boolean
  showWebsite: boolean
  showInstagram: boolean
  showFacebook: boolean
  showViber: boolean
  phone: string
  roomNumber: string
  website: string
  instagram: string
  facebook: string
  viber: string
  photo: string
  companyLogo: string
}

export type Template = {
  name: string
  mnName: string
  description: string
  mnDescription: string
  accent: string
  background: string
  ink: string
  textColor: string
  preview: string
  publicBackground: string
}

export type Texture = 'holographic' | 'arcs' | 'matte' | 'metal'

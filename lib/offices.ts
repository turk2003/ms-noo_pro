export const OFFICE_SLUGS = ['pea-kla', 'pea-pld'] as const

export type OfficeSlug = (typeof OFFICE_SLUGS)[number]

export type Office = {
  slug: OfficeSlug
  code: string
  name: string
  logo: string
  logoAlt: string
  logoPosition: string
}

export const OFFICES: Record<OfficeSlug, Office> = {
  'pea-kla': {
    slug: 'pea-kla',
    code: 'KLA',
    name: 'การไฟฟ้าส่วนภูมิภาค KLA',
    logo: '/office-kla.png',
    logoAlt: 'โลโก้ประจำการไฟฟ้า KLA',
    logoPosition: 'center 30%'
  },
  'pea-pld': {
    slug: 'pea-pld',
    code: 'PLD',
    name: 'การไฟฟ้าส่วนภูมิภาค PLD',
    logo: '/office-pld.png',
    logoAlt: 'โลโก้ประจำการไฟฟ้า PLD',
    logoPosition: '43% center'
  }
}

export function isOfficeSlug(value: string): value is OfficeSlug {
  return OFFICE_SLUGS.includes(value as OfficeSlug)
}

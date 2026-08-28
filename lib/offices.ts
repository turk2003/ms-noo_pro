export const OFFICE_SLUGS = [
  'pea-kla',
  'pea-pld',
  'pea-ban-chang',
  'pea-rayong',
  'pea-ban-khai',
  'pea-map-ta-phut'
] as const

export type OfficeSlug = (typeof OFFICE_SLUGS)[number]

export type Office = {
  slug: OfficeSlug
  code: string
  label: string
  name: string
  envPrefix: string
  logo?: string
  logoAlt?: string
  logoPosition?: string
}

export const OFFICES: Record<OfficeSlug, Office> = {
  'pea-kla': {
    slug: 'pea-kla',
    code: 'KLA',
    label: 'PEA KLA',
    name: 'การไฟฟ้าส่วนภูมิภาค KLA',
    envPrefix: 'PEA_KLA',
    logo: '/office-kla.png',
    logoAlt: 'โลโก้ประจำการไฟฟ้า KLA',
    logoPosition: 'center 30%'
  },
  'pea-pld': {
    slug: 'pea-pld',
    code: 'PLD',
    label: 'PEA PLD',
    name: 'การไฟฟ้าส่วนภูมิภาค PLD',
    envPrefix: 'PEA_PLD',
    logo: '/office-pld.png',
    logoAlt: 'โลโก้ประจำการไฟฟ้า PLD',
    logoPosition: '43% center'
  },
  'pea-ban-chang': {
    slug: 'pea-ban-chang',
    code: 'BAN_CHANG',
    label: 'PEA บ้านฉาง',
    name: 'การไฟฟ้าส่วนภูมิภาคบ้านฉาง',
    envPrefix: 'PEA_BAN_CHANG'
  },
  'pea-rayong': {
    slug: 'pea-rayong',
    code: 'RAYONG',
    label: 'PEA ระยอง',
    name: 'การไฟฟ้าส่วนภูมิภาคระยอง',
    envPrefix: 'PEA_RAYONG'
  },
  'pea-ban-khai': {
    slug: 'pea-ban-khai',
    code: 'BAN_KHAI',
    label: 'PEA บ้านค่าย',
    name: 'การไฟฟ้าส่วนภูมิภาคบ้านค่าย',
    envPrefix: 'PEA_BAN_KHAI'
  },
  'pea-map-ta-phut': {
    slug: 'pea-map-ta-phut',
    code: 'MAP_TA_PHUT',
    label: 'PEA มาบตาพุด',
    name: 'การไฟฟ้าส่วนภูมิภาคมาบตาพุด',
    envPrefix: 'PEA_MAP_TA_PHUT'
  }
}

export function isOfficeSlug(value: string): value is OfficeSlug {
  return OFFICE_SLUGS.includes(value as OfficeSlug)
}

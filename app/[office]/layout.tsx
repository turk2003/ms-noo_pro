import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OfficeProvider from '@/components/OfficeProvider'
import { isOfficeSlug, OFFICES } from '@/lib/offices'

type Props = {
  children: React.ReactNode
  params: Promise<{ office: string }>
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { office } = await params
  if (!isOfficeSlug(office)) return {}

  return {
    title: `ระบบเบิกอุปกรณ์ ${OFFICES[office].label}`,
    description: OFFICES[office].name
  }
}

export default async function OfficeLayout({ children, params }: Props) {
  const { office } = await params

  if (!isOfficeSlug(office)) notFound()

  return (
    <OfficeProvider office={OFFICES[office]}>
      {children}
    </OfficeProvider>
  )
}

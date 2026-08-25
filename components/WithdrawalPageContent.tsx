'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { useOffice } from '@/components/OfficeProvider'

const EquipmentForm = dynamic(() => import('@/components/EquipmentForm'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading...</div>
})

export default function Home() {
  const router = useRouter()
  const { office } = useOffice()

  const handleSuccess = () => {
    router.push(`/${office.slug}`)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-16 px-6">
        <div className="max-w-xl mx-auto">
          <EquipmentForm onSuccess={handleSuccess} />
        </div>
      </div>
    </>
  )
}

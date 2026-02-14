'use client'

import { useState } from 'react'
import EquipmentSummary from '@/components/EquipmentSummary'
import Navbar from '@/components/Navbar'

export default function SummaryPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <EquipmentSummary refresh={refreshKey} />
        </div>
      </div>
    </>
  )
}

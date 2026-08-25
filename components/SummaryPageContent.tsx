import EquipmentSummary from '@/components/EquipmentSummary'
import Navbar from '@/components/Navbar'

export default function SummaryPageContent() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <EquipmentSummary refresh={0} />
        </div>
      </div>
    </>
  )
}

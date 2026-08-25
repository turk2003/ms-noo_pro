'use client'

import { useCallback, useEffect, useState } from 'react'
import { useOffice } from '@/components/OfficeProvider'

export default function TestConnection() {
  const { supabase } = useOffice()
  const [status, setStatus] = useState<{
    employees: number
    equipmentItems: number
    error?: string
  } | null>(null)

  const testConnection = useCallback(async () => {
    try {
      // นับจำนวนพนักงาน
      const { count: empCount, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })

      // นับจำนวนอุปกรณ์
      const { count: equipCount, error: equipError } = await supabase
        .from('equipment_items')
        .select('*', { count: 'exact', head: true })

      if (empError || equipError) {
        setStatus({ 
          employees: 0, 
          equipmentItems: 0, 
          error: empError?.message || equipError?.message 
        })
      } else {
        setStatus({ 
          employees: empCount || 0, 
          equipmentItems: equipCount || 0 
        })
      }
    } catch (error) {
      console.error('Connection test error:', error)
      setStatus({ 
        employees: 0, 
        equipmentItems: 0, 
        error: (error as Error).message 
      })
    }
  }, [supabase])

  useEffect(() => {
    // การทดสอบนี้ตั้งใจเริ่ม query หลัง component mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void testConnection()
  }, [testConnection])

  if (!status) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700">กำลังตรวจสอบการเชื่อมต่อ...</p>
      </div>
    )
  }

  if (status.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-red-700 mb-2">⚠️ เกิดข้อผิดพลาด</p>
        <p className="text-xs text-red-600">{status.error}</p>
        <p className="text-xs text-red-600 mt-2">
          กรุณาตรวจสอบว่าได้รัน SQL สร้างตารางในฐานข้อมูลแล้ว
        </p>
      </div>
    )
  }

  if (status.employees === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-yellow-700 mb-2">⚠️ ยังไม่มีข้อมูลพนักงาน</p>
        <p className="text-xs text-yellow-600">
          กรุณารัน SQL ในไฟล์ <code className="bg-yellow-100 px-1 py-0.5 rounded">insert-employees.sql</code> 
          {' '}หรือ <code className="bg-yellow-100 px-1 py-0.5 rounded">supabase-new-schema.sql</code>
        </p>
        <p className="text-xs text-yellow-600 mt-2">
          📁 อุปกรณ์ในระบบ: {status.equipmentItems} รายการ
        </p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <p className="text-sm font-semibold text-green-700 mb-2">✅ เชื่อมต่อฐานข้อมูลสำเร็จ</p>
      <div className="text-xs text-green-600 space-y-1">
        <p>👤 พนักงานในระบบ: {status.employees} คน</p>
        <p>📦 อุปกรณ์ในระบบ: {status.equipmentItems} รายการ</p>
      </div>
    </div>
  )
}

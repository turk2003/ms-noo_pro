'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import EmployeeManagement from '@/components/admin/EmployeeManagement'
import ItemManagement from '@/components/admin/ItemManagement'
import { Users, Package, X } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'employees' | 'items'>('employees')
  const [showModal, setShowModal] = useState(true)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // ตรวจสอบว่าเคยผ่านการตรวจสอบแล้วหรือไม่
    const authorized = sessionStorage.getItem('admin_authorized')
    if (authorized === 'true') {
      setIsAuthorized(true)
      setShowModal(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim() === '12') {
      setIsAuthorized(true)
      setShowModal(false)
      setError('')
      sessionStorage.setItem('admin_authorized', 'true')
    } else {
      setError('คำตอบไม่ถูกต้อง ลองใหม่อีกครั้ง!')
      setAnswer('')
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  if (!isAuthorized) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🤔</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    คำถามพิเศษ
                  </h2>
                  <p className="text-lg text-gray-700 font-medium">
                    ปีนี้น้องเติร์กควรได้กี่%
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => {
                        setAnswer(e.target.value)
                        setError('')
                      }}
                      placeholder="กรอกคำตอบ..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg"
                      autoFocus
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-1">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      ตรวจสอบ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">ระบบจัดการข้อมูล</h1>
            <p className="text-xs sm:text-sm text-gray-600">จัดการข้อมูลพนักงานและอุปกรณ์</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'employees'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">จัดการ</span>พนักงาน
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'items'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">จัดการ</span>อุปกรณ์
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'employees' && <EmployeeManagement />}
            {activeTab === 'items' && <ItemManagement />}
          </div>
        </div>
      </div>
    </>
  )
}

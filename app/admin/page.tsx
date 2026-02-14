'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import EmployeeManagement from '@/components/admin/EmployeeManagement'
import ItemManagement from '@/components/admin/ItemManagement'
import { Users, Package } from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'items'>('employees')

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ระบบจัดการข้อมูล</h1>
            <p className="text-sm text-gray-600">จัดการข้อมูลพนักงานและอุปกรณ์</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'employees'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                จัดการพนักงาน
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'items'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5" />
                จัดการอุปกรณ์
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

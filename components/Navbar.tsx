'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, FileText, BarChart3, Settings } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">
              ระบบเบิกอุปกรณ์
            </h1>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2">
            <Link
              href="/"
              className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                pathname === '/'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">เบิก-คืน</span>
            </Link>
            <Link
              href="/summary"
              className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                pathname === '/summary'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">สรุปรายการ</span>
            </Link>
            <Link
              href="/admin"
              className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                pathname === '/admin'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getOfficeSupabaseClient } from '@/lib/supabase'
import type { Office } from '@/lib/offices'

type OfficeContextValue = {
  office: Office
  supabase: SupabaseClient
}

const OfficeContext = createContext<OfficeContextValue | null>(null)

type Props = {
  office: Office
  children: ReactNode
}

export default function OfficeProvider({ office, children }: Props) {
  const supabase = useMemo(() => getOfficeSupabaseClient(office.slug), [office.slug])

  if (!supabase) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl overflow-hidden rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">ยังไม่ได้ตั้งค่าฐานข้อมูล {office.label}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">กรุณาเพิ่มตัวแปรต่อไปนี้:</p>
          <div className="mt-3 space-y-2">
            <code className="block break-all rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
              NEXT_PUBLIC_{office.envPrefix}_SUPABASE_URL
            </code>
            <code className="block break-all rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
              NEXT_PUBLIC_{office.envPrefix}_SUPABASE_ANON_KEY
            </code>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            บันทึกค่าแล้วเริ่มแอปใหม่อีกครั้ง
          </p>
        </div>
      </main>
    )
  }

  return (
    <OfficeContext.Provider value={{ office, supabase }}>
      {children}
    </OfficeContext.Provider>
  )
}

export function useOffice() {
  const context = useContext(OfficeContext)

  if (!context) {
    throw new Error('useOffice ต้องถูกเรียกภายใน OfficeProvider')
  }

  return context
}

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
    const prefix = office.code === 'KLA' ? 'PEA_KLA' : 'PEA_PLD'

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">ยังไม่ได้ตั้งค่าฐานข้อมูล {office.code}</h1>
          <p className="mt-2 text-sm text-gray-600">
            กรุณาเพิ่มตัวแปร <code>NEXT_PUBLIC_{prefix}_SUPABASE_URL</code> และ{' '}
            <code>NEXT_PUBLIC_{prefix}_SUPABASE_ANON_KEY</code> แล้วเริ่มแอปใหม่
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

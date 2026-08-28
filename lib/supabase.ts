import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { OfficeSlug } from '@/lib/offices'

type SupabaseConfig = {
  url?: string
  anonKey?: string
}

const supabaseConfigs: Record<OfficeSlug, SupabaseConfig> = {
  'pea-kla': {
    // รองรับชื่อตัวแปรเดิมเพื่อให้ KLA ใช้งานต่อได้โดยไม่สะดุด
    url: process.env.NEXT_PUBLIC_PEA_KLA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PEA_KLA_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  'pea-pld': {
    url: process.env.NEXT_PUBLIC_PEA_PLD_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PEA_PLD_SUPABASE_ANON_KEY
  },
  'pea-ban-chang': {
    url: process.env.NEXT_PUBLIC_PEA_BAN_CHANG_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PEA_BAN_CHANG_SUPABASE_ANON_KEY
  },
  'pea-rayong': {
    url: process.env.NEXT_PUBLIC_PEA_RAYONG_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PEA_RAYONG_SUPABASE_ANON_KEY
  },
  'pea-ban-khai': {
    url: process.env.NEXT_PUBLIC_PEA_BAN_KHAI_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PEA_BAN_KHAI_SUPABASE_ANON_KEY
  },
  'pea-map-ta-phut': {
    url: process.env.NEXT_PUBLIC_PEA_MAP_TA_PHUT_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PEA_MAP_TA_PHUT_SUPABASE_ANON_KEY
  }
}

const clients = new Map<OfficeSlug, SupabaseClient>()

export function getOfficeSupabaseClient(office: OfficeSlug): SupabaseClient | null {
  const existingClient = clients.get(office)
  if (existingClient) return existingClient

  const config = supabaseConfigs[office]
  if (!config.url || !config.anonKey) return null

  const client = createClient(config.url, config.anonKey)
  clients.set(office, client)
  return client
}

// Old types (for backward compatibility)
export type EquipmentRequest = {
  id?: number
  employee_name: string
  department: string
  equipment_name: string
  quantity: number
  request_type: 'เบิก' | 'คืน'
  notes?: string
  created_at?: string
}

// New types for multi-item withdrawal system
export type Employee = {
  id: number
  employee_code: string
  employee_name: string
  department: string
  created_at: string
  updated_at: string
}

export type EquipmentItem = {
  id: number
  name: string
  unit: string
  stock_quantity: number
  notes?: string
  created_at: string
  updated_at: string
}

export type EquipmentWithdrawal = {
  id: number
  employee_id?: number
  employee_code: string
  employee_name: string
  department: string
  notes?: string
  created_at: string
}

export type WithdrawalItem = {
  id: number
  withdrawal_id: number
  equipment_item_id: number
  quantity: number
  created_at: string
}

export type WithdrawalItemInput = {
  equipment_item_id: number
  quantity: number
}

export type WithdrawalDetailView = {
  withdrawal_id: number
  employee_code: string
  employee_name: string
  department: string
  withdrawal_notes?: string
  withdrawal_date: string
  item_id: number
  equipment_name: string
  unit: string
  quantity: number
}

export type EmployeeWithdrawalSummary = {
  employee_code: string
  employee_name: string
  department: string
  equipment_name: string
  unit: string
  total_quantity: number
  withdrawal_count: number
  last_withdrawal_date: string
}

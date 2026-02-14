import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'กรุณาตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local\n' +
    'ดูวิธีการตั้งค่าได้ที่ README.md'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

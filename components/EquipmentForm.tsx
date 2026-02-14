'use client'

import { useState, useEffect } from 'react'
import { supabase, type EquipmentItem, type Employee } from '@/lib/supabase'
import { User, Building2, Package, ShoppingCart, Plus, Trash2, Loader2, IdCard } from 'lucide-react'

type Props = {
  onSuccess: () => void
}

type SelectedItem = {
  equipment_item_id: number
  equipment_name: string
  unit: string
  quantity: number
}

export default function EquipmentForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState({
    employee_code: '',
    employee_id: undefined as number | undefined,
    employee_name: '',
    department: ''
  })
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingItems, setLoadingItems] = useState(true)
  const [searchingEmployee, setSearchingEmployee] = useState(false)

  // โหลดรายการอุปกรณ์
  useEffect(() => {
    loadEquipmentItems()
  }, [])

  const loadEquipmentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_items')
        .select('*')
        .order('name')

      if (error) throw error
      setEquipmentItems(data || [])
    } catch (error) {
      console.error('Error loading equipment items:', error)
      alert('ไม่สามารถโหลดรายการอุปกรณ์ได้')
    } finally {
      setLoadingItems(false)
    }
  }

  const searchEmployee = async (employeeCode: string) => {
    if (!employeeCode.trim()) {
      setFormData({ ...formData, employee_code: '', employee_id: undefined, employee_name: '', department: '' })
      return
    }

    setSearchingEmployee(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_code', employeeCode.trim())
        .single()

      if (error) {
        // ไม่พบพนักงาน
        console.log('Employee search error:', error)
        console.log('Searched for code:', employeeCode.trim())
        setFormData({ ...formData, employee_code: employeeCode, employee_id: undefined, employee_name: '', department: '' })
      } else {
        // พบพนักงาน - กรอกข้อมูลอัตโนมัติ
        console.log('Employee found:', data)
        setFormData({
          ...formData,
          employee_code: data.employee_code,
          employee_id: data.id,
          employee_name: data.employee_name,
          department: data.department
        })
      }
    } catch (error) {
      console.error('Error searching employee:', error)
    } finally {
      setSearchingEmployee(false)
    }
  }

  const addItem = () => {
    if (equipmentItems.length === 0) {
      alert('ไม่มีรายการอุปกรณ์ในระบบ')
      return
    }
    
    const firstItem = equipmentItems[0]
    setSelectedItems([...selectedItems, {
      equipment_item_id: firstItem.id,
      equipment_name: firstItem.name,
      unit: firstItem.unit,
      quantity: 1
    }])
  }

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'equipment_item_id' | 'quantity', value: number) => {
    const newItems = [...selectedItems]
    
    if (field === 'equipment_item_id') {
      const selectedEquipment = equipmentItems.find(item => item.id === value)
      if (selectedEquipment) {
        newItems[index] = {
          ...newItems[index],
          equipment_item_id: value,
          equipment_name: selectedEquipment.name,
          unit: selectedEquipment.unit
        }
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    
    setSelectedItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      alert('กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ')
      return
    }

    if (!formData.employee_code || !formData.employee_name || !formData.department) {
      alert('กรุณากรอกข้อมูลพนักงานให้ครบถ้วน')
      return
    }

    setLoading(true)

    try {
      // 1. สร้างรายการเบิกหลัก
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('equipment_withdrawals')
        .insert([{
          employee_id: formData.employee_id,
          employee_code: formData.employee_code,
          employee_name: formData.employee_name,
          department: formData.department,
          notes: null
        }])
        .select()
        .single()

      if (withdrawalError) throw withdrawalError

      // 2. เพิ่มรายละเอียดการเบิก
      const withdrawalItems: any[] = selectedItems.map(item => ({
        withdrawal_id: withdrawal.id,
        equipment_item_id: item.equipment_item_id,
        quantity: item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('withdrawal_items')
        .insert(withdrawalItems)

      if (itemsError) throw itemsError

      alert('บันทึกข้อมูลสำเร็จ')
      
      // รีเซ็ตฟอร์ม
      setFormData({
        employee_code: '',
        employee_id: undefined,
        employee_name: '',
        department: ''
      })
      setSelectedItems([])
      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingItems) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">แบบฟอร์มเบิกอุปกรณ์</h2>
        <p className="text-sm text-gray-500">กรุณากรอกข้อมูลให้ครบถ้วน</p>
      </div>
      
      {/* ข้อมูลผู้เบิก */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
              <IdCard className="w-4 h-4 mr-1.5 text-purple-600" />
              รหัสพนักงาน <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                onBlur={(e) => searchEmployee(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="กรอกรหัสพนักงาน เช่น E001"
              />
              {searchingEmployee && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                </div>
              )}
            </div>
            {formData.employee_code && !formData.employee_name && !searchingEmployee && (
              <p className="text-xs text-red-500 mt-1">ไม่พบรหัสพนักงานนี้ในระบบ</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-purple-600" />
                ชื่อ-นามสกุล <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.employee_name}
                onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                placeholder="จะแสดงอัตโนมัติ"
                readOnly={!!formData.employee_id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <Building2 className="w-4 h-4 mr-1.5 text-purple-600" />
                หน่วยงาน/แผนก <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                placeholder="จะแสดงอัตโนมัติ"
                readOnly={!!formData.employee_id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* รายการอุปกรณ์ที่เบิก */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <ShoppingCart className="w-4 h-4 mr-1.5 text-purple-600" />
            รายการอุปกรณ์ที่ต้องการเบิก <span className="text-red-500 ml-1">*</span>
          </label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการ
          </button>
        </div>

        {selectedItems.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">ยังไม่มีรายการอุปกรณ์</p>
            <p className="text-gray-400 text-xs mt-1">คลิก "เพิ่มรายการ" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-start p-4 border border-gray-300 rounded-xl bg-gray-50">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">อุปกรณ์</label>
                    <select
                      value={item.equipment_item_id}
                      onChange={(e) => updateItem(index, 'equipment_item_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      required
                    >
                      {equipmentItems.map(equip => (
                        <option key={equip.id} value={equip.id}>
                          {equip.name} ({equip.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">จำนวน</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="ลบรายการ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || selectedItems.length === 0}
        className="w-full bg-purple-600 text-white py-3.5 px-4 rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-base flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังบันทึก...
          </>
        ) : (
          <>
            <Package className="w-5 h-5" />
            บันทึกการเบิก
          </>
        )}
      </button>
    </form>
  )
}

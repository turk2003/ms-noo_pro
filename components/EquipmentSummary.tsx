'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase, type EmployeeWithdrawalSummary, type EquipmentItem } from '@/lib/supabase'
import {
  Building2,
  Calendar,
  Edit2,
  Loader2,
  Package,
  Plus,
  Save,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react'

type Props = {
  refresh: number
}

type WithdrawalDetail = {
  withdrawal_id: number
  employee_code: string
  employee_name: string
  department: string
  withdrawal_notes: string | null
  withdrawal_date: string
  item_id: number
  equipment_name: string
  unit: string
  quantity: number
}

type GroupedWithdrawal = {
  withdrawal_id: number
  employee_code: string
  employee_name: string
  department: string
  withdrawal_date: string
  withdrawal_notes: string | null
  items: {
    equipment_name: string
    unit: string
    quantity: number
  }[]
}

type EquipmentStock = {
  id: number
  name: string
  unit: string
  stock_quantity: number
  withdrawn_quantity: number
  remaining_quantity: number
}

type EditableWithdrawalItem = {
  id?: number
  equipment_item_id: number
  quantity: number
}

type WithdrawalFormState = {
  id?: number
  employee_id?: number
  employee_code: string
  employee_name: string
  department: string
  withdrawal_notes: string
  items: EditableWithdrawalItem[]
}

const EMPTY_FORM: WithdrawalFormState = {
  employee_id: undefined,
  employee_code: '',
  employee_name: '',
  department: '',
  withdrawal_notes: '',
  items: []
}

export default function EquipmentSummary({ refresh }: Props) {
  const [withdrawals, setWithdrawals] = useState<GroupedWithdrawal[]>([])
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([])
  const [equipmentStock, setEquipmentStock] = useState<EquipmentStock[]>([])
  const [employeeSummary, setEmployeeSummary] = useState<EmployeeWithdrawalSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stock' | 'history' | 'employee'>('stock')
  const [isAdmin, setIsAdmin] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyModalLoading, setHistoryModalLoading] = useState(false)
  const [savingHistory, setSavingHistory] = useState(false)
  const [searchingEmployee, setSearchingEmployee] = useState(false)
  const [formState, setFormState] = useState<WithdrawalFormState>(EMPTY_FORM)
  const [originalItemIds, setOriginalItemIds] = useState<number[]>([])

  useEffect(() => {
    const authorized = sessionStorage.getItem('admin_authorized')
    setIsAdmin(authorized === 'true')
  }, [])

  const calculateStock = useCallback(async (equipment: EquipmentItem[]): Promise<EquipmentStock[]> => {
    const withdrawnMap = new Map<number, number>()

    const { data: withdrawnItems, error } = await supabase
      .from('withdrawal_items')
      .select('equipment_item_id, quantity')

    if (error) throw error

    withdrawnItems?.forEach((item: { equipment_item_id: number; quantity: number }) => {
      const current = withdrawnMap.get(item.equipment_item_id) || 0
      withdrawnMap.set(item.equipment_item_id, current + item.quantity)
    })

    return equipment.map((item) => {
      const withdrawn = withdrawnMap.get(item.id) || 0
      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        stock_quantity: item.stock_quantity,
        withdrawn_quantity: withdrawn,
        remaining_quantity: item.stock_quantity - withdrawn
      }
    })
  }, [])

  const groupWithdrawals = useCallback((data: WithdrawalDetail[]): GroupedWithdrawal[] => {
    const map = new Map<number, GroupedWithdrawal>()

    data.forEach((detail) => {
      if (!map.has(detail.withdrawal_id)) {
        map.set(detail.withdrawal_id, {
          withdrawal_id: detail.withdrawal_id,
          employee_code: detail.employee_code,
          employee_name: detail.employee_name,
          department: detail.department,
          withdrawal_date: detail.withdrawal_date,
          withdrawal_notes: detail.withdrawal_notes,
          items: []
        })
      }

      map.get(detail.withdrawal_id)?.items.push({
        equipment_name: detail.equipment_name,
        unit: detail.unit,
        quantity: detail.quantity
      })
    })

    return Array.from(map.values())
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)

    try {
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_details_view')
        .select('*')
        .order('withdrawal_date', { ascending: false })

      if (withdrawalError) throw withdrawalError
      setWithdrawals(groupWithdrawals(withdrawalData || []))

      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment_items')
        .select('*')
        .order('name')

      if (equipmentError) throw equipmentError

      const equipmentList = equipmentData || []
      setEquipmentItems(equipmentList)
      setEquipmentStock(await calculateStock(equipmentList))

      const { data: employeeData, error: employeeError } = await supabase
        .from('employee_withdrawal_summary')
        .select('*')
        .order('employee_name')

      if (employeeError) throw employeeError
      setEmployeeSummary(employeeData || [])
    } catch (error) {
      console.error('Error:', error)
      alert('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }, [calculateStock, groupWithdrawals])

  useEffect(() => {
    void fetchData()
  }, [refresh, fetchData])

  const createEmptyItem = (): EditableWithdrawalItem => {
    const firstItem = equipmentItems[0]
    return {
      equipment_item_id: firstItem?.id || 0,
      quantity: 1
    }
  }

  const resetFormState = () => {
    setFormState(EMPTY_FORM)
    setOriginalItemIds([])
  }

  const handleOpenAddModal = () => {
    if (equipmentItems.length === 0) {
      alert('ไม่มีรายการอุปกรณ์ในระบบ')
      return
    }

    setFormState({
      ...EMPTY_FORM,
      items: [createEmptyItem()]
    })
    setOriginalItemIds([])
    setHistoryModalOpen(true)
  }

  const handleOpenEditModal = async (withdrawalId: number) => {
    setHistoryModalOpen(true)
    setHistoryModalLoading(true)

    try {
      const [withdrawalResponse, itemsResponse] = await Promise.all([
        supabase
          .from('equipment_withdrawals')
          .select('id, employee_id, employee_code, employee_name, department, notes')
          .eq('id', withdrawalId)
          .single(),
        supabase
          .from('withdrawal_items')
          .select('id, equipment_item_id, quantity')
          .eq('withdrawal_id', withdrawalId)
          .order('id')
      ])

      if (withdrawalResponse.error) throw withdrawalResponse.error
      if (itemsResponse.error) throw itemsResponse.error

      const items = (itemsResponse.data || []).map((item) => ({
        id: item.id,
        equipment_item_id: item.equipment_item_id,
        quantity: item.quantity
      }))

      setFormState({
        id: withdrawalResponse.data.id,
        employee_id: withdrawalResponse.data.employee_id || undefined,
        employee_code: withdrawalResponse.data.employee_code,
        employee_name: withdrawalResponse.data.employee_name,
        department: withdrawalResponse.data.department,
        withdrawal_notes: withdrawalResponse.data.notes || '',
        items
      })
      setOriginalItemIds(items.map((item) => item.id!).filter(Boolean))
    } catch (error) {
      console.error('Error loading withdrawal:', error)
      alert('ไม่สามารถโหลดข้อมูลรายการเบิกได้')
      setHistoryModalOpen(false)
      resetFormState()
    } finally {
      setHistoryModalLoading(false)
    }
  }

  const closeHistoryModal = (force = false) => {
    if (savingHistory && !force) return
    setHistoryModalOpen(false)
    setHistoryModalLoading(false)
    resetFormState()
  }

  const updateFormField = <K extends keyof WithdrawalFormState>(
    field: K,
    value: WithdrawalFormState[K]
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }))
  }

  const updateFormItem = (
    index: number,
    field: keyof EditableWithdrawalItem,
    value: number
  ) => {
    setFormState((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addFormItem = () => {
    if (equipmentItems.length === 0) {
      alert('ไม่มีรายการอุปกรณ์ในระบบ')
      return
    }

    setFormState((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()]
    }))
  }

  const removeFormItem = (index: number) => {
    setFormState((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index)
    }))
  }

  const searchEmployee = async (employeeCode: string) => {
    const trimmedCode = employeeCode.trim()

    if (!trimmedCode) {
      setFormState((current) => ({
        ...current,
        employee_code: '',
        employee_id: undefined,
        employee_name: '',
        department: ''
      }))
      return
    }

    setSearchingEmployee(true)

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_code, employee_name, department')
        .eq('employee_code', trimmedCode)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setFormState((current) => ({
          ...current,
          employee_code: trimmedCode,
          employee_id: undefined
        }))
        return
      }

      setFormState((current) => ({
        ...current,
        employee_code: data.employee_code,
        employee_id: data.id,
        employee_name: data.employee_name,
        department: data.department
      }))
    } catch (error) {
      console.error('Error searching employee:', error)
      alert('ไม่สามารถค้นหาข้อมูลพนักงานได้')
    } finally {
      setSearchingEmployee(false)
    }
  }

  const validateHistoryForm = () => {
    if (!formState.employee_code.trim() || !formState.employee_name.trim() || !formState.department.trim()) {
      alert('กรุณากรอกข้อมูลพนักงานให้ครบถ้วน')
      return false
    }

    if (formState.items.length === 0) {
      alert('กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ')
      return false
    }

    if (formState.items.some((item) => !item.equipment_item_id || item.quantity <= 0)) {
      alert('กรุณาตรวจสอบรายการอุปกรณ์และจำนวนให้ถูกต้อง')
      return false
    }

    const uniqueEquipmentIds = new Set(formState.items.map((item) => item.equipment_item_id))
    if (uniqueEquipmentIds.size !== formState.items.length) {
      alert('ไม่สามารถเลือกอุปกรณ์ซ้ำในรายการเดียวกันได้')
      return false
    }

    return true
  }

  const handleSaveHistory = async () => {
    if (!validateHistoryForm()) return

    const isEditing = Boolean(formState.id)
    setSavingHistory(true)

    try {
      if (!formState.id) {
        const { data: withdrawal, error: withdrawalError } = await supabase
          .from('equipment_withdrawals')
          .insert([
            {
              employee_id: formState.employee_id,
              employee_code: formState.employee_code.trim(),
              employee_name: formState.employee_name.trim(),
              department: formState.department.trim(),
              notes: formState.withdrawal_notes.trim() || null
            }
          ])
          .select('id')
          .single()

        if (withdrawalError) throw withdrawalError

        const { error: itemsError } = await supabase
          .from('withdrawal_items')
          .insert(
            formState.items.map((item) => ({
              withdrawal_id: withdrawal.id,
              equipment_item_id: item.equipment_item_id,
              quantity: item.quantity
            }))
          )

        if (itemsError) throw itemsError
      } else {
        const { data: updatedWithdrawalRows, error: updateWithdrawalError } = await supabase
          .from('equipment_withdrawals')
          .update({
            employee_id: formState.employee_id,
            employee_code: formState.employee_code.trim(),
            employee_name: formState.employee_name.trim(),
            department: formState.department.trim(),
            notes: formState.withdrawal_notes.trim() || null
          })
          .eq('id', formState.id)
          .select('id')

        if (updateWithdrawalError) throw updateWithdrawalError
        if (!updatedWithdrawalRows || updatedWithdrawalRows.length === 0) {
          throw new Error('ไม่สามารถแก้ไขรายการนี้ได้ กรุณาตรวจสอบสิทธิ์ใน Supabase หรือดูว่ารายการยังมีอยู่หรือไม่')
        }

        const currentItemIds = formState.items
          .map((item) => item.id)
          .filter((itemId): itemId is number => typeof itemId === 'number')

        const deletedItemIds = originalItemIds.filter((itemId) => !currentItemIds.includes(itemId))
        if (deletedItemIds.length > 0) {
          const { error: deleteRemovedItemsError } = await supabase
            .from('withdrawal_items')
            .delete()
            .in('id', deletedItemIds)
            .select('id')

          if (deleteRemovedItemsError) throw deleteRemovedItemsError
        }

        const existingItems = formState.items.filter(
          (item): item is EditableWithdrawalItem & { id: number } => typeof item.id === 'number'
        )
        const newItems = formState.items.filter((item) => typeof item.id !== 'number')

        if (existingItems.length > 0) {
          const updateResults = await Promise.all(
            existingItems.map((item) =>
              supabase
                .from('withdrawal_items')
                .update({
                  equipment_item_id: item.equipment_item_id,
                  quantity: item.quantity
                })
                .eq('id', item.id)
                .select('id')
            )
          )

          const updateError = updateResults.find((result) => result.error)?.error
          if (updateError) throw updateError

          const missingUpdatedItem = updateResults.find(
            (result) => !result.data || result.data.length === 0
          )
          if (missingUpdatedItem) {
            throw new Error('ไม่สามารถแก้ไขรายละเอียดอุปกรณ์บางรายการได้ กรุณาตรวจสอบสิทธิ์ใน Supabase')
          }
        }

        if (newItems.length > 0) {
          const { error: insertNewItemsError } = await supabase
            .from('withdrawal_items')
            .insert(
              newItems.map((item) => ({
                withdrawal_id: formState.id,
                equipment_item_id: item.equipment_item_id,
                quantity: item.quantity
              }))
            )

          if (insertNewItemsError) throw insertNewItemsError
        }
      }

      closeHistoryModal(true)
      await fetchData()
      alert(isEditing ? 'แก้ไขประวัติการเบิกสำเร็จ' : 'เพิ่มประวัติการเบิกสำเร็จ')
    } catch (error) {
      console.error('Error saving withdrawal:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    } finally {
      setSavingHistory(false)
    }
  }

  const handleDeleteWithdrawal = async (withdrawalId: number) => {
    if (!confirm('ต้องการลบประวัติการเบิกรายการนี้ใช่หรือไม่?')) return

    try {
      const { data: deletedRows, error } = await supabase
        .from('equipment_withdrawals')
        .delete()
        .eq('id', withdrawalId)
        .select('id')

      if (error) throw error
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error('ไม่สามารถลบรายการนี้ได้ กรุณาตรวจสอบสิทธิ์ใน Supabase หรือดูว่ารายการยังมีอยู่หรือไม่')
      }

      await fetchData()
      alert('ลบประวัติการเบิกสำเร็จ')
    } catch (error) {
      console.error('Error deleting withdrawal:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    }
  }

  const getEquipmentName = (equipmentItemId: number) =>
    equipmentItems.find((item) => item.id === equipmentItemId)?.name || ''

  const getEquipmentUnit = (equipmentItemId: number) =>
    equipmentItems.find((item) => item.id === equipmentItemId)?.unit || ''

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'stock'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">อุปกรณ์</span>คงเหลือ
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'history'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">ประวัติ</span>การเบิก
            </button>
            <button
              onClick={() => setActiveTab('employee')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'employee'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">สรุป</span>พนักงาน
            </button>
          </div>
        </div>

        {activeTab === 'stock' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-purple-50">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                รายการอุปกรณ์คงเหลือ
              </h2>
            </div>

            <div className="block md:hidden p-4 space-y-3">
              {equipmentStock.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  ไม่มีข้อมูลอุปกรณ์
                </div>
              ) : (
                equipmentStock.map((item) => {
                  const remaining = item.stock_quantity - item.withdrawn_quantity
                  const percentRemaining = item.stock_quantity > 0
                    ? (remaining / item.stock_quantity) * 100
                    : 0

                  return (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center flex-1">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium text-sm text-gray-900">{item.name}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="text-gray-500">สต็อก</div>
                          <div className="font-semibold text-gray-900">{item.stock_quantity}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">เบิกไป</div>
                          <div className="font-semibold text-orange-600">{item.withdrawn_quantity}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">คงเหลือ</div>
                          <div
                            className={`font-semibold ${
                              percentRemaining <= 10 ? 'text-red-600' :
                              percentRemaining <= 30 ? 'text-orange-600' :
                              'text-green-600'
                            }`}
                          >
                            {remaining}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อุปกรณ์</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สต็อกเริ่มต้น</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">เบิกไปแล้ว</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">คงเหลือ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {equipmentStock.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                        ไม่มีข้อมูลอุปกรณ์
                      </td>
                    </tr>
                  ) : (
                    equipmentStock.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2 text-gray-400" />
                            {item.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                          {item.stock_quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 text-center font-medium">
                          {item.withdrawn_quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              item.remaining_quantity <= 0
                                ? 'bg-red-100 text-red-700'
                                : item.remaining_quantity <= 3
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {item.remaining_quantity} {item.unit}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-purple-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                    ประวัติการเบิกอุปกรณ์
                  </h2>
                  {isAdmin && (
                    <p className="text-xs text-purple-700 mt-1">admin สามารถเพิ่ม แก้ไข และลบรายการได้</p>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มประวัติ
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-6">
              {withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ยังไม่มีข้อมูลการเบิก</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.withdrawal_id}
                      className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-5 hover:shadow-md transition-shadow bg-gray-50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 pb-3 border-b border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-mono rounded">
                              {withdrawal.employee_code}
                            </span>
                            <div className="flex items-center">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-purple-600" />
                              <span className="text-sm sm:text-base font-semibold text-gray-900">{withdrawal.employee_name}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-400" />
                            <span>{withdrawal.department}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <div className="flex items-center text-xs sm:text-sm text-gray-500">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                            <span className="text-xs sm:text-sm">
                              {new Date(withdrawal.withdrawal_date).toLocaleDateString('th-TH', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => void handleOpenEditModal(withdrawal.withdrawal_id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                              >
                                <Edit2 className="w-4 h-4" />
                                แก้ไข
                              </button>
                              <button
                                onClick={() => void handleDeleteWithdrawal(withdrawal.withdrawal_id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                                ลบ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500 uppercase mb-2">รายการที่เบิก:</div>
                        {withdrawal.items.map((item, index) => (
                          <div
                            key={`${withdrawal.withdrawal_id}-${index}`}
                            className="flex items-center justify-between py-2 px-2 sm:px-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center">
                              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-purple-500" />
                              <span className="text-xs sm:text-sm text-gray-900">{item.equipment_name}</span>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-purple-600">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>

                      {withdrawal.withdrawal_notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500">หมายเหตุ:</div>
                          <div className="text-sm text-gray-700 mt-1">{withdrawal.withdrawal_notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'employee' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-purple-50">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                สรุปการเบิกของพนักงาน
              </h2>
            </div>

            <div className="block md:hidden p-4 space-y-3">
              {employeeSummary.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  ยังไม่มีข้อมูลการเบิก
                </div>
              ) : (
                employeeSummary.map((emp, index) => (
                  <div key={`${emp.employee_code}-${index}`} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-mono rounded">
                            {emp.employee_code}
                          </span>
                        </div>
                        <div className="font-medium text-sm text-gray-900">{emp.employee_name}</div>
                        <div className="text-xs text-gray-500">{emp.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{emp.withdrawal_count}</div>
                        <div className="text-xs text-gray-500">ครั้ง</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">อุปกรณ์:</div>
                      <div className="text-sm text-gray-900">{emp.equipment_name}</div>
                      <div className="text-xs text-gray-500 mt-1">รวม {emp.total_quantity} {emp.unit}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อพนักงาน</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แผนก</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อุปกรณ์ที่เบิก</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนรวม</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนครั้ง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employeeSummary.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        ยังไม่มีข้อมูลการเบิก
                      </td>
                    </tr>
                  ) : (
                    employeeSummary.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 font-mono text-xs rounded">
                            {item.employee_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {item.employee_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Package className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {item.equipment_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="font-semibold text-purple-600">
                            {item.total_quantity} {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {item.withdrawal_count} ครั้ง
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formState.id ? 'แก้ไขประวัติการเบิก' : 'เพิ่มประวัติการเบิก'}
                  </h3>
                  <p className="text-sm text-gray-500">ปรับข้อมูลพนักงาน รายการอุปกรณ์ และหมายเหตุได้จากหน้าประวัติ</p>
                </div>
                <button
                  onClick={() => closeHistoryModal()}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  disabled={savingHistory}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {historyModalLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสพนักงาน</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formState.employee_code}
                          onChange={(event) => updateFormField('employee_code', event.target.value)}
                          onBlur={(event) => void searchEmployee(event.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="กรอกรหัสพนักงาน"
                        />
                        {searchingEmployee && (
                          <Loader2 className="w-5 h-5 text-purple-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
                      <input
                        type="text"
                        value={formState.employee_name}
                        onChange={(event) => updateFormField('employee_name', event.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="ชื่อผู้เบิก"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">หน่วยงาน/แผนก</label>
                      <input
                        type="text"
                        value={formState.department}
                        onChange={(event) => updateFormField('department', event.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="หน่วยงาน"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">รายการอุปกรณ์</h4>
                      <button
                        onClick={addFormItem}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มรายการ
                      </button>
                    </div>

                    {formState.items.map((item, index) => (
                      <div key={item.id || `new-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_140px_96px] gap-3 items-end p-3 border border-gray-200 rounded-xl">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">อุปกรณ์</label>
                          <select
                            value={item.equipment_item_id}
                            onChange={(event) => updateFormItem(index, 'equipment_item_id', Number(event.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            {equipmentItems.map((equipment) => (
                              <option key={equipment.id} value={equipment.id}>
                                {equipment.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            จำนวน {getEquipmentUnit(item.equipment_item_id) && `(${getEquipmentUnit(item.equipment_item_id)})`}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(event) => updateFormItem(index, 'quantity', Math.max(1, Number(event.target.value) || 1))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>

                        <button
                          onClick={() => removeFormItem(index)}
                          className="h-[50px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-xl hover:bg-red-100 disabled:opacity-50"
                          type="button"
                          disabled={formState.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                          ลบ
                        </button>

                        <div className="md:col-span-3 text-xs text-gray-500">
                          {getEquipmentName(item.equipment_item_id)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ</label>
                    <textarea
                      value={formState.withdrawal_notes}
                      onChange={(event) => updateFormField('withdrawal_notes', event.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="หมายเหตุเพิ่มเติม"
                    />
                  </div>
                </div>
              )}

              <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => closeHistoryModal()}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={savingHistory}
                  type="button"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => void handleSaveHistory()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                  disabled={historyModalLoading || savingHistory}
                  type="button"
                >
                  {savingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

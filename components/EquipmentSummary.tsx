'use client'

import { useEffect, useState } from 'react'
import { supabase, type EmployeeWithdrawalSummary } from '@/lib/supabase'
import { Package, User, Building2, Calendar, Loader2, Users } from 'lucide-react'

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

export default function EquipmentSummary({ refresh }: Props) {
  const [withdrawals, setWithdrawals] = useState<GroupedWithdrawal[]>([])
  const [equipmentStock, setEquipmentStock] = useState<EquipmentStock[]>([])
  const [employeeSummary, setEmployeeSummary] = useState<EmployeeWithdrawalSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [refresh])

  const fetchData = async () => {
    try {
      // ดึงข้อมูลการเบิก
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_details_view')
        .select('*')
        .order('withdrawal_date', { ascending: false })

      if (withdrawalError) throw withdrawalError

      // จัดกลุ่มข้อมูลตาม withdrawal_id
      const grouped = groupWithdrawals(withdrawalData || [])
      setWithdrawals(grouped)

      // ดึงข้อมูลสต็อกอุปกรณ์
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment_items')
        .select('*')
        .order('name')

      if (equipmentError) throw equipmentError

      // คำนวณจำนวนที่เบิกไปแล้ว
      const stockWithWithdrawals = await calculateStock(equipmentData || [])
      setEquipmentStock(stockWithWithdrawals)

      // ดึงข้อมูลสรุปการเบิกของพนักงาน
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee_withdrawal_summary')
        .select('*')
        .order('employee_name')

      if (employeeError) throw employeeError
      setEmployeeSummary(employeeData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStock = async (equipment: any[]): Promise<EquipmentStock[]> => {
    // นับจำนวนที่เบิกไปแต่ละรายการ
    const withdrawnMap = new Map<number, number>()
    
    const { data: withdrawnItems } = await supabase
      .from('withdrawal_items')
      .select('equipment_item_id, quantity')

    if (withdrawnItems) {
      withdrawnItems.forEach((item: any) => {
        const current = withdrawnMap.get(item.equipment_item_id) || 0
        withdrawnMap.set(item.equipment_item_id, current + item.quantity)
      })
    }

    return equipment.map(item => {
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
  }

  const groupWithdrawals = (data: WithdrawalDetail[]): GroupedWithdrawal[] => {
    const map = new Map<number, GroupedWithdrawal>()

    data.forEach(detail => {
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

      map.get(detail.withdrawal_id)!.items.push({
        equipment_name: detail.equipment_name,
        unit: detail.unit,
        quantity: detail.quantity
      })
    })

    return Array.from(map.values())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ยอดคงเหลือ */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-purple-50">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            รายการอุปกรณ์คงเหลือ
          </h2>
        </div>
        
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-3">
          {equipmentStock.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500">
              ไม่มีข้อมูลอุปกรณ์
            </div>
          ) : (
            equipmentStock.map((item) => {
              const remaining = item.stock_quantity - item.withdrawn_quantity
              const percentRemaining = (remaining / item.stock_quantity) * 100
              
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
                      <div className={`font-semibold ${
                        percentRemaining <= 10 ? 'text-red-600' :
                        percentRemaining <= 30 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {remaining}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop Table View */}
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        item.remaining_quantity <= 0 
                          ? 'bg-red-100 text-red-700' 
                          : item.remaining_quantity <= 3
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
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

      {/* ประวัติการเบิก */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-purple-50">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            ประวัติการเบิกอุปกรณ์
          </h2>
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
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 pb-3 border-b border-gray-200">
                    <div className="flex-1 mb-2 sm:mb-0">
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
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-2">รายการที่เบิก:</div>
                    {withdrawal.items.map((item, index) => (
                      <div 
                        key={index} 
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

                  {/* Notes */}
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

      {/* สรุปการเบิกของพนักงานแต่ละคน */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-purple-50">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            สรุปการเบิกของพนักงาน
          </h2>
        </div>
        
        {/* Mobile Card View */}
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

        {/* Desktop Table View */}
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
    </div>
  )
}

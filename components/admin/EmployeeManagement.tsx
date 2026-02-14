'use client'

import { useState, useEffect } from 'react'
import { supabase, type Employee } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    employee_code: '',
    employee_name: '',
    department: ''
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('employee_code')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      alert('ไม่สามารถโหลดข้อมูลพนักงานได้')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.employee_code || !formData.employee_name || !formData.department) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      const { error } = await supabase
        .from('employees')
        .insert([formData])

      if (error) throw error

      alert('เพิ่มพนักงานสำเร็จ')
      setFormData({ employee_code: '', employee_name: '', department: '' })
      setAdding(false)
      loadEmployees()
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    }
  }

  const handleUpdate = async (id: number) => {
    const employee = employees.find(e => e.id === id)
    if (!employee) return

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          employee_name: employee.employee_name,
          department: employee.department
        })
        .eq('id', id)

      if (error) throw error

      alert('อัพเดตข้อมูลสำเร็จ')
      setEditing(null)
      loadEmployees()
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    }
  }

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`ต้องการลบพนักงาน ${code} ใช่หรือไม่?`)) return

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete error:', error)
        throw error
      }

      // อัพเดต state ทันทีโดยไม่ต้องรอ loadEmployees
      setEmployees(employees.filter(emp => emp.id !== id))
      alert('ลบพนักงานสำเร็จ')
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    }
  }

  const updateEmployee = (id: number, field: keyof Employee, value: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">รายการพนักงาน</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มพนักงาน
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">เพิ่มพนักงานใหม่</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="รหัสพนักงาน (เช่น E011)"
              value={formData.employee_code}
              onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="ชื่อ-นามสกุล"
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="แผนก"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              <Save className="w-4 h-4" />
              บันทึก
            </button>
            <button
              onClick={() => {
                setAdding(false)
                setFormData({ employee_code: '', employee_name: '', department: '' })
              }}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              <X className="w-4 h-4" />
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">รหัสพนักงาน</div>
                <div className="font-medium text-gray-900">{emp.employee_code}</div>
              </div>
              {editing !== emp.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(emp.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id, emp.employee_code)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">ชื่อ-นามสกุล</div>
                {editing === emp.id ? (
                  <input
                    type="text"
                    value={emp.employee_name}
                    onChange={(e) => updateEmployee(emp.id, 'employee_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="text-sm">{emp.employee_name}</div>
                )}
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">แผนก</div>
                {editing === emp.id ? (
                  <input
                    type="text"
                    value={emp.department}
                    onChange={(e) => updateEmployee(emp.id, 'department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="text-sm">{emp.department}</div>
                )}
              </div>
            </div>

            {editing === emp.id && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleUpdate(emp.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
                <button
                  onClick={() => {
                    setEditing(null)
                    loadEmployees()
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <X className="w-4 h-4" />
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        ))}
        
        {employees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            ยังไม่มีข้อมูลพนักงาน
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">แผนก</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 font-mono rounded">
                    {emp.employee_code}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {editing === emp.id ? (
                    <input
                      type="text"
                      value={emp.employee_name}
                      onChange={(e) => updateEmployee(emp.id, 'employee_name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    emp.employee_name
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editing === emp.id ? (
                    <input
                      type="text"
                      value={emp.department}
                      onChange={(e) => updateEmployee(emp.id, 'department', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    emp.department
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {editing === emp.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdate(emp.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="บันทึก"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(null)
                          loadEmployees()
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="ยกเลิก"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditing(emp.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.employee_code)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            ยังไม่มีข้อมูลพนักงาน
          </div>
        )}
      </div>
    </div>
  )
}

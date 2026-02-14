'use client'

import { useState, useEffect } from 'react'
import { supabase, type EquipmentItem } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'

export default function ItemManagement() {
  const [items, setItems] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    stock_quantity: 0
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('equipment_items')
        .select('*')
        .order('name')

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error loading items:', error)
      alert('ไม่สามารถโหลดข้อมูลอุปกรณ์ได้')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.unit) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      const { error } = await supabase
        .from('equipment_items')
        .insert([formData])

      if (error) throw error

      alert('เพิ่มอุปกรณ์สำเร็จ')
      setFormData({ name: '', unit: '', stock_quantity: 0 })
      setAdding(false)
      loadItems()
    } catch (error) {
      console.error('Error adding item:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    }
  }

  const handleUpdate = async (id: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    try {
      const { error } = await supabase
        .from('equipment_items')
        .update({
          name: item.name,
          unit: item.unit,
          stock_quantity: item.stock_quantity
        })
        .eq('id', id)

      if (error) throw error

      alert('อัพเดตข้อมูลสำเร็จ')
      setEditing(null)
      loadItems()
    } catch (error) {
      console.error('Error updating item:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ต้องการลบอุปกรณ์ "${name}" ใช่หรือไม่?`)) return

    try {
      const { error } = await supabase
        .from('equipment_items')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete error:', error)
        throw error
      }

      // อัพเดต state ทันทีโดยไม่ต้องรอ loadItems
      setItems(items.filter(item => item.id !== id))
      alert('ลบอุปกรณ์สำเร็จ')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message)
    }
  }

  const updateItem = (id: number, field: keyof EquipmentItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
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
        <h2 className="text-lg font-semibold text-gray-900">รายการอุปกรณ์</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มอุปกรณ์
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">เพิ่มอุปกรณ์ใหม่</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="ชื่ออุปกรณ์"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="หน่วย (เช่น ชิ้น, อัน, ใบ)"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              placeholder="จำนวนสต็อก"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
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
                setFormData({ name: '', unit: '', stock_quantity: 0 })
              }}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              <X className="w-4 h-4" />
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่ออุปกรณ์</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">หน่วย</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">จำนวนสต็อก</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    />
                  ) : (
                    item.unit
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {editing === item.id ? (
                    <input
                      type="number"
                      value={item.stock_quantity}
                      onChange={(e) => updateItem(item.id, 'stock_quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    />
                  ) : (
                    <span className="font-semibold text-purple-600">{item.stock_quantity}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {editing === item.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="บันทึก"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(null)
                          loadItems()
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
                        onClick={() => setEditing(item.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
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

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            ยังไม่มีข้อมูลอุปกรณ์
          </div>
        )}
      </div>
    </div>
  )
}

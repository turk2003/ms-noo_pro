-- สร้างตารางสำหรับเก็บข้อมูลการเบิก-คืนอุปกรณ์
-- รันคำสั่งนี้ใน Supabase SQL Editor

CREATE TABLE equipment_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('เบิก', 'คืน')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- สร้าง index เพื่อเพิ่มความเร็วในการค้นหา
CREATE INDEX idx_equipment_requests_created_at ON equipment_requests(created_at DESC);
CREATE INDEX idx_equipment_requests_equipment_name ON equipment_requests(equipment_name);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE equipment_requests ENABLE ROW LEVEL SECURITY;

-- สร้าง policy ให้ทุกคนสามารถอ่านและเพิ่มข้อมูลได้
CREATE POLICY "Enable read access for all users" ON equipment_requests
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON equipment_requests
  FOR INSERT WITH CHECK (true);

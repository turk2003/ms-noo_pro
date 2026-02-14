-- ขั้นตอนที่ 1: สร้างตารางพนักงาน
-- รัน SQL นี้ใน Supabase SQL Editor ก่อน

-- สร้างตารางพนักงาน
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL UNIQUE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(employee_name);

-- เปิดใช้งาน Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- ลบ policies เก่า (ถ้ามี)
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
DROP POLICY IF EXISTS "Enable insert access for all users" ON employees;
DROP POLICY IF EXISTS "Enable update access for all users" ON employees;

-- สร้าง policies ใหม่
CREATE POLICY "Enable read access for all users" ON employees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON employees FOR UPDATE USING (true);

-- Function สำหรับอัพเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัพเดต updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่มข้อมูลพนักงานตัวอย่าง
INSERT INTO employees (employee_code, employee_name, department) VALUES
('E001', 'สมชาย ใจดี', 'ฝ่ายผลิต'),
('E002', 'สมหญิง รักงาน', 'ฝ่ายขาย'),
('E003', 'วิชัย มานะดี', 'ฝ่ายผลิต'),
('E004', 'นภา สวยงาม', 'ฝ่ายบัญชี'),
('E005', 'ธนา มั่งคั่ง', 'ฝ่ายการตลาด'),
('E006', 'ประภา เก่งกาจ', 'ฝ่ายผลิต'),
('E007', 'สมศักดิ์ ซื่อสัตย์', 'ฝ่ายคลังสินค้า'),
('E008', 'นิภา อ่อนหวาน', 'ฝ่ายบุคคล'),
('E009', 'วิไล รอบรู้', 'ฝ่ายขาย'),
('E010', 'อนุชา ขยัน', 'ฝ่ายผลิต')
ON CONFLICT (employee_code) DO NOTHING;

-- ตรวจสอบผลลัพธ์
SELECT COUNT(*) as total_employees FROM employees;
SELECT * FROM employees ORDER BY employee_code;

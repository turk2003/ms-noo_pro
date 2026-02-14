-- สร้างตารางพนักงานและเพิ่มข้อมูล
-- คัดลอกทั้งหมดและรันใน Supabase SQL Editor

-- 1. สร้างตารางพนักงาน
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL UNIQUE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. สร้าง indexes
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_name ON employees(employee_name);

-- 3. เปิดใช้งาน Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 4. สร้าง policies
CREATE POLICY "Enable read access for all users" 
  ON employees FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for all users" 
  ON employees FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
  ON employees FOR UPDATE 
  USING (true);

-- 5. เพิ่มข้อมูลพนักงาน
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
('E010', 'อนุชา ขยัน', 'ฝ่ายผลิต');

-- 6. ตรวจสอบผลลัพธ์
SELECT * FROM employees ORDER BY employee_code;

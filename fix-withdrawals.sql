-- อัพเดตตาราง equipment_withdrawals
-- รัน SQL นี้ใน Supabase SQL Editor

-- ส่วนที่ 1: เพิ่มคอลัมน์ใหม่
ALTER TABLE equipment_withdrawals ADD COLUMN employee_id BIGINT;
ALTER TABLE equipment_withdrawals ADD COLUMN employee_code TEXT;
ALTER TABLE equipment_withdrawals ADD CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id);

-- อัพเดตข้อมูลเก่า (ถ้ามี)
UPDATE equipment_withdrawals 
SET employee_code = 'UNKNOWN' 
WHERE employee_code IS NULL;

-- ส่วนที่ 2: สร้าง index
CREATE INDEX idx_equipment_withdrawals_employee_code ON equipment_withdrawals(employee_code);

-- ส่วนที่ 3: ลบและสร้าง View ใหม่
DROP VIEW IF EXISTS withdrawal_details_view CASCADE;

CREATE VIEW withdrawal_details_view AS
SELECT 
  w.id as withdrawal_id,
  w.employee_code,
  w.employee_name,
  w.department,
  w.notes as withdrawal_notes,
  w.created_at as withdrawal_date,
  wi.id as item_id,
  ei.name as equipment_name,
  ei.unit,
  wi.quantity
FROM equipment_withdrawals w
JOIN withdrawal_items wi ON w.id = wi.withdrawal_id
JOIN equipment_items ei ON wi.equipment_item_id = ei.id
ORDER BY w.created_at DESC;

-- ส่วนที่ 4: สร้าง View สรุปการเบิก
DROP VIEW IF EXISTS employee_withdrawal_summary CASCADE;

CREATE VIEW employee_withdrawal_summary AS
SELECT 
  w.employee_code,
  w.employee_name,
  w.department,
  ei.name as equipment_name,
  ei.unit,
  SUM(wi.quantity) as total_quantity,
  COUNT(DISTINCT w.id) as withdrawal_count,
  MAX(w.created_at) as last_withdrawal_date
FROM equipment_withdrawals w
JOIN withdrawal_items wi ON w.id = wi.withdrawal_id
JOIN equipment_items ei ON wi.equipment_item_id = ei.id
GROUP BY w.employee_code, w.employee_name, w.department, ei.name, ei.unit
ORDER BY w.employee_name, ei.name;

-- ตรวจสอบโครงสร้างตาราง
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'equipment_withdrawals' 
ORDER BY ordinal_position;

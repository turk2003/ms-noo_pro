-- อัพเดตตาราง equipment_withdrawals ให้รองรับระบบพนักงาน
-- รัน SQL นี้ใน Supabase SQL Editor

-- ตรวจสอบว่ามีตารางหรือยัง
DO $$ 
BEGIN
    -- ถ้าไม่มีตาราง ให้สร้างใหม่
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'equipment_withdrawals') THEN
        CREATE TABLE equipment_withdrawals (
          id BIGSERIAL PRIMARY KEY,
          employee_id BIGINT REFERENCES employees(id),
          employee_code TEXT NOT NULL,
          employee_name TEXT NOT NULL,
          department TEXT NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
    ELSE
        -- ถ้ามีตารางแล้ว ให้เพิ่มคอลัมน์ใหม่
        ALTER TABLE equipment_withdrawals 
        ADD COLUMN IF NOT EXISTS employee_id BIGINT REFERENCES employees(id),
        ADD COLUMN IF NOT EXISTS employee_code TEXT;
        
        -- อัพเดตค่าเริ่มต้นให้กับข้อมูลเก่า (ถ้ามี)
        UPDATE equipment_withdrawals 
        SET employee_code = 'UNKNOWN' 
        WHERE employee_code IS NULL;
    END IF;
END $$;

-- สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_equipment_withdrawals_created_at ON equipment_withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equipment_withdrawals_employee_code ON equipment_withdrawals(employee_code);
CREATE INDEX IF NOT EXISTS idx_equipment_withdrawals_employee_name ON equipment_withdrawals(employee_name);

-- เปิดใช้งาน Row Level Security
ALTER TABLE equipment_withdrawals ENABLE ROW LEVEL SECURITY;

-- ลบ policies เก่า (ถ้ามี)
DROP POLICY IF EXISTS "Enable read access for all users" ON equipment_withdrawals;
DROP POLICY IF EXISTS "Enable insert access for all users" ON equipment_withdrawals;

-- สร้าง policies ใหม่
CREATE POLICY "Enable read access for all users" 
  ON equipment_withdrawals FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for all users" 
  ON equipment_withdrawals FOR INSERT 
  WITH CHECK (true);

-- สร้างตาราง withdrawal_items (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS withdrawal_items (
  id BIGSERIAL PRIMARY KEY,
  withdrawal_id BIGINT NOT NULL REFERENCES equipment_withdrawals(id) ON DELETE CASCADE,
  equipment_item_id BIGINT NOT NULL REFERENCES equipment_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- สร้าง indexes สำหรับ withdrawal_items
CREATE INDEX IF NOT EXISTS idx_withdrawal_items_withdrawal_id ON withdrawal_items(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_items_equipment_id ON withdrawal_items(equipment_item_id);

-- เปิดใช้งาน Row Level Security
ALTER TABLE withdrawal_items ENABLE ROW LEVEL SECURITY;

-- ลบ policies เก่า (ถ้ามี)
DROP POLICY IF EXISTS "Enable read access for all users" ON withdrawal_items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON withdrawal_items;

-- สร้าง policies ใหม่
CREATE POLICY "Enable read access for all users" 
  ON withdrawal_items FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for all users" 
  ON withdrawal_items FOR INSERT 
  WITH CHECK (true);

-- สร้าง/อัพเดต View สำหรับดูรายการเบิกพร้อมรายละเอียด
DROP VIEW IF EXISTS withdrawal_details_view;
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

-- สร้าง/อัพเดต View สำหรับสรุปการเบิกของพนักงานแต่ละคน
DROP VIEW IF EXISTS employee_withdrawal_summary;
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

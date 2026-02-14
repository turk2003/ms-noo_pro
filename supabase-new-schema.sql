-- ระบบเบิกอุปกรณ์แบบใหม่ - รองรับการเบิกหลายรายการพร้อมกัน

-- 0. ตารางพนักงาน (Employees Master List)
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL UNIQUE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 1. ตารางรายการอุปกรณ์ (Equipment Items Master List)
CREATE TABLE equipment_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. ตารางหลักการเบิกอุปกรณ์ (Withdrawal Header)
CREATE TABLE equipment_withdrawals (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id),
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. ตารางรายละเอียดการเบิก (Withdrawal Details)
CREATE TABLE withdrawal_items (
  id BIGSERIAL PRIMARY KEY,
  withdrawal_id BIGINT NOT NULL REFERENCES equipment_withdrawals(id) ON DELETE CASCADE,
  equipment_item_id BIGINT NOT NULL REFERENCES equipment_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- สร้าง indexes
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_name ON employees(employee_name);
CREATE INDEX idx_equipment_items_name ON equipment_items(name);
CREATE INDEX idx_equipment_withdrawals_created_at ON equipment_withdrawals(created_at DESC);
CREATE INDEX idx_equipment_withdrawals_employee_code ON equipment_withdrawals(employee_code);
CREATE INDEX idx_equipment_withdrawals_employee_name ON equipment_withdrawals(employee_name);
CREATE INDEX idx_withdrawal_items_withdrawal_id ON withdrawal_items(withdrawal_id);
CREATE INDEX idx_withdrawal_items_equipment_id ON withdrawal_items(equipment_item_id);

-- เปิดใช้งาน Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_items ENABLE ROW LEVEL SECURITY;

-- สร้าง policies (อนุญาตให้ทุกคนอ่านและเพิ่มข้อมูลได้)
CREATE POLICY "Enable read access for all users" ON employees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON employees FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON equipment_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON equipment_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON equipment_items FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON equipment_withdrawals FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON equipment_withdrawals FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON withdrawal_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON withdrawal_items FOR INSERT WITH CHECK (true);

-- เพิ่มข้อมูลรายการอุปกรณ์จากรูปภาพ
INSERT INTO equipment_items (name, unit, stock_quantity) VALUES
('หมากสีเขียว', 'ใบ', 1),
('หมากสีส้ม', 'ใบ', 9),
('หมากสีแดง', 'ใบ', 4),
('หมากสีเหลือง', 'ใบ', 2),
('กระดาษขาว', 'ใบ', 13),
('กาวนิลหนึ่งแสตก', 'อัน', 1),
('กิ่มถีบหนึบเเรง', 'อัน', 7),
('กิ่มถีบเเบงร์', 'อัน', 6),
('กิ่มลูดกระดาษ ชุน', 'อัน', 1),
('สายกาเท', 'เมตร', 5),
('กระบองเพ', 'อัน', 3),
('มีน', 'อัน', 1010),
('อุปถุน', 'อัน', 9),
('เมามี', 'อัน', 24),
('เทมเฮด', 'อัน', 20),
('เล่นมาเมด', 'อัน', 11),
('กะปี เคมิน', 'อัน', 14),
('น้ำฮันคูนเเอน', 'ขวด', 10);

-- Function สำหรับอัพเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัพเดต updated_at
CREATE TRIGGER update_equipment_items_updated_at BEFORE UPDATE ON equipment_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
('E010', 'อนุชา ขยัน', 'ฝ่ายผลิต');

-- View สำหรับดูรายการเบิกพร้อมรายละเอียด
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

-- View สำหรับสรุปการเบิกของพนักงานแต่ละคน
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

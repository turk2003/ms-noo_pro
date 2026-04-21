-- เปิดสิทธิ์ update/delete ให้ตารางประวัติการเบิก
-- รันไฟล์นี้ใน Supabase SQL Editor

ALTER TABLE equipment_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable update access for all users" ON equipment_withdrawals;
DROP POLICY IF EXISTS "Enable delete access for all users" ON equipment_withdrawals;
DROP POLICY IF EXISTS "Enable update access for all users" ON withdrawal_items;
DROP POLICY IF EXISTS "Enable delete access for all users" ON withdrawal_items;

CREATE POLICY "Enable update access for all users"
  ON equipment_withdrawals FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON equipment_withdrawals FOR DELETE
  USING (true);

CREATE POLICY "Enable update access for all users"
  ON withdrawal_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON withdrawal_items FOR DELETE
  USING (true);

SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('equipment_withdrawals', 'withdrawal_items')
ORDER BY tablename, policyname;

-- ลบ policies เก่าที่อาจจำกัดการ delete
DROP POLICY IF EXISTS "Allow public delete access" ON employees;
DROP POLICY IF EXISTS "Allow public delete access" ON equipment_items;

-- สร้าง policies ใหม่ที่อนุญาตให้ delete ได้
CREATE POLICY "Allow public delete access" ON employees
    FOR DELETE
    USING (true);

CREATE POLICY "Allow public delete access" ON equipment_items
    FOR DELETE
    USING (true);

-- ตรวจสอบ policies ปัจจุบัน
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('employees', 'equipment_items')
ORDER BY tablename, policyname;

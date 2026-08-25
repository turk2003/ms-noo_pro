# ระบบเบิกอุปกรณ์ - การไฟฟ้าส่วนภูมิภาค

ระบบจัดการการเบิก-คืนอุปกรณ์ พร้อมสรุปยอดคงเหลือแบบเรียลไทม์

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. ตั้งค่า Supabase สองโปรเจกต์:
   - ใช้โปรเจกต์เดิมสำหรับ `PEA KLA`
   - สร้างโปรเจกต์ Free เพิ่มสำหรับ `PEA PLD`
   - รัน `supabase-new-schema.sql` ใน SQL Editor ของทั้งสองโปรเจกต์
   - ข้อมูลพนักงาน อุปกรณ์ และประวัติการเบิกของแต่ละโปรเจกต์จะแยกจากกัน

3. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ URL และ Anon Key ของแต่ละโปรเจกต์:
```
NEXT_PUBLIC_PEA_KLA_SUPABASE_URL=your-kla-project-url
NEXT_PUBLIC_PEA_KLA_SUPABASE_ANON_KEY=your-kla-anon-key

NEXT_PUBLIC_PEA_PLD_SUPABASE_URL=your-pld-project-url
NEXT_PUBLIC_PEA_PLD_SUPABASE_ANON_KEY=your-pld-anon-key
```

ตัวแปรเดิม `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
ยังใช้เป็น fallback ของ KLA ได้ เพื่อให้ deployment เดิมทำงานต่อระหว่างการย้ายค่า

4. รันโปรเจค:
```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000 แล้วเลือกสำนักงาน หรือเข้าโดยตรง:

- `http://localhost:3000/pea-kla`
- `http://localhost:3000/pea-pld`

## Supabase Keep-alive

โปรเจกต์มี GitHub Actions workflow ที่ query ตาราง `equipment_items` วันละ 3 ครั้ง
เพื่อให้ Supabase Free Plan มีกิจกรรมฐานข้อมูลอย่างสม่ำเสมอ

ตั้งค่า repository secrets ที่ GitHub (`Settings > Secrets and variables > Actions`):

```text
PEA_KLA_SUPABASE_URL=https://your-kla-project-ref.supabase.co
PEA_KLA_SUPABASE_ANON_KEY=your-kla-anon-key
PEA_PLD_SUPABASE_URL=https://your-pld-project-ref.supabase.co
PEA_PLD_SUPABASE_ANON_KEY=your-pld-anon-key
```

ชื่อ secrets เดิม `SUPABASE_URL` และ `SUPABASE_ANON_KEY` ยังเป็น fallback ของ KLA
แต่ PLD ต้องเพิ่ม secrets ชุดใหม่ก่อน workflow จะสำเร็จ

จากนั้นเปิดหน้า `Actions > Supabase keep alive` แล้วกด `Run workflow`
เพื่อทดสอบครั้งแรก หากสำเร็จ workflow จะทำงานอัตโนมัติเวลาประมาณ
08:17, 16:17 และ 00:17 น. ตามเวลาไทย

ใช้เฉพาะ anon key สำหรับ workflow นี้ ห้ามใช้ service role key

## ฟีเจอร์

- ✅ ฟอร์มเบิก-คืนอุปกรณ์
- ✅ สรุปยอดคงเหลือแบบเรียลไทม์ (บวก-ลบอัตโนมัติ)
- ✅ ประวัติการเบิก-คืนทั้งหมด
- ✅ โทนสีม่วงตามที่ร้องขอ
- ✅ เชื่อมต่อกับ Supabase

## โครงสร้างฐานข้อมูล

ตาราง `equipment_requests`:
- id: รหัสอัตโนมัติ
- employee_name: ชื่อ-นามสกุลผู้เบิก
- department: หน่วยงาน/แผนก
- equipment_name: ชื่ออุปกรณ์
- quantity: จำนวน
- request_type: ประเภท (เบิก/คืน)
- notes: หมายเหตุ
- created_at: วันที่-เวลา

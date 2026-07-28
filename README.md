# ระบบเบิกอุปกรณ์ - การไฟฟ้าส่วนภูมิภาค

ระบบจัดการการเบิก-คืนอุปกรณ์ พร้อมสรุปยอดคงเหลือแบบเรียลไทม์

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. ตั้งค่า Supabase:
   - สร้างโปรเจค Supabase ใหม่ที่ https://supabase.com
   - คัดลอก URL และ Anon Key มาใส่ในไฟล์ `.env.local`
   - รันคำสั่ง SQL ในไฟล์ `supabase-schema.sql` ใน Supabase SQL Editor

3. แก้ไขไฟล์ `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. รันโปรเจค:
```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

## Supabase Keep-alive

โปรเจกต์มี GitHub Actions workflow ที่ query ตาราง `equipment_items` วันละ 3 ครั้ง
เพื่อให้ Supabase Free Plan มีกิจกรรมฐานข้อมูลอย่างสม่ำเสมอ

ตั้งค่า repository secrets ที่ GitHub (`Settings > Secrets and variables > Actions`):

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

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

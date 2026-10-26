# Resume & Portfolio

เว็บไซต์เรซูเม่และสะสมผลงาน เป็นไฟล์ HTML ไฟล์เดียว ไม่ต้องติดตั้งอะไร

## วิธีแก้ข้อมูลของตัวเอง

เปิด `index.html` แล้วแก้ตรงก้อน `const DATA = { ... }` ที่ด้านล่างของไฟล์
(ชื่อ, ติดต่อ, ผลงาน, ทักษะ, การศึกษา) ส่วนอื่นไม่ต้องแก้

- เพิ่มผลงานใหม่: คัดลอกบรรทัดใน `projects` แล้วแก้ข้อความ ตัวกรองหมวดจะเพิ่มให้อัตโนมัติจาก `tags`
- ใส่รูปโปรไฟล์: สร้างโฟลเดอร์ `images/` ใส่รูป แล้วตั้ง `photo: "images/me.jpg"`

## วิธีอัปโหลดขึ้น GitHub (ผ่านเว็บ ไม่ต้องใช้คำสั่ง)

1. เข้า https://github.com/new ตั้งชื่อ repository เป็น `ชื่อผู้ใช้.github.io` (เช่น `somchai.github.io`) เลือก Public แล้วกด Create repository
2. กด **uploading an existing file** แล้วลากไฟล์ `index.html`, `expense.html`, `booking.html`, `config.js`, `common.js` และ `README.md` (กับโฟลเดอร์ `images` ถ้ามี) ลงไป
3. กด **Commit changes**
4. รอประมาณ 1–2 นาที เว็บจะอยู่ที่ `https://ชื่อผู้ใช้.github.io`

ถ้าใช้ชื่อ repository อื่น (เช่น `portfolio`) ให้ไปที่ **Settings → Pages** เลือก Branch `main` และโฟลเดอร์ `/ (root)` แล้วกด Save
เว็บจะอยู่ที่ `https://ชื่อผู้ใช้.github.io/portfolio`

## วิธีอัปโหลดด้วยคำสั่ง Git

```bash
cd portfolio
git init
git add .
git commit -m "Add resume and portfolio"
git branch -M main
git remote add origin https://github.com/ชื่อผู้ใช้/ชื่อผู้ใช้.github.io.git
git push -u origin main
```

ครั้งต่อไปที่แก้ไข ใช้ `git add . && git commit -m "Update" && git push`

## โหมดใช้งานทันที (ไม่ต้องตั้งค่าอะไรเพิ่ม)

หลังอัปโหลดขึ้น GitHub Pages แอป Expense และ Booking ใช้งานได้เลย โดยเก็บข้อมูลในเบราว์เซอร์ของผู้ใช้แต่ละคน
(หน้าแอปจะแสดงข้อความ "Demo mode") ข้อมูลจะไม่ถูกแชร์ข้ามเครื่องหรือข้ามผู้ใช้

## อัปเกรดเป็นระบบจริง: ล็อกอิน + ข้อมูลบนคลาวด์ + ทุกคนเห็นการจองเดียวกัน (ไม่บังคับ ประมาณ 10 นาที)

ใช้ Supabase (ฟรี) เมื่อใส่คีย์ใน `config.js` แอปจะสลับเป็นโหมดคลาวด์อัตโนมัติ

1. สมัครที่ https://supabase.com แล้วกด **New project** (จดรหัสผ่านฐานข้อมูลไว้)
2. ไปที่ **SQL Editor → New query** วางเนื้อหาจากไฟล์ `supabase-setup.sql` ทั้งหมด แล้วกด **Run** (รันซ้ำได้ ไม่เสียหาย)
3. ไปที่ **Project Settings → API** คัดลอก **Project URL** และ **anon public key** ไปใส่ในไฟล์ `config.js`
   - ห้ามใช้คีย์ `service_role` เด็ดขาด (anon key เผยแพร่ได้ เพราะมี Row Level Security คุมอยู่)
4. ไปที่ **Authentication → Sign In / Providers**
   - Email: ปิด **Confirm email** ถ้าอยากให้สมัครแล้วใช้ได้ทันที
   - เปิด **Allow anonymous sign-ins** เพื่อให้ปุ่ม "Continue as guest" ใช้ได้
5. ไปที่ **Authentication → URL Configuration** ตั้ง **Site URL** เป็นที่อยู่เว็บของคุณ เช่น `https://ชื่อผู้ใช้.github.io`
6. อัปโหลด `config.js` ที่แก้แล้วขึ้น GitHub ทับไฟล์เดิม

ความปลอดภัยในฐานข้อมูล: Expense เห็นและลบได้เฉพาะของตัวเอง, Booking ทุกคนที่ล็อกอินเห็นการจองทั้งหมดแต่ยกเลิกได้เฉพาะของตัวเอง
และฐานข้อมูลไม่ยอมให้จองเวลาซ้อนกันแม้สองคนกดพร้อมกัน

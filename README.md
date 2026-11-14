# INTANIA MUSIC FEST 2027 · เว็บลงทะเบียน

```
web/        ← หน้าเว็บทั้งหมด (อัปขึ้น GitHub Pages)
supabase/   ← schema.sql สำหรับสร้างฐานข้อมูล
```

## หน้าเว็บ

| ไฟล์ | หน้า |
|---|---|
| `index.html` | หน้าหลัก: ประชาสัมพันธ์ นับถอยหลัง ยอดลงทะเบียน ประกาศ อันดับกรุ๊ป |
| `register.html` | ลงทะเบียนด้วย Google แล้วกรอกฟอร์มสั้น ๆ (ลิงก์ชวนเพื่อน `register.html?ref=CODE` จะกรอกรหัสให้อัตโนมัติ) |
| `me.html` | บัตร & แต้มของฉัน: QR รับบัตร แต้ม รหัสชวนเพื่อน ประวัติแต้ม |
| `leaderboard.html` | อันดับกรุ๊ป + อันดับแต้มเพื่อนชวนเพื่อน (อัปเดตทุก 30 วินาที) |
| `staff.html` | ทีมงาน: สแกน QR รับบัตร / แลกแต้ม |
| `admin.html` | หลังบ้าน: กราฟ รายชื่อ + Export CSV, ตั้งค่า, ของรางวัล, ประกาศ, ทีมงาน |

ถ้ายังไม่ได้ใส่คีย์ Supabase เว็บจะรันใน **โหมด DEMO** (ข้อมูลปลอม ทุกปุ่มกดได้) ใช้เปิดดูหน้าตาได้เลย

---

## ติดตั้ง (ทำครั้งเดียว ~30 นาที)

### 1. สร้าง Supabase
1. สมัครที่ supabase.com → **New project** → Region: **Southeast Asia (Singapore)**
2. **SQL Editor → New query** → วางทั้งไฟล์ `supabase/schema.sql` → **Run**
3. **Project Settings → API** → ก๊อป `Project URL` และ `anon / publishable key`
   ไปใส่ใน `web/assets/config.js` (คีย์นี้เปิดเผยได้ ข้อมูลถูกป้องกันด้วย Row Level Security)

> แพลนฟรีรับคนหลักหมื่นได้ แต่ **โปรเจกต์ฟรีจะถูกพักถ้าไม่มีคนใช้ 7 วัน** และไม่มี backup รายวัน
> แนะนำอัปเป็น **Pro ($25/เดือน)** ช่วง ธ.ค.–ม.ค. แล้วค่อยลดกลับ

### 2. เปิด Google Login
1. console.cloud.google.com → สร้างโปรเจกต์ → **APIs & Services → OAuth consent screen**
   - User type: **External**, ใส่ชื่อแอป `INTANIA MUSIC FEST 2027` + อีเมลติดต่อ
   - Scopes: ใช้ค่าเริ่มต้น (email, profile, openid) → กด **Publish app** (ให้เป็น In production)
2. **Credentials → Create credentials → OAuth client ID → Web application**
   - Authorized JavaScript origins: `https://<ชื่อบัญชี>.github.io`
   - Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`
     (ดูได้ใน Supabase → Authentication → Providers → Google)
3. Supabase → **Authentication → Providers → Google** → เปิด แล้ววาง Client ID / Client Secret
4. Supabase → **Authentication → URL Configuration**
   - Site URL: `https://<ชื่อบัญชี>.github.io/<repo>/`
   - Redirect URLs: เพิ่ม `https://<ชื่อบัญชี>.github.io/**`

> ⚠️ **ทดสอบล็อกอินด้วยอีเมล @student.chula.ac.th ให้เร็วที่สุด**
> ถ้ามหาวิทยาลัยบล็อกแอปภายนอก จะขึ้นข้อความว่า "access blocked" ต้องติดต่อฝ่าย IT จุฬาฯ
> หรือเปลี่ยนไปใช้ Microsoft login (Supabase รองรับ provider "Azure")

### 3. อัปขึ้น GitHub Pages
อัปทุกอย่างใน `web/` ไว้ที่ root ของ repo → Settings → Pages → Branch `main` / `(root)` → Save

### 4. ตั้งตัวเองเป็นแอดมิน
เข้าเว็บแล้วล็อกอินด้วย Google 1 ครั้ง จากนั้นรันใน SQL Editor:
```sql
insert into public.staff (user_id, email, role)
select id, email, 'admin' from auth.users where email = 'อีเมลของคุณ';
```
แอดมินคนอื่น / ทีมงานสแกน เพิ่มได้จากหน้า **หลังบ้าน → ทีมงาน & กรุ๊ป** (คนนั้นต้องล็อกอินเว็บ 1 ครั้งก่อน)

---

## ไทม์ไลน์ (กดสวิตช์ในหลังบ้าน → ตั้งค่า)

| ช่วง | ตั้งค่า |
|---|---|
| ธ.ค. รอบนิสิตวิศวะ | `เปิดรอบนิสิตวิศวะ` ✅ · `เปิดสะสมแต้มเพื่อนชวนเพื่อน` ✅ |
| 14 ธ.ค. ปิดรอบวิศวะ | ปิด `เปิดรอบนิสิตวิศวะ` (และปิดสะสมแต้ม ถ้าจบแคมเปญ) |
| ก่อน ม.ค. รอบทั่วไป | `เปิดรอบทั่วไป` ✅ · เลือกว่าจะ `รับบุคคลภายนอก` หรือไม่ |
| กลาง ม.ค. | `แสดง QR รับบัตร` ✅ |
| วันงาน | `เปิดระบบแลกแต้ม` ✅ · เพิ่มของรางวัลในแท็บของรางวัล |

## กติกาที่ระบบใช้
- **นิสิตวิศวะ** = อีเมล `รหัสนิสิต@student.chula.ac.th` ที่รหัสลงท้าย `21` (ระบบเดาชั้นปีจากรหัสให้)
- **นิสิตจุฬาฯ** = `@student.chula.ac.th` อื่น ๆ · **บุคลากร** = `@chula.ac.th` · ที่เหลือ = บุคคลทั่วไป
- 1 บัญชี Google ลงทะเบียนได้ 1 ครั้ง · ชวนตัวเองไม่ได้ · ใส่รหัสเพื่อนที่ไม่มีอยู่จริงไม่ได้
- แลกแต้มต้องทำโดยทีมงานเท่านั้น ระบบล็อกแถวข้อมูลตอนตัดแต้ม กันการแลกซ้อนพร้อมกัน
- ทุกการเปลี่ยนแต้มเก็บไว้ในตาราง `points_ledger` ตรวจย้อนหลังได้

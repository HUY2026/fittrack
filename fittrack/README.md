# 🔥 FitTrack — Kế hoạch tập luyện & dinh dưỡng cá nhân

App theo dõi hành trình giảm mỡ tăng cơ: 79kg → 64kg, bodyfat 10–12%.

## Tính năng

- **Dashboard** — tổng quan tiến độ, lịch tuần, thực đơn hôm nay
- **Tập luyện** — lịch tập 6 ngày/tuần với hướng dẫn chi tiết từng bài, ghi set/rep/kg
- **Dinh dưỡng** — ghi calo & protein hàng ngày, hỗ trợ cheat day
- **Tiến độ** — biểu đồ cân nặng, calo, lịch sử tập luyện

## Deploy (3 bước)

### 1. Tạo Supabase database

1. Vào [supabase.com](https://supabase.com) → tạo project mới
2. Vào **SQL Editor** → chạy file `supabase/migrations/001_init.sql`
3. Lưu lại **Project URL** và **anon public key** (Settings → API)

### 2. Push lên GitHub

```bash
cd fittrack
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fittrack.git
git push -u origin main
```

### 3. Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New Project** → import repo từ GitHub
2. Thêm **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL từ Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key từ Supabase
3. Click **Deploy** → done! ✅

## Chạy local

```bash
cp .env.local.example .env.local
# Điền Supabase URL và key vào .env.local

npm install
npm run dev
# Mở http://localhost:3000
```

## Tech stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL)
- **Tailwind CSS**
- **Recharts** (biểu đồ)
- **Vercel** (hosting)

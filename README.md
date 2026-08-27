# 32-р сургууль — School Management System

## 1. Install
```bash
npm install
```

## 2. Supabase
1. Supabase project үүсгэ.
2. SQL Editor -> `supabase/schema.sql` бүхэлд нь ажиллуул.
3. Authentication -> Email provider-оо идэвхжүүл.
4. Project Settings -> API-ээс URL болон anon key-гээ ав.

## 3. Environment
`.env.example`-ийг `.env` болгож:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 4. Admin
Эхлээд app-аар нэг account үүсгэ. Дараа нь Supabase SQL Editor дээр:
```sql
update public.profiles
set role='ADMIN'
where email='YOUR_EMAIL';
```

## 5. Run
```bash
npm run dev
```

Browser:
http://localhost:5173

## Included
- Supabase Auth
- Admin / Teacher / Student roles
- RLS
- Student dashboard
- Attendance
- Grades
- Assignments read view
- Realtime chat
- Admin users/classes view
- Responsive UI

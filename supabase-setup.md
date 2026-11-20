# Markaziy tashrif bazasi (Supabase) — bosqichma-bosqich

Maqsad: barcha qurilmalardagi tashrifchilarni bitta bazaga yig'ish va admin panelda ko'rish.
Kod allaqachon yozilgan — sizga faqat quyidagi dashboard qadamlarini bajarish qoladi.

## 1. Supabase loyihasini yarating
1. https://supabase.com → **Start your project** → GitHub/email bilan kiring (bepul).
2. **New project** → nom: `portfolio`, kuchli **Database Password** o'ylab toping, region: Frankfurt (yaqinroq). **Create**.
3. ~2 daqiqa kutiladi.

## 2. `visits` jadvalini yarating
Chap menyu → **SQL Editor** → **New query** → quyidagini joylab **Run**:

```sql
create table if not exists public.visits (
  id          bigint generated always as identity primary key,
  visited_at  timestamptz not null default now(),
  ip          text,
  location    text,
  isp         text,
  device      text,
  browser     text,
  os          text,
  gps         text,
  duration    text,
  path        text,
  referrer    text,
  user_agent  text
);

-- Tez filtrlash uchun (oy bo'yicha)
create index if not exists visits_visited_at_idx on public.visits (visited_at desc);

-- RLS yoqamiz: hech kim anon kalit bilan o'qiy/yoza olmaydi.
-- Bizning Netlify funksiyamiz service_role kalit bilan ishlaydi (RLS'ni aylanib o'tadi).
alter table public.visits enable row level security;
```

## 3. Kalitlarni oling
Chap menyu → **Project Settings** (tishli) → **API**:
- **Project URL** → `SUPABASE_URL` (masalan `https://abcd1234.supabase.co`)
- **Project API keys → service_role** (`secret` deb yozilgan) → `SUPABASE_SERVICE_KEY`
  - ⚠️ Bu MAXFIY kalit. Hech qachon brauzer/JS ichiga yozmang. Faqat server (Netlify env) da.

`ADMIN_TOKEN` uchun uzun tasodifiy satr o'ylab toping (masalan parol generatori bilan 32+ belgi).

## 4. Netlify'da environment variable'lar
Netlify → saytingiz → **Site configuration → Environment variables** → **Add a variable** (3 ta):

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | (2-bosqichdagi Project URL) |
| `SUPABASE_SERVICE_KEY` | (service_role kalit) |
| `ADMIN_TOKEN` | (o'ylab topgan uzun satringiz) |

So'ng **Deploys → Trigger deploy → Deploy site** (yangi env'lar yangi deploy'da kuchga kiradi).

## 5. admin.html'dagi tokenni moslang
`admin.html` ichida:
```js
const ADMIN_TOKEN = 'CHANGE_ME_to_a_long_random_string';
```
Bu qiymatni Netlify'dagi `ADMIN_TOKEN` bilan **bir xil** qiling.

## 6. Lokal test (ixtiyoriy, localhost:1010)
`supabase-secret.example.json` → `supabase-secret.json` deb nusxalang, qiymatlarni to'ldiring.
Keyin `node server.js` va saytni oching. (`supabase-secret.json` ni git'ga qo'shmang!)

## 7. Tekshirish
1. Saytga (jonli yoki lokal) bir necha marta turli qurilmadan kiring.
2. Supabase → **Table Editor → visits** — qatorlar paydo bo'lishi kerak.
3. Admin panel → **Markaziy baza** tugmasi → barcha qurilmalardagi tashriflar ko'rinadi.
4. Oy menyusidan **May** ni tanlang yoki **CSV** ga eksport qiling.

## Qanday ishlaydi
- `visitor.js` → har tashrifda `/.netlify/functions/log-visit` ga POST → Supabase'ga qator.
- `admin.html` → **Markaziy baza** → `/.netlify/functions/get-visits?token=...` → jadval.
- Maxfiy kalit faqat serverda; brauzerga hech qachon chiqmaydi.

## Xavfsizlik eslatmasi
`ADMIN_TOKEN` admin.html (brauzer) ichida bo'lgani uchun — bu YENGIL himoya (manba kodni ko'rgan odam tokenni ko'radi). Jiddiy himoya kerak bo'lsa: **Netlify Identity** yoki Supabase Auth bilan haqiqiy login qo'shing. Hozircha token tasodifiy bo'tlar va oddiy kirishni to'xtatadi.

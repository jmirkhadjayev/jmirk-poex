# Netlify — Telegram proxy sozlash (qadam-baqadam)

Token endi brauzerda emas, **Netlify env-o'zgaruvchisida** turadi. Funksiya
va konfiguratsiya allaqachon sayt papkasiga qo'shilgan:

- `netlify.toml` — konfiguratsiya
- `netlify/functions/tg.js` — Telegram proxy funksiyasi
- frontend (`assets/js/tg.js`) → `/.netlify/functions/tg` ga so'rov yuboradi

---

## 1. Saytni odatdagidek deploy qiling
Shu papkani Netlify'ga deploy qiling (drag-and-drop yoki Git).
Netlify `netlify.toml` ni avtomatik o'qiydi va funksiyani aniqlaydi.

## 2. Env-o'zgaruvchilarni qo'shing (eng muhim)
Netlify dashboard → saytingiz → **Site configuration** →
**Environment variables** → **Add a variable** → ikkitasini qo'shing:

| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | BotFather'dan olgan tokeningiz (yangilangan bo'lsa yaxshi) |
| `TELEGRAM_CHAT_ID`   | Kanal/chat ID'ingiz |

## 3. Qayta deploy qiling
**Deploys → Trigger deploy → Deploy site** — funksiya env-larni o'qishi uchun.

## 4. Tekshirish
Saytingizni oching → Telegram kanalingizga "Yangi tashrif" xabari kelishi kerak.

Yoki terminalda (deploydan keyin):
```bash
curl -X POST "https://SIZNING-SAYT.netlify.app/.netlify/functions/tg" \
  -H "Content-Type: application/json" \
  -d '{"method":"sendMessage","text":"Netlify proxy test ✅"}'
```
`{"ok":true,...}` qaytsa — tayyor. ✅

---

## Lokal test (ixtiyoriy)
Statik server (`python -m http.server`) funksiyalarni ishlatmaydi, shuning uchun
lokalda Telegram so'rovi 404 bo'ladi. Lokalda sinash uchun:
```bash
npm install -g netlify-cli
netlify dev
```

## ⚠️ Xavfsizlik
Bot token bu suhbatda va eski kodda ochiq bo'lgan. Eng yaxshisi:
**@BotFather → /revoke** bilan tokenni yangilang va **yangi tokenni faqat
Netlify env-iga** qo'ying (hech qayerga yozmang). Eski token o'chadi.

> Eslatma: `cloudflare-worker/` papkasi endi kerak emas (Netlify tanlandi).
> O'chirishni xohlasangiz ayting.

# Cloudflare Worker — Telegram proxy sozlash (qadam-baqadam)

Maqsad: bot tokenni brauzerdan yashirish. Token Worker ichida **secret** bo'lib turadi, sayt faqat Worker manziliga so'rov yuboradi.

---

## 1. Cloudflare akkaunt
1. https://dash.cloudflare.com/sign-up — bepul ro'yxatdan o'ting (karta kerak emas).
2. Emailni tasdiqlang va kiring.

## 2. Worker yaratish
1. Chap menyu: **Workers & Pages** → **Create application** → **Create Worker**.
2. Nom bering, masalan: `tg-proxy` → **Deploy** (avtomatik namuna deploy bo'ladi).
3. **Edit code** tugmasini bosing.
4. Ochilgan muharrirdagi hamma kodni o'chirib, ushbu papkadagi **`worker.js`** mazmunini to'liq joylashtiring.
5. `ALLOWED_ORIGINS` ro'yxatini tekshiring — sizning domeningiz (`https://mirkhadjayev.uz`) borligiga ishonch hosil qiling.
6. Yuqori o'ngdan **Deploy**.

## 3. Secret'larni qo'shish (eng muhim qism)
1. Worker sahifasida: **Settings** → **Variables and Secrets** (yoki "Variables").
2. **Add variable** orqali ikkitasini qo'shing va turini **Secret (Encrypt)** qiling:
   - `BOT_TOKEN` = BotFather'dan olgan tokeningiz
   - `CHAT_ID` = kanal/chat ID'ingiz
3. **Deploy** / **Save**.

## 4. Worker URL'ini olish
- Worker sahifasi yuqorisida manzil ko'rinadi, masalan:
  `https://tg-proxy.SIZNING-NOM.workers.dev`
- Shu URL'ni nusxalang.

## 5. (Tavsiya) Rate limit
- **Security → WAF → Rate limiting rules** → yangi qoida: bitta IP daqiqada 30 so'rovdan oshsa bloklansin. (Ixtiyoriy, spamdan himoya.)

## 6. Menga URL'ni bering
Worker URL'ini menga yuboring — men:
- `assets/js/tg.js` dagi `WORKER_URL` ga qo'yaman,
- **`BOT_TOKEN` ni frontend'dan butunlay o'chiraman** (asosiy maqsad shu).

Shundan keyin token brauzerda umuman ko'rinmaydi. ✅

---

### Tez test (ixtiyoriy, terminalda)
Deploydan keyin Worker ishlayotganini tekshirish:

```bash
curl -X POST "https://tg-proxy.SIZNING-NOM.workers.dev" \
  -H "Origin: https://mirkhadjayev.uz" \
  -H "Content-Type: application/json" \
  -d '{"method":"sendMessage","text":"Worker test ✅","parse_mode":"HTML"}'
```

`{"ok":true,...}` qaytsa — tayyor.

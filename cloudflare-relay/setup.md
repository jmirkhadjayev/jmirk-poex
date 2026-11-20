# Anonim ikki tomonlama bot — Cloudflare Worker (Variant 2)

Maqsad: foydalanuvchi **username yozmasdan** botga anonim yozadi → sizga keladi → siz **reply** qilib javob berasiz → unga qaytadi. Uchinchi tomon (Livegram) **yo'q** — hammasi sizniki.

Bot: **@JmPortfolioCHAT_BOT** (token BotFather'dan).
⚠️ Avval bu botni **Livegram'dan uzing** (agar ulangan bo'lsa): @LivegramBot → sozlamalar → botni o'chiring. Biz webhook o'rnatamiz, ikkisi birga ishlamaydi.

---

## 1. Cloudflare'da Worker yaratish
1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker**.
2. Nom bering (masalan `anon-relay`) → **Deploy** (hozircha shablon kodi turaveradi).
3. **Edit code** → hamma narsani o'chirib, `worker.js` faylimdagi kodni to'liq joylashtiring → **Deploy**.

## 2. KV ombor (xabarlarni bog'lash uchun)
1. Chap menyu: **Storage & Databases → KV** → **Create namespace** → nom: `relay` → yarating.
2. Worker'ingizga qайting → **Settings → Bindings → Add → KV namespace**.
   - **Variable name:** `RELAY`  (aynan shu nom, katta harflarda)
   - **KV namespace:** yuqorida yaratganingiz (`relay`)
   - **Save**.

## 3. O'zgaruvchilar va sirlar (Settings → Variables and Secrets)
Uchtasini qo'shing:

| Nomi | Turi | Qiymati |
|------|------|---------|
| `BOT_TOKEN` | **Secret** | BotFather bergan to'liq token (`8890901937:AAH...`) |
| `WEBHOOK_SECRET` | **Secret** | O'zingiz o'ylab topgan tasodifiy satr (masalan `mY_s3cret_92`) |
| `OWNER_CHAT_ID` | **Text** | Hozircha bo'sh qoldiring — 5-qadamda to'ldiramiz |

**Save and deploy**.

## 4. Webhook'ni o'rnatish (botni Worker'ga ulash)
1. Worker manzilini oling — `https://anon-relay.<sizning>.workers.dev` (Worker sahifasida ko'rinadi).
2. Brauzerda quyidagi manzilni oching (`<...>` larni almashtiring):

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://anon-relay.<sizning>.workers.dev&secret_token=<WEBHOOK_SECRET>
```

3. `{"ok":true,"result":true,"description":"Webhook was set"}` chiqsa — ulandi. ✅

## 5. O'zingizning chat ID'ingizni olish
1. Telegram'da **@JmPortfolioCHAT_BOT**ga `/id` deb yozing.
2. Bot `Chat ID: 7384979544` kabi raqam qaytaradi — bu **sizniki**.
3. Cloudflare → Worker → **Settings → Variables → `OWNER_CHAT_ID`** ga shu raqamni yozing → **Save and deploy**.

> Eslatma: `OWNER_CHAT_ID` — siz xabarlarni qabul qiladigan va javob yozadigan chat. Shaxsiy chat tavsiya etiladi (siz botga `/id` yozgan joy).

## 6. Test (BOSHQA akkauntdan)
1. Boshqa Telegram akkaunt (yoki do'st) → `t.me/JmPortfolioCHAT_BOT` → **Start** → "test salom".
2. Sizga `🕵️ Anonim #1234:` sarlavhasi bilan xabar keladi.
3. O'sha xabarni **chapga suring (Reply)** → javob yozing → foydalanuvchiga boradi. 🎉

---

## Qanday ishlaydi (qisqacha)
- Foydalanuvchi xabari → Worker uni sizga yuboradi va `message_id → foydalanuvchi` bog'lanishini KV'da saqlaydi.
- Siz **reply** qilsangiz → Worker KV'dan foydalanuvchini topib, javobni unga yuboradi.
- Siz foydalanuvchining ism/username'ini ko'rmaysiz — faqat `#1234` bilet.

## Saytdagi tugma
Saytdagi **"Anonim chatni ochish"** tugmasi allaqachon shu botга (`t.me/JmPortfolioCHAT_BOT`) ulangan — o'zgartirish shart emas.

## Muammo bo'lsa
- Webhook holatini ko'rish: `https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo`
  - `url` to'g'ri Worker manzili bo'lishi va `last_error_message` bo'sh bo'lishi kerak.
- Xabar kelmasa: `OWNER_CHAT_ID` to'g'ri raqammi, `RELAY` KV ulanganmi, deploy qilinganmi — tekshiring.
- Bir vaqtda Livegram va Worker ishlamaydi — bittasini tanlang (biz Worker'ni tanladik).

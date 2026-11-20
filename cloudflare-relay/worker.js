/* =======================================================
 * Cloudflare Worker — Anonymous two-way relay bot
 *
 * Visitors chat with your Telegram bot anonymously. Each message is
 * relayed to YOU (the owner). You reply by REPLYING to the relayed
 * message, and your reply is delivered back to that visitor.
 * The visitor's identity is NEVER shown to you (only a short ticket).
 *
 * This is your OWN backend — no third party (unlike Livegram).
 *
 * --- Cloudflare bindings (Worker → Settings) ---
 *   Variables and Secrets:
 *     BOT_TOKEN       (Secret)  Bot token from @BotFather
 *     OWNER_CHAT_ID   (Text)    Your numeric chat id (send /id to the bot to get it)
 *     WEBHOOK_SECRET  (Secret)  Any random string; also passed to setWebhook
 *   KV Namespace Bindings:
 *     RELAY           → a KV namespace (stores message_id → visitor chat id)
 * ======================================================= */

const WELCOME =
  "👋 Salom! Bu anonim aloqa boti.\n" +
  "Xabaringizni yozing — u egasiga anonim yetadi va javob shu yerda keladi.\n\n" +
  "👋 Hi! Send a message — it reaches me anonymously and I'll reply right here.";

const SENT_OK =
  "✅ Xabaringiz anonim yuborildi. Javob shu yerga keladi.\n" +
  "✅ Sent anonymously. The reply will arrive here.";

const TTL = 60 * 60 * 24 * 60; // keep mappings 60 days

async function tg(env, method, params) {
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

// short, non-identifying display code so you can tell visitors apart
function ticketFor(id) {
  return Math.abs(Number(id)).toString().slice(-4);
}

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("Anonymous relay bot is running.", { status: 200 });
    }
    if (request.method !== "POST") {
      return new Response("method not allowed", { status: 405 });
    }
    // Verify the request really came from Telegram (secret token header)
    if (env.WEBHOOK_SECRET) {
      const got = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (got !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
    }

    let update;
    try { update = await request.json(); }
    catch (e) { return new Response("ok", { status: 200 }); }

    const msg = update.message || update.edited_message;
    if (!msg || !msg.chat) return new Response("ok", { status: 200 });

    const chatId = msg.chat.id;
    const text = msg.text || "";
    const ownerId = String(env.OWNER_CHAT_ID || "");

    try {
      // ---------- commands ----------
      if (text === "/start") {
        await tg(env, "sendMessage", { chat_id: chatId, text: WELCOME });
        return new Response("ok", { status: 200 });
      }
      if (text === "/id") {
        await tg(env, "sendMessage", { chat_id: chatId, text: "Chat ID: " + chatId });
        return new Response("ok", { status: 200 });
      }

      // ---------- owner is replying ----------
      if (ownerId && String(chatId) === ownerId) {
        if (msg.reply_to_message) {
          const target = await env.RELAY.get("msg:" + msg.reply_to_message.message_id);
          if (target) {
            if (text) {
              await tg(env, "sendMessage", { chat_id: target, text: text });
            } else {
              // forward any media (photo, voice, file, sticker…) as-is
              await tg(env, "copyMessage", {
                chat_id: target, from_chat_id: chatId, message_id: msg.message_id,
              });
            }
            await tg(env, "sendMessage", {
              chat_id: ownerId, text: "✅ Javob yuborildi.",
              reply_to_message_id: msg.message_id,
            });
          } else {
            await tg(env, "sendMessage", {
              chat_id: ownerId,
              text: "⚠️ Bu suhbat topilmadi (muddati o'tgan). Javob yuborilmadi.",
              reply_to_message_id: msg.message_id,
            });
          }
        } else {
          await tg(env, "sendMessage", {
            chat_id: ownerId,
            text: "ℹ️ Javob berish uchun foydalanuvchi xabariga REPLY qiling.",
          });
        }
        return new Response("ok", { status: 200 });
      }

      // ---------- a visitor is messaging → relay to owner ----------
      if (!ownerId) {
        await tg(env, "sendMessage", {
          chat_id: chatId,
          text: "Bot hali to'liq sozlanmagan. Birozdan so'ng urinib ko'ring.",
        });
        return new Response("ok", { status: 200 });
      }

      const header = "🕵️ Anonim #" + ticketFor(chatId);
      let sent;
      if (text) {
        sent = await tg(env, "sendMessage", {
          chat_id: ownerId, text: header + ":\n\n" + text,
        });
      } else {
        await tg(env, "sendMessage", { chat_id: ownerId, text: header + ":" });
        sent = await tg(env, "copyMessage", {
          chat_id: ownerId, from_chat_id: chatId, message_id: msg.message_id,
        });
      }
      if (sent && sent.ok && sent.result) {
        await env.RELAY.put("msg:" + sent.result.message_id, String(chatId), {
          expirationTtl: TTL,
        });
      }

      // one-time confirmation to the visitor
      const greetedKey = "greeted:" + chatId;
      if (!(await env.RELAY.get(greetedKey))) {
        await tg(env, "sendMessage", { chat_id: chatId, text: SENT_OK });
        await env.RELAY.put(greetedKey, "1", { expirationTtl: TTL });
      }

      return new Response("ok", { status: 200 });
    } catch (e) {
      // never let Telegram retry-storm us; always 200
      return new Response("ok", { status: 200 });
    }
  },
};

document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    const messageContainer = document.getElementById('messageContainer');
    const messageAlert = messageContainer.querySelector('.alert');
    // Telegram delivery goes through window.tgApi (see tg.js).

    function showMessage(message, isSuccess = true) {
        messageAlert.textContent = message;
        messageAlert.className = 'alert';
        messageAlert.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        messageContainer.style.display = 'block';

        // Re-trigger the entrance animation every time (force reflow)
        messageAlert.classList.remove('msg-animate');
        void messageAlert.offsetWidth;
        messageAlert.classList.add('msg-animate');

        // Hide message after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const messageEl = document.getElementById('feedbackMessage');
            const message = messageEl ? messageEl.value.trim() : '';

            if (!message) {
                showMessage('Please write a message first', false);
                return;
            }

            // Optional reply contact (Telegram username / email). Stays anonymous if blank.
            const contactEl = document.getElementById('feedbackContact');
            const contact = contactEl ? contactEl.value.trim() : '';

            // Escape HTML-sensitive chars so user text can't break parse_mode=HTML
            const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            // Build the reply line. If the visitor left a Telegram handle / t.me link,
            // make it a TAPPABLE link so you can open their chat and reply in one tap
            // (from your own account). Plain emails are auto-linked by Telegram.
            function buildReplyLine(c) {
                if (!c) return `\n\n🕵️ <i>Anonymous — no reply channel</i>`;
                const tg = c.match(/(?:t(?:elegram)?\.me\/|@)\s*([A-Za-z0-9_]{4,32})/i);
                if (tg) {
                    const h = tg[1];
                    return `\n\n↩️ <b>Reply to:</b> <a href="https://t.me/${h}">@${h}</a>`;
                }
                return `\n\n↩️ <b>Reply to:</b> ${esc(c)}`; // email / phone — Telegram auto-links
            }
            const telegramMessage = `🕵️ <b>Anonymous message</b>\n\n💬 ${esc(message)}${buildReplyLine(contact)}`;

            // Save to localStorage under 'portfolio_messages' for the Admin Panel Inbox
            const localMessage = {
                id: Date.now(),
                name: 'Anonymous',
                email: contact || '—',
                message: message,
                date: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
            };
            try {
                const currentMessages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
                currentMessages.unshift(localMessage);
                localStorage.setItem('portfolio_messages', JSON.stringify(currentMessages));
            } catch (storageErr) {
                console.error('LocalStorage write error:', storageErr);
            }

            try {
                if (!window.tgApi) throw new Error('tg.js not loaded');
                const data = await window.tgApi('sendMessage', {
                    text: telegramMessage,
                    parse_mode: 'HTML'
                });

                if (data && data.ok) {
                    showMessage("🚀 Whoosh! Your anonymous message just flew off to me — thanks for sharing your thoughts! 🙌💚", true);
                    feedbackForm.reset();
                } else {
                    // The proxy responded but Telegram rejected the message (bad token,
                    // wrong chat_id, parse error…). This is a REAL failure — surface it,
                    // never fake success, or messages silently vanish.
                    var why = (data && (data.description || data.error)) || 'unknown error';
                    console.error('Telegram delivery failed:', data);
                    throw new Error('Telegram rejected the message: ' + why);
                }
            } catch (error) {
                console.error('Error:', error);
                // Distinguish "no backend reachable" (opened via file:// or a static
                // server with no Telegram proxy) from "backend responded with an error".
                // Only the former gets the soft local-preview note; a genuine delivery
                // failure must show as an error so it isn't mistaken for success.
                var noBackend = (error instanceof TypeError) // fetch network/connection failure
                    || /tg\.js not loaded/.test(error.message);
                var isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname)
                    || location.protocol === 'file:';
                if (noBackend && isLocal) {
                    showMessage("⚠️ No local Telegram server detected. Run `node server.js` and open http://localhost:1010 to deliver for real.", false);
                } else {
                    showMessage('Failed to send message. Please try again later.', false);
                }
            }
        });
    }
}); 
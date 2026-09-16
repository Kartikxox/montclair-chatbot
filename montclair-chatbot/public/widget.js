(function () {
  // Relative paths so API_BASE auto-derives from whatever domain serves this script —
  // no hardcoded URLs needed, same as Indoarab's widget.
  const API_BASE = '';

  const scriptTag = document.currentScript;
  const brandId = scriptTag?.getAttribute('data-brand-id') || 'montclair';

  const css = `
    .mc-widget-button {
      position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
      border-radius: 50%; background: #1a1a1a; color: #fff; border: none;
      cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25); z-index: 999999;
      font-size: 24px; display: flex; align-items: center; justify-content: center;
    }
    .mc-widget-window {
      position: fixed; bottom: 90px; right: 20px; width: 360px; max-width: 92vw;
      height: 520px; max-height: 75vh; background: #fff; border-radius: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2); display: none; flex-direction: column;
      overflow: hidden; z-index: 999999; font-family: -apple-system, sans-serif;
    }
    .mc-widget-window.mc-open { display: flex; }
    .mc-header { background: #1a1a1a; color: #fff; padding: 14px 16px; font-weight: 600; }
    .mc-messages { flex: 1; overflow-y: auto; padding: 12px; background: #fafafa; }
    .mc-msg { margin-bottom: 10px; padding: 8px 12px; border-radius: 10px; max-width: 80%; font-size: 14px; line-height: 1.4; }
    .mc-msg.mc-user { background: #1a1a1a; color: #fff; margin-left: auto; }
    .mc-msg.mc-bot { background: #eee; color: #222; }
    .mc-input-row { display: flex; border-top: 1px solid #eee; padding: 8px; }
    .mc-input-row input { flex: 1; border: none; outline: none; padding: 8px; font-size: 14px; }
    .mc-input-row button { background: #1a1a1a; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; }
    .mc-typing { display: flex; gap: 4px; padding: 8px 12px; }
    .mc-typing span { width: 6px; height: 6px; border-radius: 50%; background: #999; animation: mc-bounce 1.2s infinite ease-in-out; }
    .mc-typing span:nth-child(2) { animation-delay: 0.2s; }
    .mc-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes mc-bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const button = document.createElement('button');
  button.className = 'mc-widget-button';
  button.innerHTML = '💬';
  document.body.appendChild(button);

  const win = document.createElement('div');
  win.className = 'mc-widget-window';
  win.innerHTML = `
    <div class="mc-header">Montclair Assistant</div>
    <div class="mc-messages" id="mc-messages"></div>
    <div class="mc-input-row">
      <input type="text" id="mc-input" placeholder="Ask about scents, orders..." />
      <button id="mc-send">Send</button>
    </div>
  `;
  document.body.appendChild(win);

  const messagesEl = win.querySelector('#mc-messages');
  const inputEl = win.querySelector('#mc-input');
  const sendBtn = win.querySelector('#mc-send');

  let history = [];

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `mc-msg mc-${sender}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'mc-typing';
    div.id = 'mc-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('mc-typing-indicator')?.remove();
  }

  button.addEventListener('click', () => {
    win.classList.toggle('mc-open');
    if (win.classList.contains('mc-open') && !messagesEl.children.length) {
      addMessage("Hi! I'm Montclair's assistant. Ask me about our fragrances or track an order.", 'bot');
    }
  });

  async function sendMessage() {
    const question = inputEl.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    inputEl.value = '';
    showTyping();

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history, brandId }),
      });
      const data = await res.json();
      hideTyping();
      addMessage(data.answer || "Sorry, something went wrong.", 'bot');
      history.push({ role: 'user', parts: [{ text: question }] });
      history.push({ role: 'model', parts: [{ text: data.answer || '' }] });
    } catch (err) {
      hideTyping();
      addMessage("Sorry, I couldn't reach the server. Please try again.", 'bot');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();

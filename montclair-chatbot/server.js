require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { loadBrandData } = require('./lib/brandData');
const { buildContext } = require('./lib/context');
const { askGemini } = require('./lib/gemini');
const { trackOrder } = require('./lib/orderTracking');
const { sendWhatsAppMessage } = require('./lib/whatsapp');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

function isLikelyGibberish(text) {
  if (!text || !text.trim()) return true;
  const stripped = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
  if (!stripped) return true;
  const letters = (stripped.match(/[a-zA-Z]/g) || []).length;
  return letters < 2 && !/[0-9]/.test(stripped);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'montclair', time: new Date().toISOString() });
});

app.post('/api/ask', async (req, res) => {
  try {
    const { question, history } = req.body || {};

    if (isLikelyGibberish(question)) {
      return res.json({
        answer: "Sorry, I didn't quite catch that — could you rephrase your question?",
      });
    }

    const { brand, products, knowledgeBase } = await loadBrandData();
    const context = buildContext({ brand, products, knowledgeBase });
    const answer = await askGemini({ context, question, history });

    res.json({ answer });
  } catch (err) {
    console.error('Error in /api/ask:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again in a moment.' });
  }
});

app.post('/api/track-order', async (req, res) => {
  try {
    const { orderNumber, email } = req.body || {};
    if (!orderNumber) {
      return res.status(400).json({ error: 'orderNumber is required' });
    }
    const result = await trackOrder({ orderNumber, email });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/track-order:', err);
    res.status(500).json({ error: 'Could not fetch order status right now.' });
  }
});

// Meta calls this once, at setup time, to verify you own the webhook URL.
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification attempt:', { mode, token, expectedToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN });

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return res.status(200).send(challenge);
  }
  console.log('Webhook verification FAILED');
  return res.sendStatus(403);
});

// Meta calls this every time a customer sends a WhatsApp message.
app.post('/webhook/whatsapp', async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return;
    }

    const from = message.from;
    const question = message.text?.body || '';

    if (isLikelyGibberish(question)) {
      await sendWhatsAppMessage(from, "Sorry, I didn't quite catch that — could you rephrase?");
      return;
    }

    const { brand, products, knowledgeBase } = await loadBrandData();
    const context = buildContext({ brand, products, knowledgeBase });
    const answer = await askGemini({ context, question, history: [] });

    await sendWhatsAppMessage(from, answer);
  } catch (err) {
    console.error('Error handling WhatsApp webhook:', err);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Montclair chatbot server running on port ${PORT}`);
});
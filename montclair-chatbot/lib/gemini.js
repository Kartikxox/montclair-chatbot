const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = 'gemini-3.5-flash-lite';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSystemPrompt(context) {
  return `You are the helpful shopping assistant for Montclair (montclairindia.com), an Indian D2C fragrance brand.
Answer questions about products, scent recommendations, and order tracking using ONLY the context below.
Be warm, concise, and never invent products, prices, ingredients, certifications, safety/compliance claims, or order details that aren't explicitly in the context.

If a question falls outside what's in the context (e.g. ingredient sourcing, certifications like vegan/cruelty-free/IFRA compliance, manufacturing details, pregnancy safety, wholesale/affiliate programs, or anything you're not certain of from the context), do NOT guess or say a flat "I don't know." Instead, warmly redirect like this:
"That's a great question for our team directly — message us on Instagram @montclairindia or WhatsApp at +91 79826 35392 and they'll get you a detailed answer!"

Never present a redirect as a limitation of yours — frame it as pointing them to the best source, not as something you're unable to do.

Context:
${context}`;
}

async function askGemini({ context, question, history = [] }) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const systemPrompt = buildSystemPrompt(context);

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will answer using only the given context.' }] },
      ...history,
    ],
  });

  let attempt = 0;
  while (true) {
    try {
      const result = await chat.sendMessage(question);
      return result.response.text();
    } catch (err) {
      const is503 = err?.status === 503 || /503|overloaded/i.test(err?.message || '');
      if (is503 && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(delay);
        attempt += 1;
        continue;
      }
      throw err;
    }
  }
}

module.exports = { askGemini };

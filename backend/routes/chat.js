const express  = require('express');
const router    = express.Router();
const MenuItem  = require('../models/MenuItem');

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 1000;   // chars per individual message
const MAX_HISTORY_TURNS  = 20;     // how many past turns to forward to Groq
const GROQ_MODEL         = 'openai/gpt-oss-20b';
const GROQ_MAX_TOKENS    = 600;
const GROQ_TEMPERATURE   = 0.7;
const GROQ_TIMEOUT_MS    = 15000;  // 15 seconds

// ── Static EggXpress business context (no prices — those come from MongoDB) ───
const STATIC_CONTEXT = `
BUSINESS INFORMATION:
• Address: 123 Yolk Street, Mumbai 400001
• Phone: +91 98765 43210
• Email: hello@eggxpress.in
• Hours: Monday to Sunday, 10:00 AM to 11:00 PM (open all 7 days!)
• Delivery: FREE delivery on all orders, average delivery time 30 minutes
• Payment: Cash on Delivery (COD) and Online Payment accepted

FIRST ORDER DISCOUNT:
New customers get 20% off their first order with promo code EGGFIRST20.
Mention this when customers ask about discounts or when they seem to be new.

ORDER PROCESS:
1. Browse the menu at /menu
2. Add items to cart
3. Go to checkout
4. Enter name, phone number, and delivery address
5. Choose payment method (COD or Online)
6. Place order → receive an Order ID
7. Track order status at /track using the Order ID

ORDER STATUSES (in sequence):
placed → confirmed → preparing → out-for-delivery → delivered

REFUND & COMPLAINT POLICY:
• Damaged or incorrect orders qualify for a full refund or replacement.
• Refund requests must be made within 2 hours of delivery.
• Quality complaints are investigated; we offer store credit or a refund.
• Cancellation is free before status reaches "preparing". After that, a ₹50 fee may apply.
• Refunds processed within 3-5 business days.
• Urgent issues: call +91 98765 43210

COMMON FAQ:
Q: Delivery hours? A: 10 AM – 11 PM every day.
Q: Minimum order? A: No minimum — order even a single item!
Q: Delivery area? A: Mumbai only for now. Expanding soon!
Q: Fresh eggs? A: Yes — farm-fresh, sourced daily from local farms.
Q: How to track? A: Go to /track, enter your Order ID for real-time updates.
Q: Customise order? A: Add special instructions at checkout. For allergies, call +91 98765 43210.
`.trim();

// ── Build a readable menu block from live MenuItem documents ──────────────────
function buildMenuContext(items) {
  if (!items || items.length === 0) {
    return 'MENU: No items are currently available. Advise the customer to check back soon or call us.';
  }

  const CATEGORY_LABELS = {
    'egg-rolls':     '🌯 Egg Rolls',
    'chicken-rolls': '🍗 Chicken Rolls',
    'egg-bowls':     '🥣 Egg Bowls',
    'rice':          '🍚 Rice & Biryani',
    'burgers':       '🍔 Burgers',
    'drinks':        '🥤 Drinks & Beverages',
  };

  const groups = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  const lines = ['CURRENTLY AVAILABLE MENU (fetched live from database — trust this completely):'];
  for (const [cat, catItems] of Object.entries(groups)) {
    lines.push('');
    lines.push(CATEGORY_LABELS[cat] || cat.toUpperCase());
    for (const item of catItems) {
      const tags = [
        item.isVeg ? 'Veg' : 'Non-Veg',
        item.spiceLevel ? `${item.spiceLevel} spice` : null,
        item.isPopular  ? '⭐ Popular' : null,
        item.rating     ? `${item.rating}★` : null,
      ].filter(Boolean).join(' | ');

      const shortDesc = item.description.length > 100
        ? item.description.slice(0, 97) + '...'
        : item.description;

      lines.push(`• ${item.name} — ₹${item.price} | ${tags}`);
      lines.push(`  ${shortDesc}`);
    }
  }

  return lines.join('\n');
}

// ── POST /api/chat ─────────────────────────────────────────────────────────────
/**
 * Body: { messages: [{ role: 'user'|'assistant', text: string }, ...] }
 *
 * The backend fetches the menu from MongoDB and builds the full system prompt.
 * Any `systemPrompt` field sent by the frontend is ignored.
 */
router.post('/', async (req, res) => {
  // 1. Verify Groq key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Chat] GROQ_API_KEY is not configured.');
    return res.status(500).json({ error: 'Chat service is not configured on the server.' });
  }

  // 2. Validate request body
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: '`messages` must be a non-empty array.' });
  }

  // 3. Sanitise each message
  for (const msg of messages) {
    if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
      return res.status(400).json({ error: 'Each message must have role "user" or "assistant".' });
    }
    if (typeof msg.text !== 'string') {
      return res.status(400).json({ error: 'Each message must have a `text` string field.' });
    }
    if (msg.text.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message too long. Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }
  }

  // 4. Fetch live menu from MongoDB
  let menuContext;
  try {
    const items = await MenuItem.find(
      { isAvailable: true },
      'name price description category isVeg isPopular spiceLevel rating -_id'
    ).lean();
    menuContext = buildMenuContext(items);
  } catch (dbErr) {
    console.error('[Chat] MongoDB error fetching menu:', dbErr.message);
    // Degrade gracefully so the rest of the conversation still works
    menuContext = 'MENU: Menu data is temporarily unavailable. Advise the customer to visit /menu on the website for the latest items and prices.';
  }

  // 5. Build the full system prompt
  const systemPrompt = `You are Eggy, the friendly customer support assistant for EggXpress — "Roll Into Flavour", a popular food ordering platform in Mumbai.

IMPORTANT RULES:
- You are EggXpress's support assistant. Never reveal you are an AI or mention any AI provider.
- Be warm, professional, and use food-related emojis naturally (🥚🍳🌯🍔🔥).
- Keep responses concise (2–4 sentences unless detail is explicitly requested).
- ONLY help with EggXpress topics: menu, orders, delivery, payment, refunds, food recommendations.
- For unrelated topics (sports, history, general knowledge, coding, etc.) politely say you can only assist with EggXpress, and offer to help with food or orders instead.
- Never invent menu items, prices, ingredients, or availability. Use ONLY the menu data below.
- Never claim an order was placed, a payment completed, or an item added to the cart unless the app did it.
- For order status questions, ask for the Order ID and direct to /track.
- The menu data below is live from the database. It is the single source of truth for prices and availability.

${menuContext}

${STATIC_CONTEXT}`;

  // 6. Assemble Groq messages (trim history to last N turns)
  const trimmedHistory = messages.slice(-MAX_HISTORY_TURNS);
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...trimmedHistory.map((msg) => ({
      role:    msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  // 7. Call Groq with a timeout
  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

    let groqResponse;
    try {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model:       GROQ_MODEL,
          messages:    groqMessages,
          temperature: GROQ_TEMPERATURE,
          max_tokens:  GROQ_MAX_TOKENS,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error('[Chat] Groq API error:', data?.error?.message || groqResponse.status);
      if (groqResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
      }
      return res.status(502).json({ error: 'Chat service temporarily unavailable. Please try again.' });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() || '';
    if (!reply) {
      return res.status(502).json({ error: 'Received an empty response from the chat service.' });
    }

    return res.json({ reply });

  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[Chat] Groq request timed out after', GROQ_TIMEOUT_MS, 'ms');
      return res.status(504).json({ error: 'The chat service took too long to respond. Please try again.' });
    }
    console.error('[Chat] Unexpected server error:', err.message);
    return res.status(500).json({ error: 'Failed to reach the chat service.' });
  }
});

module.exports = router;

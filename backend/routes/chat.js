const express = require('express');
const router = express.Router();

/**
 * POST /api/chat
 * Proxies chat messages to the Groq API (LLaMA model).
 * Keeps the API key on the server side (secure).
 *
 * Body: { messages: [...], systemPrompt: "..." }
 */
router.post('/', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API key not configured on server.' });
  }

  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  // Build messages array for Groq (OpenAI-compatible format)
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Chat] Groq API error:', data?.error?.message || response.status);

      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit reached. Please wait a moment.' });
      }
      return res.status(response.status).json({ error: data?.error?.message || 'Groq API error' });
    }

    const reply = data?.choices?.[0]?.message?.content || '';
    res.json({ reply });

  } catch (err) {
    console.error('[Chat] Server error:', err.message);
    res.status(500).json({ error: 'Failed to reach Groq API.' });
  }
});

module.exports = router;

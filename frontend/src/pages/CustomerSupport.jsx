import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CustomerSupport.css';

// ── System prompt with all EggXpress context ──
const SYSTEM_PROMPT = `You are the friendly and helpful customer support agent for EggXpress — "Roll Into Flavour", a popular food ordering platform based in Mumbai that specializes in egg rolls, chicken rolls, biryani, and burgers.

IMPORTANT RULES:
- You are EggXpress's customer support agent. Never reveal that you are an AI, a language model, or mention Gemini/Google.
- Be warm, professional, and use food-related emojis naturally (🥚🍳🌯🍔🔥 etc.)
- Keep responses concise and helpful (2-4 sentences unless detailed info is requested).
- Always try to help customers place an order or resolve their issue.
- If you don't know something specific about a customer's order, ask them to provide their Order ID and guide them to the Track Order page at /track.

═══════════════════════════════════
COMPLETE MENU WITH PRICES:
═══════════════════════════════════

🌯 ROLLS:
• Classic Egg Roll — ₹149 | Veg | 12g Protein | Medium Spice
• Double Egg Roll — ₹189 | Veg | 14g Protein | Hot Spice | ⭐ Popular
• Masala Omelette Wrap — ₹169 | Veg | 12g Protein | Mild
• Cheese Egg Roll — ₹199 | Veg | 15g Protein | Mild
• Chicken Roll — ₹229 | Non-Veg | 22g Protein | Medium Spice | ⭐ Popular
• Spicy Chicken Egg Roll — ₹259 | Non-Veg | 24g Protein | Extra-Hot

🍚 BOWLS & BIRYANI:
• Egg Bhurji Bowl — ₹129 | Veg | 10g Protein | Medium Spice | ⭐ Popular
• Egg Biryani — ₹199 | Veg | 18g Protein | Medium Spice | ⭐ Popular
• Chicken Biryani — ₹269 | Non-Veg | 28g Protein | Medium Spice | ⭐ Popular
• Anda Curry + Rice — ₹159 | Veg | 14g Protein | Medium Spice

🍔 BURGERS:
• Loaded Egg Burger — ₹219 | Veg | 20g Protein | Mild
• Chicken Egg Burger — ₹279 | Non-Veg | 26g Protein | Medium Spice | ⭐ Popular

═══════════════════════════════════
BUSINESS INFORMATION:
═══════════════════════════════════
• Address: 123 Yolk Street, Mumbai 400001
• Phone: +91 98765 43210
• Email: hello@eggxpress.in
• Hours: Monday to Sunday, 10:00 AM to 11:00 PM (open all 7 days!)
• Delivery: FREE delivery on all orders, avg 30 minutes
• Payment: Cash on Delivery (COD) and Online Payment accepted

═══════════════════════════════════
FIRST ORDER DISCOUNT:
═══════════════════════════════════
New customers get 20% off their first order with code EGGFIRST20.
Always mention this to new customers or when asked about discounts!

═══════════════════════════════════
ORDER PROCESS:
═══════════════════════════════════
1. Browse the menu at /menu
2. Add items to cart
3. Go to checkout
4. Enter name, phone number, and delivery address
5. Choose payment method (COD or Online)
6. Place order → receive an Order ID
7. Track order status at /track page using Order ID

═══════════════════════════════════
ORDER STATUSES (in sequence):
═══════════════════════════════════
placed → confirmed → preparing → out-for-delivery → delivered

═══════════════════════════════════
REFUND & COMPLAINT POLICY:
═══════════════════════════════════
• If an order arrives damaged or incorrect, customer can contact us for a full refund or replacement.
• Refund requests should be made within 2 hours of delivery.
• For quality complaints, we investigate and offer store credit or refund.
• Cancellation is free before the order status is "preparing". After that, a cancellation fee of ₹50 may apply.
• All refunds are processed within 3-5 business days.
• For urgent issues, call us at +91 98765 43210.

═══════════════════════════════════
COMMON FAQ ANSWERS:
═══════════════════════════════════
Q: What are your delivery hours?
A: We deliver from 10 AM to 11 PM every day.

Q: Is there a minimum order amount?
A: No minimum order amount! Order even a single item.

Q: Do you deliver outside Mumbai?
A: Currently we deliver within Mumbai only. We're expanding soon!

Q: Are your eggs fresh?
A: Absolutely! We use farm-fresh eggs sourced daily from local farms.

Q: Do you have any veg options?
A: Yes! Many items are vegetarian — Classic Egg Roll, Double Egg Roll, Masala Omelette Wrap, Cheese Egg Roll, Egg Bhurji Bowl, Egg Biryani, Anda Curry + Rice, and Loaded Egg Burger are all vegetarian!

Q: Which item is best for someone who doesn't like spice?
A: Try our Masala Omelette Wrap or Cheese Egg Roll — both are mild!

Q: What is the spiciest item?
A: The Spicy Chicken Egg Roll is our hottest item — extra-hot! 🔥

Q: How do I track my order?
A: Go to the Track Order page (/track), enter your Order ID, and you'll see real-time status updates.

Q: Can I customize my order?
A: Special instructions can be added during checkout. For allergies or major changes, call us at +91 98765 43210.

When recommending items:
- For budget-friendly: Egg Bhurji Bowl (₹129) or Classic Egg Roll (₹149)
- For protein lovers: Chicken Biryani (28g protein) or Chicken Egg Burger (26g)
- For mild preference: Masala Omelette Wrap or Cheese Egg Roll
- For spice lovers: Spicy Chicken Egg Roll (extra-hot!)
- Most popular items: Double Egg Roll, Chicken Roll, Egg Bhurji Bowl, Egg Biryani, Chicken Biryani, Chicken Egg Burger`;

// ── Quick FAQ buttons configuration ──
const FAQ_ITEMS = [
  { icon: '📦', label: 'Track my order', query: 'How do I track my order?' },
  { icon: '⏰', label: 'What are your hours?', query: 'What are your operating hours?' },
  { icon: '🥬', label: 'Best veg option?', query: 'What is your best vegetarian option?' },
  { icon: '💰', label: 'Refund policy', query: 'What is your refund policy?' },
  { icon: '🚚', label: 'Delivery charges', query: 'Are there any delivery charges?' },
  { icon: '🌶️', label: 'Spicy options', query: 'What are your spiciest menu items?' },
  { icon: '🏷️', label: 'Any discounts?', query: 'Do you have any discounts or offers?' },
  { icon: '📋', label: 'Full menu', query: 'Show me your full menu with prices' },
];

// ── Welcome suggestion chips ──
const WELCOME_CHIPS = [
  'Show me the menu',
  'Best seller?',
  'Any offers?',
  'Track my order',
];

/**
 * CustomerSupport — AI-powered chatbot page for EggXpress.
 * Uses Google Gemini API (gemini-1.5-flash) to answer customer queries.
 */
const CustomerSupport = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /**
   * Formats the current time as HH:MM AM/PM
   */
  const getTimeStamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  /**
   * Sends a message to the Gemini API and streams the response.
   * Maintains conversation history for context-aware replies.
   */
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: text.trim(),
      time: getTimeStamp(),
    };

    // Add user message to state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Build message history for the backend proxy
    const chatHistory = updatedMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      text: msg.content,
    }));

    // API base URL (matches the rest of the app)
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      const data = await response.json();

      // Handle HTTP errors
      if (!response.ok) {
        console.error('[EggXpress Support] API Error:', response.status, data);
        if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(data?.error || `API_ERROR_${response.status}`);
      }

      const botReply =
        data?.reply ||
        "I'm sorry, I couldn't process that. Please try again or contact us at hello@eggxpress.in 🥚";

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: botReply,
          time: getTimeStamp(),
        },
      ]);
    } catch (error) {
      console.error('[EggXpress Support] Caught error:', error);
      let errorMessage;

      if (error.message === 'RATE_LIMIT') {
        errorMessage =
          "We're experiencing high traffic right now! 🍳 Please wait a moment and try again, or call us at +91 98765 43210.";
      } else if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        errorMessage =
          "It seems there's a network issue. Please check your internet connection and try again! 📡";
      } else {
        errorMessage =
          "Something went wrong on our end. Please try again shortly, or reach us at hello@eggxpress.in or +91 98765 43210 📞";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: errorMessage,
          time: getTimeStamp(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission from the input field.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  /**
   * Handles clicks on FAQ or suggestion buttons.
   */
  const handleQuickAction = (query) => {
    sendMessage(query);
    setSidebarOpen(false); // Close sidebar on mobile after clicking FAQ
  };

  /**
   * Clears all messages and resets the conversation.
   */
  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="support-page">
      <div className="support-layout">
        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay visible"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Left Sidebar ── */}
        <aside className={`support-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          {/* Mobile close button */}
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            style={{ display: sidebarOpen ? 'flex' : 'none' }}
            aria-label="Close sidebar"
          >
            ✕
          </button>

          {/* Agent info */}
          <div className="sidebar-header">
            <div className="sidebar-avatar">🥚</div>
            <div className="sidebar-info">
              <h3>EggXpress Support</h3>
              <p>Your friendly food assistant</p>
            </div>
          </div>

          {/* Online status */}
          <div className="status-badge">
            <div className="status-dot" />
            <span>Online — Ready to help!</span>
          </div>

          {/* Quick FAQ buttons */}
          <div className="faq-section">
            <h4>Quick Questions</h4>
            <div className="faq-buttons">
              {FAQ_ITEMS.map((item, index) => (
                <button
                  key={index}
                  className="faq-btn"
                  onClick={() => handleQuickAction(item.query)}
                >
                  <span className="faq-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="sidebar-footer">
            <p>
              Need more help? Call{' '}
              <a href="tel:+919876543210">+91 98765 43210</a> or email{' '}
              <a href="mailto:hello@eggxpress.in">hello@eggxpress.in</a>
            </p>
          </div>
        </aside>

        {/* ── Main Chat Area ── */}
        <main className="chat-area">
          {/* Chat header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-header-avatar">🍳</div>
              <div className="chat-header-info">
                <h4>EggXpress Support</h4>
                <span className="chat-status">Online</span>
              </div>
            </div>
            {messages.length > 0 && (
              <button className="clear-chat-btn" onClick={clearChat}>
                🗑️ Clear Chat
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              /* Welcome state */
              <div className="welcome-msg">
                <span className="welcome-emoji">🥚</span>
                <h3>Welcome to EggXpress Support!</h3>
                <p>
                  Ask me anything about our menu, orders, delivery, or anything
                  else. I'm here to help you Roll Into Flavour!
                </p>
                <div className="welcome-suggestions">
                  {WELCOME_CHIPS.map((chip, i) => (
                    <button
                      key={i}
                      className="welcome-chip"
                      onClick={() => handleQuickAction(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat messages */
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role}${msg.isError ? ' error' : ''}`}
                >
                  <div className="msg-avatar">
                    {msg.role === 'user' ? '👤' : '🍳'}
                  </div>
                  <div className="msg-content">
                    <div className="msg-bubble">{msg.content}</div>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="typing-indicator">
                <div className="msg-avatar" style={{
                  background: 'linear-gradient(135deg, var(--yolk), var(--yolk-dark))',
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                }}>
                  🍳
                </div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <form className="chat-input-wrap" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
            <p className="input-hint">
              Press Enter to send • Powered by EggXpress 🥚
            </p>
          </div>
        </main>
      </div>

      {/* Mobile sidebar toggle button */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open quick questions"
      >
        💬
      </button>
    </div>
  );
};

export default CustomerSupport;

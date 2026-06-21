const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect, optionalProtect } = require('../middleware/auth');

// Lazily initialise Razorpay so the server still boots without real keys
// (useful during development before you have keys)
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_REPLACE_ME') {
    throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * POST /api/payment/create-order
 * Step 1 — Create a Razorpay order on the server side.
 * Returns: { razorpayOrderId, amount, currency, keyId }
 * The frontend uses these to open the Razorpay checkout popup.
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const rzp = getRazorpay();

    const razorpayOrder = await rzp.orders.create({
      amount:   Math.round(amount * 100), // Razorpay uses paise (1 rupee = 100 paise)
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID, // public key — safe to send to frontend
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payment/verify
 * Step 2 — After payment, Razorpay sends back 3 IDs.
 * We verify the HMAC-SHA256 signature to confirm the payment is genuine.
 * If valid → save the order to DB → return the saved order.
 *
 * Signature formula (from Razorpay docs):
 *   HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
 */
router.post('/verify', optionalProtect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, // the full order payload (name, phone, address, items, etc.)
    } = req.body;

    // 1. Reconstruct expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // 2. Compare — constant-time comparison prevents timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    // ── First order check for EGGFIRST20 ────────────────────────────────────
    if (orderData && orderData.promoCode === 'EGGFIRST20') {
      if (!req.user) {
        return res.status(400).json({ error: 'Please login to use this promo code' });
      }
      const existingOrder = await Order.findOne({ userId: req.user._id });
      if (existingOrder) {
        return res.status(400).json({ error: 'This code is only valid for your first order' });
      }
    }

    // 3. Signature valid → save the order to DB
    const order = new Order({
      ...orderData,
      paymentMethod:   'online',
      paymentStatus:   'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
    await order.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Razorpay verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

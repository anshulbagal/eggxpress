const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, optionalProtect, adminOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// ── Validation rules for placing an order ────────────────────────────────
const orderValidationRules = [
  body('customerName')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('customerPhone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[\d\s+\-()]{7,15}$/).withMessage('Invalid phone number'),
  body('customerAddress')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 500 }).withMessage('Address too long'),
  body('totalAmount')
    .isFloat({ min: 1 }).withMessage('Invalid order amount'),
  body('items')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),
];

// POST create order — open (guests can order, token attached automatically if logged in)
router.post('/', optionalProtect, orderValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  // ── First order check for EGGFIRST20 ────────────────────────────────────
  if (req.body.promoCode === 'EGGFIRST20') {
    if (!req.user) {
      return res.status(400).json({ error: 'Please login to use this promo code' });
    }
    const existingOrder = await Order.findOne({ userId: req.user._id });
    if (existingOrder) {
      return res.status(400).json({ error: 'This code is only valid for your first order' });
    }
  }

  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all orders — admin only (contains customer PII: name, phone, address)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET logged-in user's own orders — must be logged in, BEFORE /:id to avoid collision
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order by ID — open (user tracks their own order using the ID from the redirect)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update order status — admin only
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

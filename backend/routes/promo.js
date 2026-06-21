const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { optionalProtect } = require('../middleware/auth');
const Order = require('../models/Order');

// ── Promo codes definition ─────────────────────────────────────────────────
const PROMO_CODES = {
  EGGFIRST20: {
    discount: 20,       // percentage
    minOrder:  99,      // minimum order amount in ₹
    maxUses:   Infinity,
    description: '20% off your first order!',
  },
  EGGROLL10: {
    discount: 10,
    minOrder:  149,
    maxUses:   Infinity,
    description: '10% off on orders above ₹149',
  },
  WEEKEND15: {
    discount: 15,
    minOrder:  199,
    maxUses:   Infinity,
    description: '15% off on weekend orders!',
  },
};

// POST /api/promo/validate
// Body: { code: string, orderAmount: number }
router.post(
  '/validate',
  optionalProtect,
  [
    body('code')
      .trim()
      .notEmpty().withMessage('Promo code is required')
      .isLength({ max: 20 }).withMessage('Promo code too long'),
    body('orderAmount')
      .isFloat({ min: 1 }).withMessage('orderAmount must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
    }

    const code        = req.body.code.toUpperCase();
    const orderAmount = parseFloat(req.body.orderAmount);

    const promo = PROMO_CODES[code];

    if (!promo) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    // ── First order check for EGGFIRST20 ────────────────────────────────────
    if (code === 'EGGFIRST20') {
      if (!req.user) {
        return res.status(401).json({ error: 'Please login to use this promo code' });
      }
      const existingOrder = await Order.findOne({ userId: req.user._id });
      if (existingOrder) {
        return res.status(400).json({ error: 'This code is only valid for your first order' });
      }
    }

    if (orderAmount < promo.minOrder) {
      return res.status(400).json({
        error: `This code requires a minimum order of ₹${promo.minOrder}`,
      });
    }

    const discountAmount = Math.round((orderAmount * promo.discount) / 100);
    const finalAmount    = orderAmount - discountAmount;

    return res.json({
      valid:          true,
      code,
      discount:       promo.discount,
      discountAmount,
      finalAmount,
      description:    promo.description,
    });
  }
);

module.exports = router;

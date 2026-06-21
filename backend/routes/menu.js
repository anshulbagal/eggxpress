const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// ── Validation Rules ────────────────────────────────────────────────────────
const menuItemRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 100 }).withMessage('Item name must be under 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
  body('price')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['egg-rolls', 'chicken-rolls', 'egg-bowls', 'rice', 'burgers', 'drinks'])
    .withMessage('Invalid category specified'),
  body('image')
    .trim()
    .notEmpty().withMessage('Image URL is required')
    .isURL().withMessage('Please enter a valid Image URL'),
  body('isVeg')
    .optional()
    .isBoolean().withMessage('isVeg must be a boolean value'),
  body('isPopular')
    .optional()
    .isBoolean().withMessage('isPopular must be a boolean value'),
  body('spiceLevel')
    .optional()
    .isIn(['mild', 'medium', 'hot', 'extra-hot'])
    .withMessage('Invalid spice level'),
];

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const { category, popular } = req.query;
    let query = { isAvailable: true };
    if (category) query.category = category;
    if (popular === 'true') query.isPopular = true;
    const items = await MenuItem.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new menu item — admin only
router.post('/', protect, adminOnly, menuItemRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update item — admin only
router.put('/:id', protect, adminOnly, menuItemRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE item — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

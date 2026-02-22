const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['egg-rolls', 'chicken-rolls', 'egg-bowls', 'rice', 'burgers', 'drinks'] },
  image: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'medium' },
  rating: { type: Number, default: 4.0 },
  reviews: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);

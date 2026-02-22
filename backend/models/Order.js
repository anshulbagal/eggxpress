const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'], default: 'placed' },
  paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
  orderNote: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

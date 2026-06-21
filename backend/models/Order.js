const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
  // Optional — null for guest orders, populated for logged-in users
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'], default: 'placed' },
  paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
  paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId:   { type: String, default: null },  // Razorpay order ID (rz_order_xxx)
  razorpayPaymentId: { type: String, default: null },  // Razorpay payment ID (pay_xxx)
  promoCode:         { type: String, default: null },
  discountAmount:    { type: Number, default: 0 },
  orderNote: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

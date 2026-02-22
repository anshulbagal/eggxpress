import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'cash',
    orderNote: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Your cart is empty!'); return; }

    setLoading(true);
    try {
      const orderData = {
        ...form,
        items: items.map(i => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount
      };
      const res = await createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/track?order=${res.data._id}`);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <div>🛒</div>
        <p>Your cart is empty</p>
        <button className="btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-content">
        <div className="checkout-form-wrap">
          <h2 className="section-title">Complete <span>Your Order</span></h2>

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h3>📍 Delivery Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="+91 98765 43210" required />
                </div>
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea name="customerAddress" value={form.customerAddress} onChange={handleChange} placeholder="Enter your full delivery address..." rows={3} required />
              </div>
            </div>

            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {[
                  { val: 'cash', icon: '💵', label: 'Cash on Delivery' },
                  { val: 'online', icon: '📱', label: 'Pay Online (UPI)' },
                ].map(p => (
                  <label key={p.val} className={`payment-option ${form.paymentMethod === p.val ? 'selected' : ''}`}>
                    <input type="radio" name="paymentMethod" value={p.val} checked={form.paymentMethod === p.val} onChange={handleChange} />
                    <span className="pay-icon">{p.icon}</span>
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>📝 Order Note (Optional)</h3>
              <textarea name="orderNote" value={form.orderNote} onChange={handleChange} placeholder="Special instructions, allergies, etc." rows={2} />
            </div>

            <button type="submit" className="btn-primary place-order-btn" disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order • ₹${totalAmount} →`}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h3>🛒 Order Summary</h3>
          <div className="summary-items">
            {items.map(item => (
              <div key={item._id} className="summary-item">
                <img src={item.image} alt={item.name} />
                <div className="summary-info">
                  <span className="s-name">{item.name}</span>
                  <span className="s-qty">x{item.quantity}</span>
                </div>
                <span className="s-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="total-row"><span>Subtotal</span><span>₹{totalAmount}</span></div>
            <div className="total-row"><span>Delivery</span><span className="free">FREE</span></div>
            <div className="total-row grand"><span>Total</span><span>₹{totalAmount}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

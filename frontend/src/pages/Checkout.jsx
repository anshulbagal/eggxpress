import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, createRazorpayOrder, verifyPayment, validatePromoCode } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Checkout.css';

// ── Load Razorpay checkout script dynamically ─────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id  = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Build the common order payload (used by both COD + online) ────────────
const buildOrderData = (form, items, finalAmount, userId, promoCode = null, discountAmount = 0) => ({
  customerName:    form.customerName,
  customerPhone:   form.customerPhone,
  customerAddress: form.customerAddress,
  orderNote:       form.orderNote,
  items: items.map(i => ({
    menuItem: i._id,
    name:     i.name,
    price:    i.price,
    quantity: i.quantity,
  })),
  totalAmount: finalAmount,
  userId: userId || null,
  promoCode,
  discountAmount,
});

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount, discountAmount, finalAmount, description }
  const [promoLoading, setPromoLoading] = useState(false);

  const [form, setForm] = useState({
    customerName:    '',
    customerPhone:   '',
    customerAddress: '',
    paymentMethod:   'cash',
    orderNote:       '',
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Promo Code handlers ────────────────────────────────────────────────
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    try {
      const res = await validatePromoCode(promoCode.trim(), totalAmount);
      setAppliedPromo(res.data);
      toast.success(`Promo code applied: ${res.data.code}! 🎉`);
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Invalid promo code';
      toast.error(errMsg);
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.success('Promo code removed');
  };

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalPayAmount = appliedPromo ? appliedPromo.finalAmount : totalAmount;

  // ── Validate form before any payment attempt ──────────────────────────
  const validate = () => {
    if (items.length === 0)              { toast.error('Your cart is empty!'); return false; }
    if (!form.customerName.trim())       { toast.error('Please enter your name'); return false; }
    if (!form.customerPhone.trim())      { toast.error('Please enter your phone number'); return false; }
    if (!form.customerAddress.trim())    { toast.error('Please enter delivery address'); return false; }
    return true;
  };

  // ── COD flow ──────────────────────────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    try {
      const orderData = {
        ...buildOrderData(form, items, finalPayAmount, user?.id, appliedPromo?.code, discountAmount),
        paymentMethod: 'cash',
        paymentStatus: 'pending',
      };
      const res = await createOrder(orderData);
      clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/track?order=${res.data._id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Razorpay online payment flow ──────────────────────────────────────
  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      // 1. Load the Razorpay JS SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment SDK. Check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Create a Razorpay order on our backend using finalPayAmount
      const { data } = await createRazorpayOrder(finalPayAmount);
      const { razorpayOrderId, amount, currency, keyId } = data;

      // 3. Open the Razorpay popup
      const options = {
        key:         keyId,
        amount,                       // in paise
        currency,
        name:        'EggXpress',
        description: 'Food Order Payment',
        image:       'https://img.icons8.com/emoji/96/egg-emoji.png',
        order_id:    razorpayOrderId,

        // 4. Called by Razorpay after successful payment
        handler: async (response) => {
          try {
            const orderData = buildOrderData(form, items, finalPayAmount, user?.id, appliedPromo?.code, discountAmount);
            const verifyRes = await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderData,
            });

            if (verifyRes.data.success) {
              clearCart();
              toast.success('Payment successful! Order placed 🎉');
              navigate(`/track?order=${verifyRes.data.order._id}`);
            }
          } catch {
            toast.error('Payment verification failed. Contact support with your payment ID.');
          } finally {
            setLoading(false);
          }
        },

        // Pre-fill customer details
        prefill: {
          name:    form.customerName,
          contact: form.customerPhone,
          email:   user?.email || '',
        },

        theme: { color: '#f59e0b' },  // EggXpress yellow

        // Called if user closes the popup without paying
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '⚠️' });
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      const msg = err?.response?.data?.error || 'Payment failed. Please try again.';
      toast.error(msg);
      setLoading(false);
    }
  };

  // ── Submit handler — routes to correct flow ───────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (form.paymentMethod === 'cash') {
      await handleCOD();
    } else {
      await handleOnlinePayment();
    }
  };

  // ── Empty cart guard ──────────────────────────────────────────────────
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

            {/* Delivery details */}
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

            {/* Payment method */}
            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {[
                  { val: 'cash',   icon: '💵', label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                  { val: 'online', icon: '📱', label: 'Pay Online (UPI)',  sub: 'Cards, UPI, Net Banking via Razorpay' },
                ].map(p => (
                  <label key={p.val} className={`payment-option ${form.paymentMethod === p.val ? 'selected' : ''}`}>
                    <input type="radio" name="paymentMethod" value={p.val} checked={form.paymentMethod === p.val} onChange={handleChange} />
                    <span className="pay-icon">{p.icon}</span>
                    <span className="pay-details">
                      <span className="pay-label">{p.label}</span>
                      <span className="pay-sub">{p.sub}</span>
                    </span>
                    {form.paymentMethod === p.val && <span className="pay-check">✓</span>}
                  </label>
                ))}
              </div>

              {/* Razorpay test mode notice */}
              {form.paymentMethod === 'online' && (
                <div className="razorpay-notice">
                  <span className="rz-logo">⚡</span>
                  <span>Powered by <strong>Razorpay</strong> — secured with 256-bit encryption</span>
                  <span className="rz-test-badge">TEST MODE</span>
                </div>
              )}
            </div>

            {/* Order note */}
            <div className="form-section">
              <h3>📝 Order Note (Optional)</h3>
              <textarea name="orderNote" value={form.orderNote} onChange={handleChange} placeholder="Special instructions, allergies, extra spice, etc." rows={2} />
            </div>

            {/* Submit button — label changes based on payment method */}
            <button
              type="submit"
              className={`btn-primary place-order-btn ${form.paymentMethod === 'online' ? 'pay-online-btn' : ''}`}
              disabled={loading}
              id="checkout-submit-btn"
            >
              {loading
                ? (form.paymentMethod === 'online' ? 'Opening Payment...' : 'Placing Order...')
                : form.paymentMethod === 'online'
                  ? `Pay ₹${finalPayAmount} Online →`
                  : `Place Order • ₹${finalPayAmount} →`}
            </button>

          </form>
        </div>

        {/* Order summary panel */}
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

          {/* Promo code input */}
          <div className="promo-section">
            <label className="promo-label">🏷️ Have a promo code?</label>
            {!appliedPromo ? (
              <div className="promo-input-group">
                <input
                  type="text"
                  placeholder="e.g. EGGFIRST20"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  disabled={promoLoading}
                />
                <button
                  type="button"
                  className="btn-promo-apply"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="promo-applied-badge">
                <div className="promo-info">
                  <span className="promo-applied-code">{appliedPromo.code}</span>
                  <span className="promo-applied-desc">{appliedPromo.description}</span>
                </div>
                <button type="button" className="btn-promo-remove" onClick={handleRemovePromo}>✕</button>
              </div>
            )}
          </div>

          <div className="summary-totals">
            <div className="total-row"><span>Subtotal</span><span>₹{totalAmount}</span></div>
            {discountAmount > 0 && (
              <div className="total-row promo-discount-row">
                <span>Discount ({appliedPromo?.discount}%)</span>
                <span className="discount">-₹{discountAmount}</span>
              </div>
            )}
            <div className="total-row"><span>Delivery</span><span className="free">FREE</span></div>
            <div className="total-row grand"><span>Total</span><span>₹{finalPayAmount}</span></div>
          </div>

          {/* Payment method summary */}
          <div className="summary-payment-note">
            {form.paymentMethod === 'cash'
              ? '💵 Pay cash when your order arrives'
              : '🔒 Secure online payment via Razorpay'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

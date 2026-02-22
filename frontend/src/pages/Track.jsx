import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchOrder } from '../utils/api';
import './Track.css';

const STAGES = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];
const STAGE_INFO = {
  placed: { icon: '📋', label: 'Order Placed', desc: 'Your order has been received' },
  confirmed: { icon: '✅', label: 'Confirmed', desc: 'Restaurant confirmed your order' },
  preparing: { icon: '👨‍🍳', label: 'Preparing', desc: 'Your food is being prepared' },
  'out-for-delivery': { icon: '🛵', label: 'Out for Delivery', desc: 'Your order is on the way!' },
  delivered: { icon: '🎉', label: 'Delivered', desc: 'Enjoy your meal!' },
};

const Track = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get('order');
    if (id) { setOrderId(id); fetchOrderData(id); }
  }, [searchParams]);

  const fetchOrderData = async (id) => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const res = await fetchOrder(id);
      setOrder(res.data);
    } catch {
      setError('Order not found. Please check your order ID.');
      setOrder(null);
    } finally { setLoading(false); }
  };

  const currentStageIdx = order ? STAGES.indexOf(order.status) : -1;

  return (
    <div className="track-page">
      <div className="container">
        <h1 className="section-title" style={{ paddingTop: '120px' }}>Track <span>Your Order</span></h1>
        <p className="section-sub">Enter your order ID to see live updates</p>

        <div className="track-search">
          <input
            type="text"
            placeholder="Enter Order ID..."
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
          />
          <button className="btn-primary" onClick={() => fetchOrderData(orderId)}>Track →</button>
        </div>

        {error && <div className="track-error">{error}</div>}

        {loading && <div className="track-loading">🔍 Looking up your order...</div>}

        {order && (
          <div className="track-result">
            <div className="order-info-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                </div>
                <div className={`status-pill status-${order.status}`}>
                  {STAGE_INFO[order.status]?.icon} {STAGE_INFO[order.status]?.label}
                </div>
              </div>

              <div className="track-timeline">
                {STAGES.map((stage, idx) => {
                  const done = idx <= currentStageIdx;
                  const current = idx === currentStageIdx;
                  return (
                    <div key={stage} className={`timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                      <div className="step-icon">{STAGE_INFO[stage].icon}</div>
                      <div className="step-bar">
                        <div className="step-dot" />
                        {idx < STAGES.length - 1 && <div className="step-line" />}
                      </div>
                      <div className="step-info">
                        <strong>{STAGE_INFO[stage].label}</strong>
                        <span>{STAGE_INFO[stage].desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-items-summary">
                <h4>Items Ordered:</h4>
                {order.items.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="order-total-row">
                  <strong>Total</strong>
                  <strong>₹{order.totalAmount}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;

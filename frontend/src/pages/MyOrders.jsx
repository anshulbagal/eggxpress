import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../utils/api';
import toast from 'react-hot-toast';
import './MyOrders.css';

const STATUS_COLORS = {
  placed:           { bg: '#1a1a2e', color: '#a5b4fc', border: '#3730a3' },
  confirmed:        { bg: '#1a2010', color: '#86efac', border: '#166534' },
  preparing:        { bg: '#1a1500', color: '#fde68a', border: '#854d0e' },
  'out-for-delivery': { bg: '#0f1a2e', color: '#7dd3fc', border: '#075985' },
  delivered:        { bg: '#0a1a10', color: '#4ade80', border: '#15803d' },
};

const STATUS_ICONS = {
  placed:           '📋',
  confirmed:        '✅',
  preparing:        '👨‍🍳',
  'out-for-delivery': '🛵',
  delivered:        '🎉',
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Wait for auth to resolve before checking
    if (authLoading) return;

    if (!user) {
      toast.error('Please log in to view your orders');
      navigate('/auth');
      return;
    }

    fetchMyOrders()
      .then(res => setOrders(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <div className="orders-skeleton">
            {[...Array(3)].map((_, i) => <div key={i} className="order-skeleton-card" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <div className="container orders-empty">
          <div className="empty-icon">😕</div>
          <h2>Couldn't load your orders</h2>
          <p>Please try again in a moment.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders-page">
        <div className="container orders-empty">
          <div className="empty-icon">🛒</div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here once you place your first order.</p>
          <Link to="/menu"><button className="btn-primary">Browse Menu →</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My <span>Orders</span></h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
        </div>

        <div className="orders-list">
          {orders.map(order => {
            const s = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
            const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });
            return (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">{date}</span>
                  </div>
                  <span
                    className="order-status-badge"
                    style={{ background: s.bg, color: s.color, borderColor: s.border }}
                  >
                    {STATUS_ICONS[order.status]} {order.status.replace(/-/g, ' ')}
                  </span>
                </div>

                <div className="order-items-list">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span className="oi-name">{item.name}</span>
                      <span className="oi-qty">×{item.quantity}</span>
                      <span className="oi-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Total</span>
                    <strong>₹{order.totalAmount}</strong>
                  </div>
                  <div className="order-actions">
                    <span className="pay-chip">
                      {order.paymentMethod === 'cash' ? '💵 COD' : '📱 Online'}
                    </span>
                    <Link to={`/track?order=${order._id}`}>
                      <button className="btn-track">Track →</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

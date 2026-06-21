import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchOrder } from '../utils/api';
import './Track.css';

const STAGES = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];
const STAGE_INFO = {
  placed:             { icon: '📋', label: 'Order Placed',    desc: 'Your order has been received' },
  confirmed:          { icon: '✅', label: 'Confirmed',        desc: 'Restaurant confirmed your order' },
  preparing:          { icon: '👨‍🍳', label: 'Preparing',       desc: 'Your food is being prepared' },
  'out-for-delivery': { icon: '🛵', label: 'Out for Delivery', desc: 'Your order is on the way!' },
  delivered:          { icon: '🎉', label: 'Delivered',        desc: 'Enjoy your meal!' },
};

const POLL_INTERVAL = 5000; // 5 seconds

const Track = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId]         = useState(searchParams.get('order') || '');
  const [order, setOrder]             = useState(null);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPolling, setIsPolling]     = useState(false);

  const intervalRef  = useRef(null); // holds the setInterval id
  const activeIdRef  = useRef(null); // which order ID is currently polled

  // ── Core fetch ─────────────────────────────────────────────────────────────
  // silent=true → no loading spinner (used for background polls)
  const doFetch = useCallback(async (id, silent = false) => {
    if (!id) return null;
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await fetchOrder(id);
      setOrder(res.data);
      setLastUpdated(new Date());
      return res.data;
    } catch {
      if (!silent) {
        setError('Order not found. Please check your order ID.');
        setOrder(null);
      }
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── Stop polling helper ────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // ── Start polling ──────────────────────────────────────────────────────────
  const startPolling = useCallback((id) => {
    stopPolling();
    activeIdRef.current = id;
    setIsPolling(true);

    intervalRef.current = setInterval(async () => {
      const fresh = await doFetch(activeIdRef.current, true);
      // Auto-stop once delivered — no point polling a closed order
      if (fresh?.status === 'delivered') {
        stopPolling();
      }
    }, POLL_INTERVAL);
  }, [doFetch, stopPolling]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // ── Auto-load from URL ?order= param ──────────────────────────────────────
  useEffect(() => {
    const id = searchParams.get('order');
    if (id) {
      setOrderId(id);
      doFetch(id).then(result => {
        if (result && result.status !== 'delivered') startPolling(id);
      });
    }
  }, []); // only on mount — intentional

  // ── Manual search ──────────────────────────────────────────────────────────
  const handleSearch = async (idOverride) => {
    const trimmed = (idOverride || orderId).trim();
    if (!trimmed) return;
    stopPolling();

    const result = await doFetch(trimmed);
    if (result && result.status !== 'delivered') {
      startPolling(trimmed);
    }
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
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-primary" onClick={() => handleSearch()}>Track →</button>
        </div>

        {error  && <div className="track-error">{error}</div>}
        {loading && <div className="track-loading">🔍 Looking up your order...</div>}

        {order && (
          <div className="track-result">
            <div className="order-info-card">

              {/* Header */}
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                </div>
                <div className="order-header-right">
                  <div className={`status-pill status-${order.status}`}>
                    {STAGE_INFO[order.status]?.icon} {STAGE_INFO[order.status]?.label}
                  </div>
                  {isPolling ? (
                    <div className="live-badge">
                      <span className="live-dot" />
                      LIVE
                    </div>
                  ) : order.status === 'delivered' ? (
                    <div className="done-badge">✓ Done</div>
                  ) : null}
                </div>
              </div>

              {/* Last updated */}
              {lastUpdated && (
                <div className="last-updated">
                  🔄 Last updated {lastUpdated.toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                  {isPolling && <span className="poll-note"> · auto-refreshing every 5s</span>}
                </div>
              )}

              {/* Timeline */}
              <div className="track-timeline">
                {STAGES.map((stage, idx) => {
                  const done    = idx <= currentStageIdx;
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

              {/* Items */}
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

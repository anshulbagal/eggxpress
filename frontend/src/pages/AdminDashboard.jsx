import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllOrders, updateOrderStatus } from '../utils/api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];

const STATUS_META = {
  placed:             { color: '#a5b4fc', bg: '#1a1a2e', border: '#3730a3', icon: '📋' },
  confirmed:          { color: '#86efac', bg: '#1a2010', border: '#166534', icon: '✅' },
  preparing:          { color: '#fde68a', bg: '#1a1500', border: '#854d0e', icon: '👨‍🍳' },
  'out-for-delivery': { color: '#7dd3fc', bg: '#0f1a2e', border: '#075985', icon: '🛵' },
  delivered:          { color: '#4ade80', bg: '#0a1a10', border: '#15803d', icon: '🎉' },
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [updating, setUpdating]     = useState(null); // order._id being updated
  const [expanded, setExpanded]     = useState(null); // order._id whose items are expanded

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError(false);
    fetchAllOrders()
      .then(res => setOrders(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error('Please log in');
      navigate('/auth');
      return;
    }
    if (user.role !== 'admin') {
      toast.error('Admin access only');
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, authLoading, navigate, loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      toast.success(`Status → ${newStatus.replace(/-/g, ' ')}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pending      = orders.filter(o => o.status !== 'delivered').length;
  const delivered    = orders.filter(o => o.status === 'delivered').length;
  const todayCount   = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  // ── Filtered + searched list ───────────────────────────────────────────────
  const visible = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.name?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o._id.slice(-8).toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-header-skeleton" />
          <div className="admin-stats-row">
            {[...Array(4)].map((_, i) => <div key={i} className="stat-skeleton" />)}
          </div>
          <div className="orders-table-skeleton">
            {[...Array(5)].map((_, i) => <div key={i} className="row-skeleton" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-container admin-error">
          <div className="error-icon">⚠️</div>
          <h2>Couldn't load orders</h2>
          <p>Check your connection or server status.</p>
          <button className="btn-retry" onClick={loadOrders}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="admin-header">
          <div className="admin-title-block">
            <div className="admin-badge">ADMIN</div>
            <h1>Order <span>Dashboard</span></h1>
            <p>Manage and update all customer orders in real time.</p>
          </div>
          <button className="btn-refresh" onClick={loadOrders} title="Refresh orders">
            ↺ Refresh
          </button>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="admin-stats-row">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-body">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-body">
              <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card stat-card--warn">
            <div className="stat-icon">⏳</div>
            <div className="stat-body">
              <div className="stat-value">{pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card stat-card--ok">
            <div className="stat-icon">✅</div>
            <div className="stat-body">
              <div className="stat-value">{delivered}</div>
              <div className="stat-label">Delivered</div>
            </div>
          </div>
          <div className="stat-card stat-card--blue">
            <div className="stat-icon">🗓️</div>
            <div className="stat-body">
              <div className="stat-value">{todayCount}</div>
              <div className="stat-label">Today</div>
            </div>
          </div>
        </div>

        {/* ── Filter + search bar ─────────────────────────────────────────── */}
        <div className="admin-toolbar">
          <div className="filter-tabs">
            {['all', ...STATUS_STEPS].map(s => (
              <button
                key={s}
                className={`filter-tab ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'All' : STATUS_META[s]?.icon + ' ' + s.replace(/-/g, ' ')}
                {s !== 'all' && (
                  <span className="tab-count">
                    {orders.filter(o => o.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search name, phone, order ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* ── Results count ───────────────────────────────────────────────── */}
        <div className="results-label">
          {visible.length === 0
            ? 'No orders match'
            : `${visible.length} order${visible.length !== 1 ? 's' : ''}`}
          {filter !== 'all' && ` · filter: ${filter}`}
          {search && ` · "${search}"`}
        </div>

        {/* ── Orders list ─────────────────────────────────────────────────── */}
        {visible.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📭</div>
            <p>No orders found for this filter.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {visible.map(order => {
              const meta    = STATUS_META[order.status] || STATUS_META.placed;
              const isOpen  = expanded === order._id;
              const isBusy  = updating === order._id;
              const curIdx  = STATUS_STEPS.indexOf(order.status);

              return (
                <div key={order._id} className={`admin-order-card ${isBusy ? 'busy' : ''}`}>

                  {/* Card header */}
                  <div className="aoc-header">
                    <div className="aoc-left">
                      <span className="aoc-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="aoc-date">{fmt(order.createdAt)}</span>
                    </div>
                    <div className="aoc-center">
                      <span className="aoc-customer">👤 {order.name}</span>
                      <span className="aoc-phone">📞 {order.phone}</span>
                    </div>
                    <div className="aoc-right">
                      <span
                        className="aoc-status-badge"
                        style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
                      >
                        {meta.icon} {order.status.replace(/-/g, ' ')}
                      </span>
                      <span className="aoc-amount">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Status stepper */}
                  <div className="aoc-stepper">
                    {STATUS_STEPS.map((step, idx) => {
                      const done    = idx < curIdx;
                      const current = idx === curIdx;
                      const stepMeta = STATUS_META[step];
                      return (
                        <React.Fragment key={step}>
                          <button
                            className={`step-btn ${done ? 'done' : ''} ${current ? 'current' : ''}`}
                            onClick={() => !current && handleStatusChange(order._id, step)}
                            disabled={isBusy || current}
                            title={`Set to ${step}`}
                            style={current ? { borderColor: meta.color, color: meta.color } : {}}
                          >
                            <span className="step-icon">{stepMeta.icon}</span>
                            <span className="step-label">{step.replace(/-/g, ' ')}</span>
                          </button>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`step-line ${idx < curIdx ? 'done' : ''}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Expandable items + address */}
                  <div className="aoc-body">
                    <button
                      className="aoc-toggle"
                      onClick={() => setExpanded(isOpen ? null : order._id)}
                    >
                      {isOpen ? '▲ Hide details' : `▼ ${order.items.length} item${order.items.length !== 1 ? 's' : ''} · ₹${order.totalAmount}`}
                    </button>

                    {isOpen && (
                      <div className="aoc-details">
                        <div className="aoc-items">
                          {order.items.map((item, i) => (
                            <div key={i} className="aoc-item-row">
                              <span className="aoci-name">{item.name}</span>
                              <span className="aoci-qty">×{item.quantity}</span>
                              <span className="aoci-price">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="aoc-items-total">
                            <span>Total</span>
                            <strong>₹{order.totalAmount}</strong>
                          </div>
                        </div>
                        <div className="aoc-info">
                          <div className="aoc-info-row">
                            <span className="aoc-info-label">Address</span>
                            <span className="aoc-info-val">{order.address}</span>
                          </div>
                          <div className="aoc-info-row">
                            <span className="aoc-info-label">Payment</span>
                            <span className="aoc-info-val">
                              {order.paymentMethod === 'cash' ? '💵 Cash on Delivery' : '📱 Online (UPI)'}
                            </span>
                          </div>
                          {order.userId && (
                            <div className="aoc-info-row">
                              <span className="aoc-info-label">User ID</span>
                              <span className="aoc-info-val aoc-mono">{order.userId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Busy overlay */}
                  {isBusy && <div className="aoc-busy-bar" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

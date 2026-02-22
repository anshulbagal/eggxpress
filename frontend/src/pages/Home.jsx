import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMenu } from '../utils/api';
import MenuCard from '../components/MenuCard';
import './Home.css';

const CATEGORIES = [
  { id: 'egg-rolls', label: 'Egg Rolls', emoji: '🌯' },
  { id: 'chicken-rolls', label: 'Chicken Rolls', emoji: '🍗' },
  { id: 'egg-bowls', label: 'Egg Bowls', emoji: '🥣' },
  { id: 'rice', label: 'Rice & Biryani', emoji: '🍚' },
  { id: 'burgers', label: 'Egg Burgers', emoji: '🍔' },
];

const Home = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu({ popular: true })
      .then(res => setPopularItems(res.data))
      .catch(() => setPopularItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          <div className="hero-pattern" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-pill">🔥 Fresh & Hot Delivery</div>
            <h1 className="hero-title">
              ROLL INTO<br />
              <span className="hero-accent">PURE FLAVOUR</span>
            </h1>
            <p className="hero-sub">
              Mumbai's favourite egg rolls & chicken rolls. Crispy, fresh, packed with flavour —
              delivered to your door in 30 minutes or less.
            </p>
            <div className="hero-actions">
              <Link to="/menu"><button className="btn-primary hero-cta">Order Now 🍳</button></Link>
              <Link to="/menu"><button className="btn-outline">View Menu</button></Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">50K+</span><span>Happy Customers</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num">4.9★</span><span>Average Rating</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num">30 Min</span><span>Delivery</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-ring" />
            <div className="hero-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600"
                alt="Delicious Egg Roll"
                className="hero-img"
              />
            </div>
            <div className="floating-card card-1">🥚 Fresh Eggs Daily</div>
            <div className="floating-card card-2">⚡ 30 Min Delivery</div>
            <div className="floating-card card-3">🌶 Spice Your Way</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore Our <span>Menu</span></h2>
            <p className="section-sub">From classic egg rolls to loaded chicken burgers — we've got your cravings covered</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} to={`/menu?category=${cat.id}`} className="cat-card">
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-label">{cat.label}</span>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items */}
      <section className="popular-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">⭐ Fan <span>Favourites</span></h2>
            <p className="section-sub">Our most loved items — tried, tested and obsessed over</p>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="menu-grid">
              {popularItems.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          )}
          <div className="see-all">
            <Link to="/menu"><button className="btn-primary">See Full Menu →</button></Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Why <span>EggXpress?</span></h2>
          <div className="why-grid">
            {[
              { icon: '🥚', title: 'Farm Fresh', desc: 'We source only the freshest eggs and ingredients every single morning.' },
              { icon: '⚡', title: 'Express Delivery', desc: 'Hot and crispy at your doorstep in 30 minutes. We never compromise on speed.' },
              { icon: '👨‍🍳', title: 'Master Chefs', desc: 'Our rolls are crafted by experienced chefs with years of street-food mastery.' },
              { icon: '💯', title: 'Quality Assured', desc: 'Every item is made to order — no pre-cooked food, ever.' },
            ].map((w, i) => (
              <div key={i} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>First Order? Get 20% Off! 🎉</h2>
              <p>Use code <strong>EGGFIRST20</strong> at checkout</p>
            </div>
            <Link to="/menu"><button className="btn-primary cta-btn">Claim Offer →</button></Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onCartOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <div className="logo-egg">🥚</div>
          <div className="logo-text">
            <span className="logo-main">EggXpress</span>
            <span className="logo-tagline">Roll Into Flavour</span>
          </div>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/menu" className={location.pathname === '/menu' ? 'active' : ''}>Menu</Link>
          <Link to="/track" className={location.pathname === '/track' ? 'active' : ''}>Track Order</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
        </div>

        <div className="nav-actions">
          <button className="cart-btn" onClick={onCartOpen}>
            <span className="cart-icon">🛒</span>
            <span className="cart-label">Cart</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          {user ? (
            <div className="nav-user">
              <span className="nav-user-name">👤 {user.name.split(' ')[0]}</span>
              <Link to="/my-orders" className="nav-my-orders">My Orders</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-admin-btn">⚙ Admin</Link>
              )}
              <button className="nav-logout" onClick={logout}>Logout</button>
            </div>
          ) : (
            <Link to="/auth" className="nav-login-btn">Login</Link>
          )}
          <button className="burger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>🥚</span>
            <span className="footer-logo-text">EggXpress</span>
          </div>
          <p>Premium egg & chicken rolls delivered fresh to your door. Made with love, served with fire.</p>
          <div className="socials">
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="Facebook">👍</a>
            <a href="#" aria-label="WhatsApp">💬</a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/track">Track Order</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-links">
          <h4>Categories</h4>
          <Link to="/menu?category=egg-rolls">Egg Rolls</Link>
          <Link to="/menu?category=chicken-rolls">Chicken Rolls</Link>
          <Link to="/menu?category=egg-bowls">Egg Bowls</Link>
          <Link to="/menu?category=rice">Rice & Biryani</Link>
          <Link to="/menu?category=burgers">Egg Burgers</Link>
        </div>

        <div className="footer-contact">
          <h4>Get In Touch</h4>
          <p>📍 123 Yolk Street, Flavour Nagar, Mumbai 400001</p>
          <p>📞 +91 98765 43210</p>
          <p>📧 hello@eggxpress.in</p>
          <div className="hours">
            <span>⏰ Mon–Sun: 10 AM – 11 PM</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 EggXpress. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

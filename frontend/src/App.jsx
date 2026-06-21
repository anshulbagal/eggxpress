import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import Track from './pages/Track';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Navbar onCartOpen={() => setCartOpen(true)} />
          <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/menu"     element={<Menu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track"    element={<Track />} />
            <Route path="/about"    element={<About />} />
            <Route path="/contact"  element={<Contact />} />
            <Route path="/auth"      element={<Auth />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/admin"     element={<AdminDashboard />} />
            <Route path="*"          element={<NotFound />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
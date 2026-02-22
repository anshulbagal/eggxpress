import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQty, totalAmount, clearCart } = useCart();

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div>
            <h2>Your Order</h2>
            <span className="cart-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">🥚</div>
            <p>Your cart is empty!</p>
            <span>Add some delicious rolls to get started</span>
            <button className="btn-primary" onClick={onClose}>Browse Menu</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div className="cart-item" key={item._id}>
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <span className="item-price">₹{item.price}</span>
                  </div>
                  <div className="qty-controls">
                    <button onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="item-total">₹{item.price * item.quantity}</div>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>🗑</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="total-row">
                  <span>Delivery</span>
                  <span className="free">FREE</span>
                </div>
                <div className="total-row grand">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <Link to="/checkout" onClick={onClose}>
                <button className="btn-primary checkout-btn">
                  Proceed to Checkout →
                </button>
              </Link>

              <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;

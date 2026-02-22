import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './MenuCard.css';

const spicyColors = { mild: '#4CAF50', medium: '#FF9800', hot: '#F44336', 'extra-hot': '#9C27B0' };
const spicyEmoji = { mild: '🌶', medium: '🌶🌶', hot: '🌶🌶🌶', 'extra-hot': '🔥🔥🔥' };

const MenuCard = ({ item }) => {
  const { addItem, items, updateQty } = useCart();
  const [imgError, setImgError] = useState(false);

  const cartItem = items.find(i => i._id === item._id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} added!`, {
      icon: '🥚',
      style: { background: '#2D2D2D', color: '#FAFAF7', border: '1px solid rgba(245,166,35,0.3)' }
    });
  };

  return (
    <div className="menu-card">
      {item.isPopular && <div className="popular-badge">⭐ Popular</div>}
      <div className="card-img-wrap">
        <img
          src={imgError ? 'https://via.placeholder.com/400x250/2D2D2D/F5A623?text=EggXpress' : item.image}
          alt={item.name}
          onError={() => setImgError(true)}
        />
        <div className="card-overlay" />
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className={item.isVeg ? 'badge-veg' : 'badge-nonveg'} title={item.isVeg ? 'Veg' : 'Non-Veg'} />
          <span className="spice" style={{ color: spicyColors[item.spiceLevel] }}>
            {spicyEmoji[item.spiceLevel]}
          </span>
        </div>

        <h3 className="card-name">{item.name}</h3>
        <p className="card-desc">{item.description}</p>

        <div className="card-rating">
          <span className="stars">★</span>
          <span>{item.rating}</span>
          <span className="reviews">({item.reviews} reviews)</span>
        </div>

        <div className="card-footer">
          <div className="card-price">
            <span className="currency">₹</span>
            <span className="amount">{item.price}</span>
          </div>

          {qty === 0 ? (
            <button className="add-btn" onClick={handleAdd}>
              Add +
            </button>
          ) : (
            <div className="qty-pill">
              <button onClick={() => updateQty(item._id, qty - 1)}>−</button>
              <span>{qty}</span>
              <button onClick={() => updateQty(item._id, qty + 1)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;

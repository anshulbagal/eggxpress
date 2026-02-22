import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchMenu } from '../utils/api';
import MenuCard from '../components/MenuCard';
import './Menu.css';

const CATEGORIES = [
  { id: 'all', label: 'All Items', emoji: '🍽' },
  { id: 'egg-rolls', label: 'Egg Rolls', emoji: '🌯' },
  { id: 'chicken-rolls', label: 'Chicken Rolls', emoji: '🍗' },
  { id: 'egg-bowls', label: 'Egg Bowls', emoji: '🥣' },
  { id: 'rice', label: 'Rice & Biryani', emoji: '🍚' },
  { id: 'burgers', label: 'Egg Burgers', emoji: '🍔' },
];

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    setLoading(true);
    const params = activeCategory !== 'all' ? { category: activeCategory } : {};
    fetchMenu(params)
      .then(res => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const setCategory = (cat) => {
    if (cat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="menu-page">
      <div className="menu-hero">
        <div className="container">
          <h1 className="section-title">Our <span>Menu</span></h1>
          <p className="section-sub">Handcrafted with love, served with fire 🔥</p>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for rolls, biryani, burgers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <div>🍳</div>
            <p>No items found</p>
            <span>Try a different search or category</span>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</span>
            </div>
            <div className="menu-grid">
              {filtered.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;

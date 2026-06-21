import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();
const CART_KEY = 'eggxpress_cart';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.item._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i._id === action.item._id ? { ...i, quantity: i.quantity + 1 } : i
          )
        };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.id) };
    case 'UPDATE_QTY': {
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter(i => i._id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i._id === action.id ? { ...i, quantity: action.qty } : i
        )
      };
    }
    case 'CLEAR':
      console.log('🧹 CartContext Reducer: CLEAR action received, setting items to empty array');
      return { items: [] };
    default:
      return state;
  }
};

// Read saved cart from localStorage — fall back to empty if nothing saved or JSON is corrupt
const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] }; // corrupt JSON — start fresh
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);

  // Sync to localStorage after every state change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQty, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

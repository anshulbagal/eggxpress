import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useCart } from './CartContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  // On mount — verify stored token is still valid
  useEffect(() => {
    if (token) {
      API.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => logout()) // token expired or invalid — clear it
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    console.log('🚪 AuthContext: logout() initiated');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    console.log('🛒 AuthContext: calling clearCart()');
    clearCart();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

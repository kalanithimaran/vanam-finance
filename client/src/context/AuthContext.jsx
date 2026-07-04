import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      connectSocket(token);
    }
    setLoading(false);
  }, []);

  const connectSocket = (token) => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: { token }
    });
    setSocket(newSocket);
  };

  const login = async (phone, pin) => {
    const res = await api.post('/api/auth/login', { phone, pin });
    const { token, household } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(household));
    setUser(household);
    connectSocket(token);
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (socket) socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, socket, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

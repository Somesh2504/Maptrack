import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import socket from '../../socket';
import { AppContext } from './AppContext';

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('authToken'));
  const [user, setUser] = useState(() => {
    // Try to load from localStorage on first render
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const base = 'http://localhost:5000';

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('authToken'));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (!socket.connected) socket.connect();
    } else {
      if (socket.connected) socket.disconnect();
    }
  }, [isAuthenticated]);

  const login = (token, userInfo = null) => {
    Cookies.set('authToken', token, { expires: 7 });
    setIsAuthenticated(true);
    if (userInfo) {
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
    }
  };

  const logout = () => {
    Cookies.remove('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, user, login, logout, socket, base }}>
      {children}
    </AppContext.Provider>
  );
}; 
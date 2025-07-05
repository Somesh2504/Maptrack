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
  const base = 'https://maptrack-959v.onrender.com';

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('authToken'));
  }, []);

  useEffect(() => {
    console.log('AppProvider: isAuthenticated:', isAuthenticated, 'socket connected:', socket.connected);
    if (isAuthenticated) {
      if (!socket.connected) {
        console.log('AppProvider: Connecting socket...');
        socket.connect();
      }
    } else {
      if (socket.connected) {
        console.log('AppProvider: Disconnecting socket...');
        socket.disconnect();
      }
    }
  }, [isAuthenticated]);

  // Add socket event listeners for debugging
  useEffect(() => {
    const handleConnect = () => console.log('AppProvider: Socket connected!');
    const handleDisconnect = () => console.log('AppProvider: Socket disconnected!');
    const handleError = (error) => console.error('AppProvider: Socket error:', error);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, []);

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
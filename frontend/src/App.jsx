import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from './NavBar';
import CabTracker from './Tracker';
import RegisterPage from './RegesterPage';
import LoginPage from './LoginPage';
import UserPage from './UserPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('authToken'));

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('authToken'));
  }, []);

  // Listen for login/logout changes (optional, for better UX)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAuthenticated(!!Cookies.get('authToken'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    Cookies.remove('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path=":id" element={<CabTracker />} />
      </Routes>
    </Router>
  );
}

export default App;

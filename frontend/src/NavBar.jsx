import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: '#eee', marginBottom: '1rem' }}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Circle-icons-car.svg" alt="Logo" style={{ width: 40, marginRight: 16 }} />
      <span style={{ fontWeight: 'bold', fontSize: 20, marginRight: 'auto', cursor: 'pointer' }} onClick={() => navigate('/')}>MapTrack</span>
      {!isAuthenticated ? (
        <>
          <button style={{ marginRight: 8 }} onClick={() => navigate('/')}>Home</button>
          <button style={{ marginRight: 8 }} onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </>
      ) : (
        <button onClick={onLogout}>Logout</button>
      )}
    </nav>
  );
};

export default Navbar;
import React, { useState, useContext } from 'react';
import { AppContext } from './context/AppContext';
import Navbar from './NavBar';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, base } = useContext(AppContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !email || !password) {
      setError('Please enter name, email, and password');
      return;
    }
    try {
      const res = await fetch(`${base}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        setError(data.message || 'Registration failed');
      } else {
        setSuccess('Registration successful!');
        // Store token and set auth state
        if (data.token) {
          login(data.token, data.user);
        }
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div>
      <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
          <button type="submit" style={{ width: '100%', padding: 10 }}>Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({ company: '', email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('imsUsers')) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem('imsUsers', JSON.stringify(users));
    } catch (e) {
      console.warn('Could not save users', e);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    setError('');
    const users = getUsers();
    const found = users.find((u) => u.email === formData.email && u.password === formData.password);
    if (found) {
      const user = { company: found.company, email: found.email };
      if (onLogin) onLogin(user);
    } else {
      setError('Invalid email or password. You can sign up if you do not have an account.');
    }
  }

  function handleSignup(e) {
    e.preventDefault();
    setError('');
    const users = getUsers();
    if (!formData.email || !formData.password || !formData.company) {
      setError('Please fill all fields to sign up.');
      return;
    }
    if (users.find((u) => u.email === formData.email)) {
      setError('An account with this email already exists. Please login.');
      return;
    }
    const newUser = { company: formData.company, email: formData.email, password: formData.password };
    users.push(newUser);
    saveUsers(users);
    // auto-login after signup
    const user = { company: newUser.company, email: newUser.email };
    if (onLogin) onLogin(user);
  }

  return (
    <div className="hero">
      <div className="hero-left">
        <h1>
          IMS <span className="highlight"></span>
        </h1>
        <p>Inventory Management</p>
      </div>

      <div className="hero-right">
        <h2>{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</h2>
        <form className="signup-form" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit" className="submit-btn">
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          {mode === 'login' ? (
            <>
              <span>Don't have an account?</span>{' '}
              <button onClick={() => { setMode('signup'); setError(''); }} style={{ marginLeft: 8 }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>{' '}
              <button onClick={() => { setMode('login'); setError(''); }} style={{ marginLeft: 8 }}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

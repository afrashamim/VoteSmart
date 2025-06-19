import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginpage.css';

// API base URL - will use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Loginpage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (isLogin) {
        // Login logic
        if (isAdmin) {
          response = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, formData);
        } else {
          response = await axios.post(`${API_BASE_URL}/api/auth/user/login`, formData);
        }
        
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Navigate based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/vote');
        }
      } else {
        // Registration logic (only for users)
        response = await axios.post(`${API_BASE_URL}/api/auth/user/register`, formData);
        
        // Auto-login after registration
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/vote');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsAdmin(false);
    setError('');
    setFormData({ username: '', password: '' });
  };

  const toggleRole = () => {
    setIsAdmin(!isAdmin);
    setError('');
    setFormData({ username: '', password: '' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>VoteSmart</h1>
          <p>Secure Digital Voting Platform</p>
        </div>

        <div className="role-selector">
          <button 
            className={`role-btn ${!isAdmin ? 'active' : ''}`}
            onClick={toggleRole}
            disabled={!isLogin}
          >
            👤 User
          </button>
          <button 
            className={`role-btn ${isAdmin ? 'active' : ''}`}
            onClick={toggleRole}
            disabled={!isLogin}
          >
            🔐 Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="mode-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="toggle-btn"
              onClick={toggleMode}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;

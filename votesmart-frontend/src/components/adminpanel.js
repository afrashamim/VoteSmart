import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './adminpanel.css';

// API base URL - will use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminPanel = () => {
  const [nominees, setNominees] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: null
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch nominees and statistics in parallel
      const [nomineesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/nominees`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/statistics`, { headers })
      ]);

      setNominees(nomineesRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchData();
  }, [navigate, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleInputChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleAddNominee = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image) {
      showMessage('Please enter name and select an image.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const data = new FormData();
      data.append('name', formData.name);
      data.append('image', formData.image);

      await axios.post(`${API_BASE_URL}/api/nominees`, data, { headers });
      
      showMessage('Nominee added successfully!', 'success');
      setFormData({ name: '', image: null });
      setShowAddForm(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding nominee:', error);
      showMessage('Error adding nominee. Please try again.', 'error');
    }
  };

  const handleDeleteNominee = async (nomineeId) => {
    if (!window.confirm('Are you sure you want to delete this nominee?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API_BASE_URL}/api/nominees/${nomineeId}`, { headers });
      
      showMessage('Nominee deleted successfully!', 'success');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting nominee:', error);
      showMessage('Error deleting nominee. Please try again.', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>🎛️ Admin Dashboard</h1>
          <p>Manage nominees and view voting statistics</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{statistics.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🗳️</div>
          <div className="stat-content">
            <h3>{statistics.votedUsers || 0}</h3>
            <p>Votes Cast</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{statistics.participationRate || 0}%</h3>
            <p>Participation Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>{statistics.totalNominees || 0}</h3>
            <p>Total Nominees</p>
          </div>
        </div>
      </div>

      {/* Add Nominee Section */}
      <div className="section">
        <div className="section-header">
          <h2>📝 Manage Nominees</h2>
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '❌ Cancel' : '➕ Add Nominee'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddNominee} className="add-form">
            <div className="form-group">
              <label htmlFor="name">Nominee Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter nominee name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Nominee Image</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleInputChange}
                accept="image/*"
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              ➕ Add Nominee
            </button>
          </form>
        )}
      </div>

      {/* Nominees List */}
      <div className="section">
        <h2>🏆 Current Nominees</h2>
        {nominees.length === 0 ? (
          <div className="empty-state">
            <p>No nominees added yet. Add your first nominee above!</p>
          </div>
        ) : (
          <div className="nominees-grid">
            {nominees.map((nominee) => (
              <div key={nominee._id} className="nominee-card">
                <div className="nominee-image">
                  <img 
                    src={`${API_BASE_URL}/${nominee.imageUrl}`} 
                    alt={nominee.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                </div>
                <div className="nominee-info">
                  <h3>{nominee.name}</h3>
                  <div className="vote-count">
                    <span className="votes">🗳️ {nominee.votes} votes</span>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteNominee(nominee._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

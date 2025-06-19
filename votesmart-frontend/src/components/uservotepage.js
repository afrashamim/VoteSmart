import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './uservotepage.css';

// API base URL - will use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UserVotePage() {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voteStatus, setVoteStatus] = useState({
    voted: false,
    votedFor: null
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication and fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || userData.role !== 'user') {
      navigate('/');
      return;
    }

    setUser(userData);
    fetchData();
  }, [navigate]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch nominees and vote status in parallel
      const [nomineesRes, statusRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/nominees`, { headers }),
        axios.get(`${API_BASE_URL}/api/user/vote-status`, { headers })
      ]);

      setNominees(nomineesRes.data);
      setVoteStatus(statusRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleVote = async (nomineeId, nomineeName) => {
    if (voteStatus.voted) {
      showMessage('You have already voted!', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to vote for ${nomineeName}?`)) {
      return;
    }

    setVoting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API_BASE_URL}/api/nominees/${nomineeId}/vote`, {}, { headers });
      
      showMessage(`Thank you for voting for ${nomineeName}!`, 'success');
      setVoteStatus({ voted: true, votedFor: { name: nomineeName } });
      
      // Refresh nominees to show updated vote counts
      fetchData();
    } catch (error) {
      console.error('Error voting:', error);
      showMessage('Voting failed. Please try again.', 'error');
    } finally {
      setVoting(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  if (loading) {
    return (
      <div className="vote-container">
        <div className="loading-spinner">Loading nominees...</div>
      </div>
    );
  }

  return (
    <div className="vote-container">
      <div className="vote-header">
        <div className="header-content">
          <h1>🗳️ Cast Your Vote</h1>
          <p>Choose your favorite nominee from the list below</p>
          {user && (
            <div className="user-info">
              Welcome, <strong>{user.username}</strong>!
            </div>
          )}
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

      {/* Vote Status */}
      {voteStatus.voted && (
        <div className="vote-status">
          <div className="status-card">
            <div className="status-icon">✅</div>
            <div className="status-content">
              <h3>Vote Cast Successfully!</h3>
              <p>You voted for: <strong>{voteStatus.votedFor?.name}</strong></p>
              <p className="status-note">Thank you for participating in the election!</p>
            </div>
          </div>
        </div>
      )}

      {/* Nominees Grid */}
      <div className="nominees-section">
        <h2>🏆 Available Nominees</h2>
        {nominees.length === 0 ? (
          <div className="empty-state">
            <p>No nominees available for voting at the moment.</p>
            <p>Please check back later!</p>
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
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                  {voteStatus.voted && voteStatus.votedFor?.name === nominee.name && (
                    <div className="voted-badge">
                      <span>✅ Your Vote</span>
                    </div>
                  )}
                </div>
                <div className="nominee-info">
                  <h3>{nominee.name}</h3>
                  <button 
                    className={`vote-btn ${voteStatus.voted ? 'voted' : ''}`}
                    onClick={() => handleVote(nominee._id, nominee.name)}
                    disabled={voteStatus.voted || voting}
                  >
                    {voting ? 'Voting...' : voteStatus.voted ? 'Already Voted' : '🗳️ Vote'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voting Instructions */}
      {!voteStatus.voted && nominees.length > 0 && (
        <div className="instructions">
          <h3>📋 Voting Instructions</h3>
          <ul>
            <li>You can only vote once per election</li>
            <li>Your vote is confidential and secure</li>
            <li>Once you vote, you cannot change your selection</li>
            <li>Make sure to choose carefully!</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserVotePage;

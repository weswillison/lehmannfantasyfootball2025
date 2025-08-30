import React, { useState } from 'react';
import { api, User } from '../api';
import './UserRegistration.css';

interface Props {
  onUserRegistered: (user: User) => void;
}

const UserRegistration: React.FC<Props> = ({ onUserRegistered }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await api.createUser(name.trim());
      onUserRegistered(user);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration">
      <h2>Welcome to Fantasy Football!</h2>
      <p className="intro">Enter your name to get started with the Good, Bad & Ugly draft.</p>
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="name">Your Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={loading}
            maxLength={50}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          disabled={loading || !name.trim()}
          className="submit-button"
        >
          {loading ? 'Creating...' : 'Continue'}
        </button>
      </form>

      <div className="rules-preview">
        <h3>Quick Rules:</h3>
        <ul>
          <li>Pick 1 Good team (top-tier)</li>
          <li>Pick 1 Bad team (middle-tier)</li>
          <li>Pick 3 Ugly teams (lower-tier)</li>
          <li>Earn 2 points per win + playoff bonuses</li>
        </ul>
      </div>
    </div>
  );
};

export default UserRegistration;
import React, { useState, useEffect } from 'react';
import { api, User, UserPicks } from '../api';
import Leaderboard from './Leaderboard';
import ScoringRules from './ScoringRules';
import { getTeamIcon } from '../utils/teamIcons';
import './Dashboard.css';

interface Props {
  user: User;
  onBackToSelection: () => void;
  canEditPicks: boolean;
}

const Dashboard: React.FC<Props> = ({ user, onBackToSelection, canEditPicks }) => {
  const [userPicks, setUserPicks] = useState<UserPicks | null>(null);
  const [activeTab, setActiveTab] = useState<'picks' | 'leaderboard'>('picks');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserPicks = async () => {
      try {
        const picks = await api.getUserPicks(user.id);
        setUserPicks(picks);
      } catch (error) {
        setError('Failed to load your picks');
      } finally {
        setLoading(false);
      }
    };

    loadUserPicks();
  }, [user.id]);

  if (loading) {
    return <div className="loading">Loading your picks...</div>;
  }

  if (!userPicks) {
    return (
      <div className="no-picks">
        <h2>No picks found</h2>
        <p>It looks like you haven't made your picks yet.</p>
        <button onClick={onBackToSelection} className="action-button">
          Make Picks
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {user.name}!</h2>
        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'picks' ? 'active' : ''}`}
            onClick={() => setActiveTab('picks')}
          >
            My Picks
          </button>
          <button 
            className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'picks' && (
        <div className="picks-tab">
          <div className="picks-summary">
            <h3>Your Team Picks</h3>
            
            <div className="pick-category">
              <h4>Good Team</h4>
              <div className="team-pick">
                <span className="team-icon">{getTeamIcon(userPicks.good_team_name || '')}</span>
                <span className="team-text">{userPicks.good_team_city} {userPicks.good_team_name}</span>
              </div>
            </div>

            <div className="pick-category">
              <h4>Bad Team</h4>
              <div className="team-pick">
                <span className="team-icon">{getTeamIcon(userPicks.bad_team_name || '')}</span>
                <span className="team-text">{userPicks.bad_team_city} {userPicks.bad_team_name}</span>
              </div>
            </div>

            <div className="pick-category">
              <h4>Ugly Teams</h4>
              <div className="ugly-teams">
                <div className="team-pick">
                  <span className="team-icon">{getTeamIcon(userPicks.ugly_team_1_name || '')}</span>
                  <span className="team-text">{userPicks.ugly_team_1_city} {userPicks.ugly_team_1_name}</span>
                </div>
                <div className="team-pick">
                  <span className="team-icon">{getTeamIcon(userPicks.ugly_team_2_name || '')}</span>
                  <span className="team-text">{userPicks.ugly_team_2_city} {userPicks.ugly_team_2_name}</span>
                </div>
                <div className="team-pick">
                  <span className="team-icon">{getTeamIcon(userPicks.ugly_team_3_name || '')}</span>
                  <span className="team-text">{userPicks.ugly_team_3_city} {userPicks.ugly_team_3_name}</span>
                </div>
              </div>
            </div>

            {canEditPicks && (
              <button 
                onClick={onBackToSelection}
                className="edit-picks-button"
              >
                Edit Picks
              </button>
            )}

            {!canEditPicks && (
              <div className="picks-locked-message">
                <p>⚠️ Picks are locked for this season</p>
              </div>
            )}
          </div>

          <ScoringRules />
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="leaderboard-tab">
          <Leaderboard currentUser={user} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
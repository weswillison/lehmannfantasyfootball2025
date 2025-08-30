import React, { useState, useEffect } from 'react';
import { api, LeaderboardEntry, User, LeaderboardResponse } from '../api';
import { getTeamIcon } from '../utils/teamIcons';
import './Leaderboard.css';

interface Props {
  currentUser: User;
}

const Leaderboard: React.FC<Props> = ({ currentUser }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [picksRevealed, setPicksRevealed] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data: LeaderboardResponse = await api.getLeaderboard();
        setLeaderboard(data.leaderboard);
        setPicksRevealed(data.picksRevealed);
        setMessage(data.message || '');
      } catch (error) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (leaderboard.length === 0) {
    return (
      <div className="empty-leaderboard">
        <h3>No scores yet</h3>
        <p>The leaderboard will update as games are played and scores are calculated.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3>🏆 Leaderboard</h3>
      
      {!picksRevealed && message && (
        <div className="picks-hidden-message">
          <p>🔒 {message}</p>
          <p><small>Players can see their own picks, but others' picks are hidden until game time!</small></p>
        </div>
      )}
      
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank-col">Rank</div>
          <div className="name-col">Player</div>
          <div className="teams-col">Teams</div>
          <div className="score-breakdown-col">Score Breakdown</div>
          <div className="total-col">Total</div>
        </div>

        {leaderboard.map((entry, index) => (
          <div 
            key={entry.name}
            className={`table-row ${entry.name === currentUser.name ? 'current-user' : ''}`}
          >
            <div className="rank-col">
              <span className={`rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index >= 3 && `${index + 1}`}
              </span>
            </div>
            
            <div className="name-col">
              <span className="player-name">{entry.name}</span>
              {entry.name === currentUser.name && (
                <span className="you-indicator">(You)</span>
              )}
            </div>
            
            <div className="teams-col">
              <div className="team-picks">
                <div className="pick-row">
                  <span className="category">Good:</span>
                  <span className="team">
                    <span className="team-icon">{entry.good_team === 'Hidden' ? '🔒' : getTeamIcon(entry.good_team)}</span>
                    {entry.good_team}
                  </span>
                </div>
                <div className="pick-row">
                  <span className="category">Bad:</span>
                  <span className="team">
                    <span className="team-icon">{entry.bad_team === 'Hidden' ? '🔒' : getTeamIcon(entry.bad_team)}</span>
                    {entry.bad_team}
                  </span>
                </div>
                <div className="pick-row">
                  <span className="category">Ugly:</span>
                  <span className="team">
                    {entry.ugly_team_1 === 'Hidden' ? (
                      <>🔒 Hidden, 🔒 Hidden, 🔒 Hidden</>
                    ) : (
                      <>
                        <span className="team-icon">{getTeamIcon(entry.ugly_team_1)}</span>{entry.ugly_team_1}, 
                        <span className="team-icon">{getTeamIcon(entry.ugly_team_2)}</span>{entry.ugly_team_2}, 
                        <span className="team-icon">{getTeamIcon(entry.ugly_team_3)}</span>{entry.ugly_team_3}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="score-breakdown-col">
              <div className="score-item">
                <span className="score-label">Regular:</span>
                <span className="score-value">{entry.regular_season_points}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Playoffs:</span>
                <span className="score-value">{entry.playoff_points}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Super Bowl:</span>
                <span className="score-value">{entry.super_bowl_points}</span>
              </div>
            </div>
            
            <div className="total-col">
              <span className="total-score">{entry.total_points}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="leaderboard-info">
        <p>
          <strong>Note:</strong> Scores update automatically as games are completed. 
          Playoff and Super Bowl bonuses will be added as the season progresses.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
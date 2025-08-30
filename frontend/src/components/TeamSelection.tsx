import React, { useState, useEffect } from 'react';
import { api, Team, User } from '../api';
import ScoringRules from './ScoringRules';
import { getTeamIcon } from '../utils/teamIcons';
import './TeamSelection.css';

interface Props {
  user: User;
  onPicksSubmitted: () => void;
}

const TeamSelection: React.FC<Props> = ({ user, onPicksSubmitted }) => {
  const [goodTeams, setGoodTeams] = useState<Team[]>([]);
  const [badTeams, setBadTeams] = useState<Team[]>([]);
  const [uglyTeams, setUglyTeams] = useState<Team[]>([]);
  
  const [selectedGood, setSelectedGood] = useState<number | null>(null);
  const [selectedBad, setSelectedBad] = useState<number | null>(null);
  const [selectedUgly, setSelectedUgly] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const [good, bad, ugly] = await Promise.all([
          api.getTeamsByCategory('good'),
          api.getTeamsByCategory('bad'),
          api.getTeamsByCategory('ugly')
        ]);
        
        setGoodTeams(good);
        setBadTeams(bad);
        setUglyTeams(ugly);
        
        // Try to load existing picks
        try {
          const existingPicks = await api.getUserPicks(user.id);
          if (existingPicks) {
            setSelectedGood(existingPicks.good_team_id);
            setSelectedBad(existingPicks.bad_team_id);
            setSelectedUgly([
              existingPicks.ugly_team_1_id,
              existingPicks.ugly_team_2_id,
              existingPicks.ugly_team_3_id
            ]);
          }
        } catch (error) {
          // No existing picks, that's fine
        }
        
      } catch (error) {
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [user.id]);

  const handleUglyTeamToggle = (teamId: number) => {
    if (selectedUgly.includes(teamId)) {
      setSelectedUgly(selectedUgly.filter(id => id !== teamId));
    } else if (selectedUgly.length < 3) {
      setSelectedUgly([...selectedUgly, teamId]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedGood || !selectedBad || selectedUgly.length !== 3) {
      setError('Please make all required selections');
      return;
    }

    // Check for duplicates
    const allSelections = [selectedGood, selectedBad, ...selectedUgly];
    if (new Set(allSelections).size !== allSelections.length) {
      setError('You cannot select the same team multiple times');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.saveUserPicks({
        userId: user.id,
        goodTeam: selectedGood,
        badTeam: selectedBad,
        uglyTeams: selectedUgly
      });
      
      onPicksSubmitted();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save picks');
    } finally {
      setSubmitting(false);
    }
  };

  const isTeamSelected = (teamId: number) => {
    return teamId === selectedGood || 
           teamId === selectedBad || 
           selectedUgly.includes(teamId);
  };

  const canSubmit = selectedGood && selectedBad && selectedUgly.length === 3;

  if (loading) {
    return <div className="loading">Loading teams...</div>;
  }

  return (
    <div className="team-selection">
      <h2>Make Your Picks, {user.name}!</h2>
      
      <ScoringRules />

      <div className="selection-sections">
        {/* Good Teams */}
        <div className="team-category">
          <h3>Good Teams (Pick 1)</h3>
          <p className="category-description">Top-tier teams expected to perform well</p>
          <div className="teams-grid">
            {goodTeams.map((team) => (
              <div 
                key={team.id}
                className={`team-card ${selectedGood === team.id ? 'selected' : ''} ${isTeamSelected(team.id) && selectedGood !== team.id ? 'disabled' : ''}`}
                onClick={() => !isTeamSelected(team.id) || selectedGood === team.id ? setSelectedGood(selectedGood === team.id ? null : team.id) : undefined}
              >
                <div className="team-icon">{getTeamIcon(team.name)}</div>
                <div className="team-name">{team.city} {team.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bad Teams */}
        <div className="team-category">
          <h3>Bad Teams (Pick 1)</h3>
          <p className="category-description">Middle-tier teams with moderate expectations</p>
          <div className="teams-grid">
            {badTeams.map((team) => (
              <div 
                key={team.id}
                className={`team-card ${selectedBad === team.id ? 'selected' : ''} ${isTeamSelected(team.id) && selectedBad !== team.id ? 'disabled' : ''}`}
                onClick={() => !isTeamSelected(team.id) || selectedBad === team.id ? setSelectedBad(selectedBad === team.id ? null : team.id) : undefined}
              >
                <div className="team-icon">{getTeamIcon(team.name)}</div>
                <div className="team-name">{team.city} {team.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ugly Teams */}
        <div className="team-category">
          <h3>Ugly Teams (Pick 3)</h3>
          <p className="category-description">Lower-tier teams with rebuilding or challenging seasons ahead</p>
          <div className="teams-grid">
            {uglyTeams.map((team) => (
              <div 
                key={team.id}
                className={`team-card ${selectedUgly.includes(team.id) ? 'selected' : ''} ${isTeamSelected(team.id) && !selectedUgly.includes(team.id) ? 'disabled' : ''} ${selectedUgly.length >= 3 && !selectedUgly.includes(team.id) ? 'unavailable' : ''}`}
                onClick={() => {
                  if (!isTeamSelected(team.id) || selectedUgly.includes(team.id)) {
                    handleUglyTeamToggle(team.id);
                  }
                }}
              >
                <div className="team-icon">{getTeamIcon(team.name)}</div>
                <div className="team-name">{team.city} {team.name}</div>
              </div>
            ))}
          </div>
          <div className="ugly-counter">
            Selected: {selectedUgly.length} / 3
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="submit-section">
        <button 
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="submit-picks-button"
        >
          {submitting ? 'Saving...' : 'Submit Picks'}
        </button>
      </div>
    </div>
  );
};

export default TeamSelection;
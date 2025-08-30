import React, { useState, useEffect } from 'react';
import './App.css';
import UserRegistration from './components/UserRegistration';
import TeamSelection from './components/TeamSelection';
import Dashboard from './components/Dashboard';
import { api, User, Season } from './api';

type AppState = 'registration' | 'team-selection' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('registration');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [loading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadSeason = async () => {
      try {
        const season = await api.getCurrentSeason();
        setCurrentSeason(season);
      } catch (error) {
        console.error('Error loading season:', error);
      }
    };
    
    loadSeason();
  }, []);

  const handleUserRegistered = async (user: User) => {
    setCurrentUser(user);
    
    // Check if user already has picks
    try {
      const existingPicks = await api.getUserPicks(user.id);
      if (existingPicks) {
        setAppState('dashboard');
      } else {
        setAppState('team-selection');
      }
    } catch (error) {
      setAppState('team-selection');
    }
  };

  const handlePicksSubmitted = () => {
    setAppState('dashboard');
  };

  const handleBackToSelection = () => {
    if (currentSeason?.picks_locked) {
      setError('Picks are locked for this season');
      return;
    }
    setAppState('team-selection');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏈 Fantasy Football: Good, Bad & Ugly</h1>
        {currentSeason && (
          <div className="season-info">
            <p>{currentSeason.year} Season - Week {currentSeason.current_week}</p>
            {currentSeason.picks_locked && (
              <p className="picks-locked">⚠️ Picks are locked for this season</p>
            )}
          </div>
        )}
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}

        {appState === 'registration' && (
          <UserRegistration onUserRegistered={handleUserRegistered} />
        )}

        {appState === 'team-selection' && currentUser && (
          <TeamSelection 
            user={currentUser} 
            onPicksSubmitted={handlePicksSubmitted}
          />
        )}

        {appState === 'dashboard' && currentUser && (
          <Dashboard 
            user={currentUser}
            onBackToSelection={handleBackToSelection}
            canEditPicks={!currentSeason?.picks_locked}
          />
        )}
      </main>

      <footer className="App-footer">
        <p>Fantasy Football App - Track your Good, Bad & Ugly teams</p>
      </footer>
    </div>
  );
}

export default App;

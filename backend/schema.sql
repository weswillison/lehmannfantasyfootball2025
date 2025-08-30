-- Fantasy Football App Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teams table with Vegas win totals and categories
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('good', 'bad', 'ugly')),
    vegas_wins REAL NOT NULL,
    conference TEXT NOT NULL CHECK (conference IN ('AFC', 'NFC')),
    division TEXT NOT NULL
);

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL UNIQUE,
    current_week INTEGER DEFAULT 1,
    season_started BOOLEAN DEFAULT FALSE,
    playoffs_started BOOLEAN DEFAULT FALSE,
    super_bowl_complete BOOLEAN DEFAULT FALSE,
    picks_locked BOOLEAN DEFAULT FALSE,
    picks_revealed BOOLEAN DEFAULT FALSE,
    first_game_date DATETIME
);

-- User picks table
CREATE TABLE IF NOT EXISTS user_picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    good_team_id INTEGER NOT NULL,
    bad_team_id INTEGER NOT NULL,
    ugly_team_1_id INTEGER NOT NULL,
    ugly_team_2_id INTEGER NOT NULL,
    ugly_team_3_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (season_id) REFERENCES seasons(id),
    FOREIGN KEY (good_team_id) REFERENCES teams(id),
    FOREIGN KEY (bad_team_id) REFERENCES teams(id),
    FOREIGN KEY (ugly_team_1_id) REFERENCES teams(id),
    FOREIGN KEY (ugly_team_2_id) REFERENCES teams(id),
    FOREIGN KEY (ugly_team_3_id) REFERENCES teams(id),
    UNIQUE(user_id, season_id)
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    game_date DATETIME,
    espn_game_id TEXT,
    FOREIGN KEY (season_id) REFERENCES seasons(id),
    FOREIGN KEY (home_team_id) REFERENCES teams(id),
    FOREIGN KEY (away_team_id) REFERENCES teams(id)
);

-- User scores table for quick lookups
CREATE TABLE IF NOT EXISTS user_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    regular_season_points INTEGER DEFAULT 0,
    playoff_points INTEGER DEFAULT 0,
    super_bowl_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (season_id) REFERENCES seasons(id),
    UNIQUE(user_id, season_id)
);

-- Team standings for quick playoff/super bowl status lookups
CREATE TABLE IF NOT EXISTS team_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    made_playoffs BOOLEAN DEFAULT FALSE,
    made_super_bowl BOOLEAN DEFAULT FALSE,
    won_super_bowl BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (season_id) REFERENCES seasons(id),
    UNIQUE(team_id, season_id)
);
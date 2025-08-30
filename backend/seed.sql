-- Seed data for NFL teams with categories and Vegas win totals

-- Insert 2025 season
INSERT OR IGNORE INTO seasons (year, current_week, season_started, playoffs_started, super_bowl_complete, picks_locked) 
VALUES (2025, 1, FALSE, FALSE, FALSE, FALSE);

-- Insert all 32 NFL teams with categories based on Vegas win totals

-- GOOD teams (8 teams, 9.5+ win totals)
INSERT OR IGNORE INTO teams (name, city, category, vegas_wins, conference, division) VALUES
('Eagles', 'Philadelphia', 'good', 11.5, 'NFC', 'East'),
('Ravens', 'Baltimore', 'good', 11.5, 'AFC', 'North'),
('Bills', 'Buffalo', 'good', 11.5, 'AFC', 'East'),
('Chiefs', 'Kansas City', 'good', 11.5, 'AFC', 'West'),
('Lions', 'Detroit', 'good', 10.5, 'NFC', 'North'),
('49ers', 'San Francisco', 'good', 10.5, 'NFC', 'West'),
('Packers', 'Green Bay', 'good', 9.5, 'NFC', 'North'),
('Commanders', 'Washington', 'good', 9.5, 'NFC', 'East');

-- BAD teams (8 teams, 8.5-9.5 win totals)
INSERT OR IGNORE INTO teams (name, city, category, vegas_wins, conference, division) VALUES
('Bengals', 'Cincinnati', 'bad', 9.5, 'AFC', 'North'),
('Rams', 'Los Angeles', 'bad', 9.5, 'NFC', 'West'),
('Texans', 'Houston', 'bad', 9.5, 'AFC', 'South'),
('Chargers', 'Los Angeles', 'bad', 9.5, 'AFC', 'West'),
('Broncos', 'Denver', 'bad', 9.5, 'AFC', 'West'),
('Buccaneers', 'Tampa Bay', 'bad', 9.5, 'NFC', 'South'),
('Vikings', 'Minnesota', 'bad', 8.5, 'NFC', 'North'),
('Bears', 'Chicago', 'bad', 8.5, 'NFC', 'North');

-- UGLY teams (16 teams, 4.5-8.5 win totals)
INSERT OR IGNORE INTO teams (name, city, category, vegas_wins, conference, division) VALUES
('Steelers', 'Pittsburgh', 'ugly', 8.5, 'AFC', 'North'),
('Cardinals', 'Arizona', 'ugly', 8.5, 'NFC', 'West'),
('Seahawks', 'Seattle', 'ugly', 8.5, 'NFC', 'West'),
('Patriots', 'New England', 'ugly', 8.5, 'AFC', 'East'),
('Dolphins', 'Miami', 'ugly', 8.5, 'AFC', 'East'),
('Falcons', 'Atlanta', 'ugly', 7.5, 'NFC', 'South'),
('Cowboys', 'Dallas', 'ugly', 7.5, 'NFC', 'East'),
('Jaguars', 'Jacksonville', 'ugly', 7.5, 'AFC', 'South'),
('Colts', 'Indianapolis', 'ugly', 7.5, 'AFC', 'South'),
('Raiders', 'Las Vegas', 'ugly', 6.5, 'AFC', 'West'),
('Panthers', 'Carolina', 'ugly', 6.5, 'NFC', 'South'),
('Jets', 'New York', 'ugly', 5.5, 'AFC', 'East'),
('Giants', 'New York', 'ugly', 5.5, 'NFC', 'East'),
('Titans', 'Tennessee', 'ugly', 5.5, 'AFC', 'South'),
('Browns', 'Cleveland', 'ugly', 4.5, 'AFC', 'North'),
('Saints', 'New Orleans', 'ugly', 4.5, 'NFC', 'South');
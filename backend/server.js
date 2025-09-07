const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const Database = require('./database');
const GameUpdater = require('./gameUpdater');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'https://willison-fantasy-football-2025.netlify.app'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialize database and game updater
const db = new Database();
const gameUpdater = new GameUpdater();

// Schedule game updates every hour during football season
// This will run every hour from Thursday through Monday during football season
cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const month = now.getMonth(); // 0 = January, 11 = December
    
    // Only run during football season (September through February) and on game days
    if (month >= 8 || month <= 1) { // September through February
        if (day >= 4 || day <= 1) { // Thursday through Monday
            console.log('Running scheduled game update...');
            await gameUpdater.updateGames();
        }
    }
});

// API Routes

// Get all teams by category
app.get('/api/teams/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!['good', 'bad', 'ugly'].includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }
        
        const teams = await db.getTeamsByCategory(category);
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current season info
app.get('/api/season/current', async (req, res) => {
    try {
        const season = await db.getCurrentSeason();
        res.json(season);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or get user
app.post('/api/users', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Try to get existing user first
        let user = await db.getUserByName(name.trim());
        
        if (!user) {
            // Create new user
            const result = await db.createUser(name.trim());
            user = { id: result.id, name: name.trim() };
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by name
app.get('/api/users/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const user = await db.getUserByName(name);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save user picks
app.post('/api/picks', async (req, res) => {
    try {
        const { userId, goodTeam, badTeam, uglyTeams } = req.body;
        
        // Validation
        if (!userId || !goodTeam || !badTeam || !uglyTeams || uglyTeams.length !== 3) {
            return res.status(400).json({ error: 'Invalid picks data' });
        }

        // Check if picks are locked
        const season = await db.getCurrentSeason();
        if (season.picks_locked) {
            return res.status(400).json({ error: 'Picks are locked for this season' });
        }

        // Validate team categories
        const goodTeamData = await db.get('SELECT category FROM teams WHERE id = ?', [goodTeam]);
        const badTeamData = await db.get('SELECT category FROM teams WHERE id = ?', [badTeam]);
        
        if (goodTeamData?.category !== 'good') {
            return res.status(400).json({ error: 'Invalid good team selection' });
        }
        if (badTeamData?.category !== 'bad') {
            return res.status(400).json({ error: 'Invalid bad team selection' });
        }

        for (const uglyTeam of uglyTeams) {
            const uglyTeamData = await db.get('SELECT category FROM teams WHERE id = ?', [uglyTeam]);
            if (uglyTeamData?.category !== 'ugly') {
                return res.status(400).json({ error: 'Invalid ugly team selection' });
            }
        }

        // Check for duplicate teams
        const allTeams = [goodTeam, badTeam, ...uglyTeams];
        if (new Set(allTeams).size !== allTeams.length) {
            return res.status(400).json({ error: 'Cannot select the same team multiple times' });
        }

        await db.saveUserPicks(userId, season.id, { goodTeam, badTeam, uglyTeams });
        
        // Initialize user score record
        await db.run(`
            INSERT OR IGNORE INTO user_scores (user_id, season_id) VALUES (?, ?)
        `, [userId, season.id]);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user picks
app.get('/api/picks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const season = await db.getCurrentSeason();
        const picks = await db.getUserPicks(userId, season.id);
        
        res.json(picks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const season = await db.getCurrentSeason();
        const leaderboard = await db.getLeaderboard(season.id);
        const picksRevealed = await db.arePicksRevealed(season.id);
        
        res.json({
            leaderboard,
            picksRevealed,
            message: picksRevealed ? null : 'Team picks will be revealed after the first NFL game starts!'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manual game update (for testing)
app.post('/api/admin/update-games', async (req, res) => {
    try {
        await gameUpdater.updateGames();
        res.json({ success: true, message: 'Games updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lock picks (admin function)
app.post('/api/admin/lock-picks', async (req, res) => {
    try {
        const season = await db.getCurrentSeason();
        await db.run('UPDATE seasons SET picks_locked = TRUE WHERE id = ?', [season.id]);
        res.json({ success: true, message: 'Picks locked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reveal picks (admin function)
app.post('/api/admin/reveal-picks', async (req, res) => {
    try {
        const season = await db.getCurrentSeason();
        await db.revealPicks(season.id);
        res.json({ success: true, message: 'Picks revealed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hide picks (admin function - for testing)
app.post('/api/admin/hide-picks', async (req, res) => {
    try {
        const season = await db.getCurrentSeason();
        await db.run('UPDATE seasons SET picks_revealed = FALSE WHERE id = ?', [season.id]);
        res.json({ success: true, message: 'Picks hidden successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if picks are revealed (for frontend)
app.get('/api/picks-status', async (req, res) => {
    try {
        const season = await db.getCurrentSeason();
        const picksRevealed = await db.arePicksRevealed(season.id);
        const firstGameDate = season.first_game_date;
        
        res.json({
            picksRevealed,
            firstGameDate,
            message: picksRevealed ? 'Picks are revealed!' : 'Picks will be revealed after the first NFL game starts'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get scoring rules
app.get('/api/rules', async (req, res) => {
    res.json({
        rules: [
            '2 points per regular season win',
            '0 points per regular season loss',
            '5 bonus points if team makes playoffs',
            '10 bonus points if team makes Super Bowl',
            'Pick 1 Good team (top-tier)',
            'Pick 1 Bad team (middle-tier)', 
            'Pick 3 Ugly teams (lower-tier)',
            'Picks lock before Week 1 Thursday Night Football'
        ]
    });
});

// Admin endpoint to add missing database column
app.post('/api/admin/add-column', async (req, res) => {
    try {
        // Try to add the score_processed column if it doesn't exist
        await db.run('ALTER TABLE games ADD COLUMN score_processed BOOLEAN DEFAULT FALSE');
        res.json({ success: true, message: 'Column added successfully' });
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            res.json({ success: true, message: 'Column already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Admin endpoint to update games manually
app.post('/api/admin/update-games', async (req, res) => {
    try {
        await gameUpdater.updateGames();
        res.json({ success: true, message: 'Games updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin endpoint to fix corrupted scores by resetting and recalculating
app.post('/api/admin/fix-scores', async (req, res) => {
    try {
        const season = await db.getCurrentSeason();
        
        // Reset all team standings to actual game results
        await db.run('DELETE FROM team_standings WHERE season_id = ?', [season.id]);
        
        // Reset all games to unprocessed
        await db.run('UPDATE games SET score_processed = FALSE WHERE season_id = ?', [season.id]);
        
        // Recalculate standings from scratch
        const completedGames = await db.all(`
            SELECT * FROM games 
            WHERE season_id = ? AND completed = TRUE 
            AND home_score IS NOT NULL AND away_score IS NOT NULL
            ORDER BY game_date ASC
        `, [season.id]);
        
        // Process each game exactly once
        for (const game of completedGames) {
            if (!game.score_processed) {
                await gameUpdater.updateTeamRecord(
                    game.home_team_id, 
                    game.away_team_id, 
                    game.home_score, 
                    game.away_score, 
                    season.id, 
                    game.espn_game_id
                );
            }
        }
        
        // Recalculate all user scores
        await gameUpdater.recalculateAllScores(season.id);
        
        res.json({ 
            success: true, 
            message: `Scores fixed! Processed ${completedGames.length} games`,
            gamesProcessed: completedGames.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(`Fantasy Football API server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
});

module.exports = app;
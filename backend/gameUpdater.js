const ESPNApi = require('./espnApi');
const Database = require('./database');

class GameUpdater {
    constructor() {
        this.espnApi = new ESPNApi();
        this.db = new Database();
    }

    // Update all games and scores for current week
    async updateGames() {
        try {
            const season = await this.db.getCurrentSeason();
            if (!season) {
                console.log('No current season found');
                return;
            }

            console.log(`Updating games for week ${season.current_week} of ${season.year}`);
            
            // Get games from ESPN API
            const espnGames = await this.espnApi.getGamesForWeek(season.year, season.current_week);
            
            for (const espnGame of espnGames) {
                await this.updateSingleGame(espnGame, season);
            }

            // Update team standings
            await this.updateStandings(season);
            
            // Recalculate user scores
            await this.recalculateAllScores(season.id);
            
            console.log('Game update complete');
        } catch (error) {
            console.error('Error updating games:', error);
        }
    }

    async updateSingleGame(espnGame, season) {
        try {
            // Find matching teams in database
            const homeTeam = await this.db.get(
                'SELECT id FROM teams WHERE name = ? OR city = ?', 
                [espnGame.homeTeamName.split(' ').pop(), espnGame.homeTeamName.split(' ')[0]]
            );
            
            const awayTeam = await this.db.get(
                'SELECT id FROM teams WHERE name = ? OR city = ?', 
                [espnGame.awayTeamName.split(' ').pop(), espnGame.awayTeamName.split(' ')[0]]
            );

            if (!homeTeam || !awayTeam) {
                console.log(`Could not find teams for game: ${espnGame.awayTeamName} @ ${espnGame.homeTeamName}`);
                return;
            }

            // Check if game already exists
            const existingGame = await this.db.get(
                'SELECT * FROM games WHERE espn_game_id = ?',
                [espnGame.espnGameId]
            );

            if (existingGame) {
                // Update existing game
                await this.db.run(`
                    UPDATE games SET 
                        home_score = ?, away_score = ?, completed = ?, game_date = ?
                    WHERE espn_game_id = ?
                `, [
                    espnGame.homeScore, espnGame.awayScore, 
                    espnGame.completed, espnGame.date.toISOString(),
                    espnGame.espnGameId
                ]);
            } else {
                // Insert new game
                await this.db.run(`
                    INSERT INTO games 
                    (season_id, week, home_team_id, away_team_id, home_score, away_score, completed, game_date, espn_game_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    season.id, espnGame.week, homeTeam.id, awayTeam.id,
                    espnGame.homeScore, espnGame.awayScore, espnGame.completed,
                    espnGame.date.toISOString(), espnGame.espnGameId
                ]);
            }

            // Update team standings if game is completed
            if (espnGame.completed && espnGame.homeScore !== null && espnGame.awayScore !== null) {
                await this.updateTeamRecord(homeTeam.id, awayTeam.id, espnGame.homeScore, espnGame.awayScore, season.id);
            }

        } catch (error) {
            console.error('Error updating single game:', error);
        }
    }

    async updateTeamRecord(homeTeamId, awayTeamId, homeScore, awayScore, seasonId) {
        const winner = homeScore > awayScore ? homeTeamId : awayTeamId;
        const loser = homeScore > awayScore ? awayTeamId : homeTeamId;

        // Update winner's record
        await this.db.run(`
            INSERT OR IGNORE INTO team_standings (team_id, season_id, wins, losses) VALUES (?, ?, 0, 0)
        `, [winner, seasonId]);
        
        await this.db.run(`
            UPDATE team_standings SET wins = wins + 1 WHERE team_id = ? AND season_id = ?
        `, [winner, seasonId]);

        // Update loser's record
        await this.db.run(`
            INSERT OR IGNORE INTO team_standings (team_id, season_id, wins, losses) VALUES (?, ?, 0, 0)
        `, [loser, seasonId]);
        
        await this.db.run(`
            UPDATE team_standings SET losses = losses + 1 WHERE team_id = ? AND season_id = ?
        `, [loser, seasonId]);
    }

    async updateStandings(season) {
        // This will be called to update playoff status later in the season
        // For now, just ensure all teams have standings entries
        const teams = await this.db.all('SELECT id FROM teams');
        
        for (const team of teams) {
            await this.db.run(`
                INSERT OR IGNORE INTO team_standings (team_id, season_id, wins, losses) 
                VALUES (?, ?, 0, 0)
            `, [team.id, season.id]);
        }
    }

    async recalculateAllScores(seasonId) {
        // Get all users with picks for this season
        const users = await this.db.all(`
            SELECT DISTINCT user_id FROM user_picks WHERE season_id = ?
        `, [seasonId]);

        for (const user of users) {
            await this.calculateUserScore(user.user_id, seasonId);
        }
    }

    async calculateUserScore(userId, seasonId) {
        // Get user's picks
        const picks = await this.db.getUserPicks(userId, seasonId);
        if (!picks) return;

        const teamIds = [
            picks.good_team_id,
            picks.bad_team_id,
            picks.ugly_team_1_id,
            picks.ugly_team_2_id,
            picks.ugly_team_3_id
        ];

        let totalPoints = 0;
        let regularSeasonPoints = 0;
        let playoffPoints = 0;
        let superBowlPoints = 0;

        // Calculate points for each team
        for (const teamId of teamIds) {
            const standings = await this.db.get(`
                SELECT * FROM team_standings WHERE team_id = ? AND season_id = ?
            `, [teamId, seasonId]);

            if (standings) {
                // 2 points per win, 0 per loss
                regularSeasonPoints += standings.wins * 2;
                
                // 5 points for making playoffs
                if (standings.made_playoffs) {
                    playoffPoints += 5;
                }
                
                // 10 points for making Super Bowl
                if (standings.made_super_bowl) {
                    superBowlPoints += 10;
                }
            }
        }

        totalPoints = regularSeasonPoints + playoffPoints + superBowlPoints;

        // Update user score
        await this.db.run(`
            INSERT OR REPLACE INTO user_scores 
            (user_id, season_id, regular_season_points, playoff_points, super_bowl_points, total_points, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [userId, seasonId, regularSeasonPoints, playoffPoints, superBowlPoints, totalPoints]);
    }
}

module.exports = GameUpdater;
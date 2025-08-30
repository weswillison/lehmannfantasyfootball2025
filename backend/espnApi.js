const axios = require('axios');

class ESPNApi {
    constructor() {
        this.baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
    }

    // Get all NFL games for a specific week and year
    async getGamesForWeek(year = 2025, week = 1) {
        try {
            const url = `${this.baseUrl}/scoreboard?dates=${year}&seasontype=2&week=${week}`;
            const response = await axios.get(url);
            
            return response.data.events.map(event => {
                const game = event.competitions[0];
                const homeTeam = game.competitors.find(team => team.homeAway === 'home');
                const awayTeam = game.competitors.find(team => team.homeAway === 'away');
                
                return {
                    espnGameId: event.id,
                    date: new Date(event.date),
                    week: week,
                    homeTeamName: homeTeam.team.displayName,
                    awayTeamName: awayTeam.team.displayName,
                    homeScore: parseInt(homeTeam.score) || null,
                    awayScore: parseInt(awayTeam.score) || null,
                    completed: event.status.type.completed,
                    homeTeamId: homeTeam.team.id,
                    awayTeamId: awayTeam.team.id
                };
            });
        } catch (error) {
            console.error('Error fetching games from ESPN:', error.message);
            return [];
        }
    }

    // Get current week number
    async getCurrentWeek(year = 2025) {
        try {
            const url = `${this.baseUrl}/scoreboard`;
            const response = await axios.get(url);
            return response.data.week?.number || 1;
        } catch (error) {
            console.error('Error fetching current week:', error.message);
            return 1;
        }
    }

    // Get team standings
    async getStandings(year = 2025) {
        try {
            const url = `${this.baseUrl}/standings`;
            const response = await axios.get(url);
            
            const standings = [];
            response.data.children.forEach(conference => {
                conference.standings.entries.forEach(team => {
                    standings.push({
                        teamName: team.team.displayName,
                        wins: team.stats.find(stat => stat.name === 'wins')?.value || 0,
                        losses: team.stats.find(stat => stat.name === 'losses')?.value || 0,
                        espnTeamId: team.team.id
                    });
                });
            });
            
            return standings;
        } catch (error) {
            console.error('Error fetching standings:', error.message);
            return [];
        }
    }

    // Get playoff teams (this will be manually updated as season progresses)
    async getPlayoffTeams(year = 2025) {
        // For now, return empty array. This will be updated as playoffs approach
        // In a real implementation, you'd check ESPN's playoff bracket API
        return [];
    }

    // Helper method to map ESPN team names to our database team names
    mapEspnTeamToDatabase(espnTeamName) {
        const teamMap = {
            'Philadelphia Eagles': { city: 'Philadelphia', name: 'Eagles' },
            'Baltimore Ravens': { city: 'Baltimore', name: 'Ravens' },
            'Buffalo Bills': { city: 'Buffalo', name: 'Bills' },
            'Kansas City Chiefs': { city: 'Kansas City', name: 'Chiefs' },
            'Detroit Lions': { city: 'Detroit', name: 'Lions' },
            'San Francisco 49ers': { city: 'San Francisco', name: '49ers' },
            'Green Bay Packers': { city: 'Green Bay', name: 'Packers' },
            'Washington Commanders': { city: 'Washington', name: 'Commanders' },
            'Cincinnati Bengals': { city: 'Cincinnati', name: 'Bengals' },
            'Los Angeles Rams': { city: 'Los Angeles', name: 'Rams' },
            'Houston Texans': { city: 'Houston', name: 'Texans' },
            'Los Angeles Chargers': { city: 'Los Angeles', name: 'Chargers' },
            'Denver Broncos': { city: 'Denver', name: 'Broncos' },
            'Tampa Bay Buccaneers': { city: 'Tampa Bay', name: 'Buccaneers' },
            'Minnesota Vikings': { city: 'Minnesota', name: 'Vikings' },
            'Chicago Bears': { city: 'Chicago', name: 'Bears' },
            'Pittsburgh Steelers': { city: 'Pittsburgh', name: 'Steelers' },
            'Arizona Cardinals': { city: 'Arizona', name: 'Cardinals' },
            'Seattle Seahawks': { city: 'Seattle', name: 'Seahawks' },
            'New England Patriots': { city: 'New England', name: 'Patriots' },
            'Miami Dolphins': { city: 'Miami', name: 'Dolphins' },
            'Atlanta Falcons': { city: 'Atlanta', name: 'Falcons' },
            'Dallas Cowboys': { city: 'Dallas', name: 'Cowboys' },
            'Jacksonville Jaguars': { city: 'Jacksonville', name: 'Jaguars' },
            'Indianapolis Colts': { city: 'Indianapolis', name: 'Colts' },
            'Las Vegas Raiders': { city: 'Las Vegas', name: 'Raiders' },
            'Carolina Panthers': { city: 'Carolina', name: 'Panthers' },
            'New York Jets': { city: 'New York', name: 'Jets' },
            'New York Giants': { city: 'New York', name: 'Giants' },
            'Tennessee Titans': { city: 'Tennessee', name: 'Titans' },
            'Cleveland Browns': { city: 'Cleveland', name: 'Browns' },
            'New Orleans Saints': { city: 'New Orleans', name: 'Saints' }
        };
        
        return teamMap[espnTeamName] || null;
    }
}

module.exports = ESPNApi;
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
    constructor(dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/fantasy_football.db')) {
        this.initialized = false;
        // Ensure the directory exists in production
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                if (!this.initialized) {
                    this.initialize();
                }
            }
        });
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Read and execute schema
            const schemaPath = path.join(__dirname, '../database/schema.sql');
            console.log('Looking for schema at:', schemaPath);
            
            if (!fs.existsSync(schemaPath)) {
                console.error('Schema file not found at:', schemaPath);
                // Try alternative path for Railway deployment
                const altSchemaPath = path.join(__dirname, './schema.sql');
                if (fs.existsSync(altSchemaPath)) {
                    console.log('Using alternative schema path:', altSchemaPath);
                } else {
                    throw new Error('Schema file not found');
                }
            }
            
            const schema = fs.readFileSync(fs.existsSync(schemaPath) ? schemaPath : path.join(__dirname, './schema.sql'), 'utf8');
            await this.exec(schema);
            
            // Check if teams already exist to avoid duplicates
            const existingTeams = await this.all('SELECT COUNT(*) as count FROM teams');
            if (existingTeams[0].count === 0) {
                // Read and execute seed data only if no teams exist
                const seedPath = path.join(__dirname, '../database/seed.sql');
                const altSeedPath = path.join(__dirname, './seed.sql');
                
                const seed = fs.readFileSync(fs.existsSync(seedPath) ? seedPath : altSeedPath, 'utf8');
                await this.exec(seed);
                console.log('Seed data inserted successfully');
            }
            
            this.initialized = true;
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            // Log more details for debugging
            console.error('Current directory:', __dirname);
            console.error('Available files:', fs.readdirSync(__dirname));
        }
    }

    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // App-specific methods
    async getTeamsByCategory(category) {
        return this.all('SELECT * FROM teams WHERE category = ? ORDER BY name', [category]);
    }

    async getCurrentSeason() {
        return this.get('SELECT * FROM seasons ORDER BY year DESC LIMIT 1');
    }

    async getUserPicks(userId, seasonId) {
        const sql = `
            SELECT up.*, 
                   gt.name as good_team_name, gt.city as good_team_city,
                   bt.name as bad_team_name, bt.city as bad_team_city,
                   ut1.name as ugly_team_1_name, ut1.city as ugly_team_1_city,
                   ut2.name as ugly_team_2_name, ut2.city as ugly_team_2_city,
                   ut3.name as ugly_team_3_name, ut3.city as ugly_team_3_city
            FROM user_picks up
            LEFT JOIN teams gt ON up.good_team_id = gt.id
            LEFT JOIN teams bt ON up.bad_team_id = bt.id
            LEFT JOIN teams ut1 ON up.ugly_team_1_id = ut1.id
            LEFT JOIN teams ut2 ON up.ugly_team_2_id = ut2.id
            LEFT JOIN teams ut3 ON up.ugly_team_3_id = ut3.id
            WHERE up.user_id = ? AND up.season_id = ?
        `;
        return this.get(sql, [userId, seasonId]);
    }

    async saveUserPicks(userId, seasonId, picks) {
        const sql = `
            INSERT OR REPLACE INTO user_picks 
            (user_id, season_id, good_team_id, bad_team_id, ugly_team_1_id, ugly_team_2_id, ugly_team_3_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return this.run(sql, [
            userId, seasonId, picks.goodTeam, picks.badTeam, 
            picks.uglyTeams[0], picks.uglyTeams[1], picks.uglyTeams[2]
        ]);
    }

    async createUser(name) {
        return this.run('INSERT OR IGNORE INTO users (name) VALUES (?)', [name]);
    }

    async getUserByName(name) {
        return this.get('SELECT * FROM users WHERE name = ?', [name]);
    }

    async getLeaderboard(seasonId) {
        const sql = `
            SELECT u.name, us.*, 
                   gt.name as good_team, bt.name as bad_team,
                   ut1.name as ugly_team_1, ut2.name as ugly_team_2, ut3.name as ugly_team_3
            FROM user_scores us
            JOIN users u ON us.user_id = u.id
            JOIN user_picks up ON us.user_id = up.user_id AND us.season_id = up.season_id
            LEFT JOIN teams gt ON up.good_team_id = gt.id
            LEFT JOIN teams bt ON up.bad_team_id = bt.id
            LEFT JOIN teams ut1 ON up.ugly_team_1_id = ut1.id
            LEFT JOIN teams ut2 ON up.ugly_team_2_id = ut2.id
            LEFT JOIN teams ut3 ON up.ugly_team_3_id = ut3.id
            WHERE us.season_id = ?
            ORDER BY us.total_points DESC, u.name ASC
        `;
        return this.all(sql, [seasonId]);
    }
}

module.exports = Database;
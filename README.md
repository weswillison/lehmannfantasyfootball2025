# 🏈 Fantasy Football: Good, Bad & Ugly

A unique fantasy football game where players draft teams across three categories based on their projected win totals. Earn points throughout the season as your teams perform!

## 🎮 Game Rules

### Team Selection
- **Good Teams (Pick 1)**: Teams with 9.5+ projected wins
- **Bad Teams (Pick 1)**: Teams with 8.5-9.5 projected wins  
- **Ugly Teams (Pick 3)**: Teams with 4.5-8.5 projected wins

### Scoring System
- **2 points** per regular season win
- **0 points** per regular season loss
- **5 bonus points** if a team makes the playoffs
- **10 bonus points** if a team makes the Super Bowl

### 2025 Team Categories

#### Good Teams (9.5+ wins)
- Philadelphia Eagles (11.5)
- Baltimore Ravens (11.5)
- Buffalo Bills (11.5)
- Kansas City Chiefs (11.5)
- Detroit Lions (10.5)
- San Francisco 49ers (10.5)
- Green Bay Packers (9.5)
- Washington Commanders (9.5)

#### Bad Teams (8.5-9.5 wins)
- Cincinnati Bengals (9.5)
- LA Rams (9.5)
- Houston Texans (9.5)
- LA Chargers (9.5)
- Denver Broncos (9.5)
- Tampa Bay Buccaneers (9.5)
- Minnesota Vikings (8.5)
- Chicago Bears (8.5)

#### Ugly Teams (4.5-8.5 wins)
- Pittsburgh Steelers (8.5)
- Arizona Cardinals (8.5)
- Seattle Seahawks (8.5)
- New England Patriots (8.5)
- Miami Dolphins (8.5)
- Atlanta Falcons (7.5)
- Dallas Cowboys (7.5)
- Jacksonville Jaguars (7.5)
- Indianapolis Colts (7.5)
- Las Vegas Raiders (6.5)
- Carolina Panthers (6.5)
- New York Jets (5.5)
- New York Giants (5.5)
- Tennessee Titans (5.5)
- Cleveland Browns (4.5)
- New Orleans Saints (4.5)

## 🛠 Technical Stack

### Backend
- **Node.js + Express**: API server
- **SQLite**: Database for storing users, picks, games, and scores
- **ESPN API**: Real-time NFL game data and scores
- **Node-cron**: Automated game updates

### Frontend  
- **React + TypeScript**: User interface
- **CSS3**: Styling with gradients and animations
- **Axios**: API communication

## 📁 Project Structure

```
Fantasy Football App/
├── backend/
│   ├── server.js              # Express server and API routes
│   ├── database.js            # Database connection and methods
│   ├── espnApi.js            # ESPN API integration
│   ├── gameUpdater.js        # Game data sync and scoring
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── UserRegistration.tsx
│   │   │   ├── TeamSelection.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── ScoringRules.tsx
│   │   ├── api.ts           # API service layer  
│   │   ├── App.tsx          # Main application
│   │   └── App.css          # Global styles
│   └── package.json
├── database/
│   ├── schema.sql           # Database schema
│   └── seed.sql            # Team data
├── start.sh                # Startup script
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm

### Installation

1. **Clone or download the project files**

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Option 1: Use the startup script (Recommended)
```bash
# From the project root
./start.sh
```

#### Option 2: Start servers manually
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 🎯 How to Play

1. **Register**: Enter your name to create a user account
2. **Draft Teams**: 
   - Pick 1 Good team (highest projected wins)
   - Pick 1 Bad team (middle projected wins) 
   - Pick 3 Ugly teams (lowest projected wins)
3. **Submit**: Save your picks (locked before Week 1 starts)
4. **Track Progress**: Monitor your teams' performance on the dashboard
5. **Compete**: Check the leaderboard to see how you rank against other players

## 📊 Features

### For Players
- **Team Selection Interface**: Easy-to-use draft interface with team categories
- **Real-time Scoring**: Automatic score updates as games complete
- **Live Leaderboard**: See how you rank against other players
- **Pick Management**: View and edit your team selections (before deadline)
- **Score Breakdown**: Detailed point breakdown by category

### For Administrators
- **Automatic Game Updates**: Hourly sync with ESPN during game days
- **Manual Updates**: Force game data refresh via API endpoint
- **Pick Locking**: Lock picks before season starts
- **Season Management**: Update playoff and Super Bowl status

## 🔧 API Endpoints

### Teams
- `GET /api/teams/{category}` - Get teams by category (good/bad/ugly)
- `GET /api/rules` - Get scoring rules

### Users & Picks
- `POST /api/users` - Create/get user by name
- `GET /api/users/{name}` - Get user by name
- `POST /api/picks` - Save user team picks
- `GET /api/picks/{userId}` - Get user's picks

### Scoring & Leaderboard
- `GET /api/leaderboard` - Get current standings
- `GET /api/season/current` - Get current season info

### Admin
- `POST /api/admin/update-games` - Manually update games
- `POST /api/admin/lock-picks` - Lock picks for season

## 🤖 Automated Features

### Game Data Updates
- Runs every hour during game days (Thursday-Monday)
- Fetches live scores from ESPN API
- Updates team records and standings
- Recalculates all user scores automatically

### Scoring System
- Automatically awards 2 points per team win
- Adds playoff bonuses (5 points) when teams clinch
- Adds Super Bowl bonuses (10 points) for finalists
- Updates leaderboard in real-time

## 🗄 Database Schema

### Key Tables
- **users**: Player information
- **teams**: NFL teams with categories and Vegas win totals
- **user_picks**: Player team selections
- **games**: NFL game results and scores  
- **user_scores**: Calculated point totals
- **seasons**: Season management and settings

## 🎨 Customization

### Adding New Seasons
1. Update the `seasons` table with the new year
2. Update team categories in `seed.sql` based on new Vegas win totals
3. Reset `picks_locked` to allow new picks

### Modifying Scoring Rules  
1. Update scoring logic in `gameUpdater.js`
2. Update rules display in the frontend API call
3. Recalculate existing scores if needed

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check if port 3001 is available
- Verify Node.js version (v14+)
- Check database permissions

**Frontend compilation errors**
- Delete `node_modules` and run `npm install`
- Clear browser cache
- Check for TypeScript errors

**Game data not updating**
- Check ESPN API connectivity
- Verify cron schedule settings
- Check server logs for API errors

**Picks not saving**
- Verify backend is running on port 3001
- Check browser network tab for API errors
- Ensure user is created before saving picks

## 📋 Development Notes

### Future Enhancements
- User authentication and passwords
- Email notifications for game updates  
- Advanced statistics and analytics
- Mobile app version
- Multiple seasons/leagues support

### Known Limitations  
- ESPN API has no rate limits but could change
- Playoff detection requires manual configuration
- No real-time websocket updates (polls on page refresh)

## 📄 License

This project is created for educational and entertainment purposes. NFL team names and data are used under fair use for non-commercial purposes.

## 🚀 Deployment

Ready to deploy your app to the web? Check out `DEPLOYMENT.md` for a complete step-by-step guide to deploy:

- **Backend**: Railway (free tier available)
- **Frontend**: Netlify (free tier available)

Quick deployment prep:
```bash
./deploy-prep.sh
```

The app is designed to be deployed for **free** on modern platforms with automatic SSL, CDN, and scaling.

---

**Enjoy the season and may the best drafter win!** 🏆
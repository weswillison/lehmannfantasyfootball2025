# 🚀 Deployment Guide

This guide walks you through deploying your Fantasy Football app using Railway (backend) and Netlify (frontend).

## Prerequisites

- GitHub account
- Railway account (free): https://railway.app
- Netlify account (free): https://netlify.com

## Step 1: Push Code to GitHub

First, create a GitHub repository for your code:

1. Go to https://github.com and create a new repository called `fantasy-football-app`
2. In your project directory, initialize git and push:

```bash
git init
git add .
git commit -m "Initial commit - Fantasy Football Good Bad Ugly app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fantasy-football-app.git
git push -u origin main
```

## Step 2: Deploy Backend to Railway

### 2.1 Connect to Railway
1. Go to https://railway.app and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `fantasy-football-app` repository
4. Railway will auto-detect it's a Node.js app

### 2.2 Configure Environment Variables
In your Railway project dashboard:
1. Go to "Variables" tab
2. Add these environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_PATH=/app/data/fantasy_football.db
   ```

### 2.3 Set Root Directory
1. In Railway, go to "Settings"
2. Set "Root Directory" to `backend`
3. Set "Start Command" to `npm start`

### 2.4 Get Your Backend URL
After deployment, Railway will give you a URL like:
`https://fantasy-football-backend-production-xxxx.up.railway.app`

Copy this URL - you'll need it for the frontend.

## Step 3: Deploy Frontend to Netlify

### 3.1 Prepare Environment Variables
1. In your `frontend` folder, create a `.env.production` file:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
   ```
   Replace with your actual Railway URL from Step 2.4

### 3.2 Deploy to Netlify
**Option A: Drag & Drop (Quick)**
1. In your `frontend` folder, run: `npm run build`
2. Go to https://netlify.com and login
3. Drag the `build` folder to the deployment area

**Option B: Git Integration (Recommended)**
1. Go to https://netlify.com and login
2. Click "New site from Git"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Add environment variable in Netlify:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-railway-backend-url.railway.app/api`

### 3.3 Update CORS Settings
1. Go back to your Railway backend
2. Update the environment variable:
   ```
   FRONTEND_URL=https://your-netlify-site.netlify.app
   ```
3. Deploy the backend again (Railway will auto-deploy)

## Step 4: Test Your Deployed App

1. Visit your Netlify URL
2. Try registering a user
3. Make team selections
4. Check if the leaderboard loads

## Step 5: Custom Domain (Optional)

### For Netlify:
1. In Netlify dashboard, go to "Domain settings"
2. Add your custom domain
3. Follow DNS configuration instructions

### For Railway:
1. In Railway dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Backend Issues:
- Check Railway logs in the dashboard
- Verify environment variables are set correctly
- Ensure database directory has write permissions

### Frontend Issues:
- Verify `REACT_APP_API_URL` environment variable
- Check browser console for CORS errors
- Test API endpoints directly

### Database Issues:
- SQLite file permissions in Railway
- Check if database directory exists
- Verify schema and seed data loaded correctly

## Updating Your App

### Backend Updates:
1. Push changes to GitHub
2. Railway auto-deploys from main branch

### Frontend Updates:
1. Push changes to GitHub
2. Netlify auto-deploys from main branch
3. Or manually deploy by dragging new build folder

## Cost Estimates

- **Railway**: Free tier includes 500 hours/month (enough for this app)
- **Netlify**: Free tier includes 100GB bandwidth/month
- **Total**: $0/month for small usage

## Environment Variables Reference

### Backend (.env):
```
NODE_ENV=production
PORT=3001
DATABASE_PATH=/app/data/fantasy_football.db
FRONTEND_URL=https://your-netlify-site.netlify.app
TZ=America/New_York
```

### Frontend (.env.production):
```
REACT_APP_API_URL=https://your-railway-backend.railway.app/api
```

## Security Notes

- Environment variables are automatically secured in Railway/Netlify
- Database is not publicly accessible
- CORS is configured to only allow your frontend domain
- HTTPS is enforced on both platforms

Your Fantasy Football app is now live and ready for users! 🏈
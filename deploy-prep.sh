#!/bin/bash

# Fantasy Football App - Deployment Preparation Script

echo "🏈 Fantasy Football App - Deployment Prep"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
echo "✅ Backend dependencies installed"

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
echo "✅ Frontend dependencies installed"

cd ..

# Create production environment file examples
echo "🔧 Creating environment file examples..."

if [ ! -f "backend/.env.example" ]; then
    echo "❌ Backend .env.example missing"
else
    echo "✅ Backend .env.example ready"
fi

if [ ! -f "frontend/.env.example" ]; then
    echo "❌ Frontend .env.example missing"
else
    echo "✅ Frontend .env.example ready"
fi

# Test local build
echo "🏗️  Testing production build..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed - check for errors"
    exit 1
fi

cd ..

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository"
echo "2. Push your code: git add . && git commit -m 'Initial commit' && git push"
echo "3. Follow the DEPLOYMENT.md guide"
echo ""
echo "Files ready for deployment:"
echo "├── backend/package.json (with engines)"
echo "├── backend/Dockerfile (optional)"
echo "├── railway.json (Railway config)"
echo "├── frontend/netlify.toml (Netlify config)"
echo "├── .gitignore (security)"
echo "└── DEPLOYMENT.md (full guide)"
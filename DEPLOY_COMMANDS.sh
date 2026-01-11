#!/bin/bash

# 🚀 Region Arbitrator - Vercel Deployment Commands
# Run these commands in order to deploy to Vercel

echo "🏟️ Region Arbitrator - Vercel Deployment"
echo "=========================================="
echo ""

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm 8+"
    exit 1
fi
echo "✅ npm: $(npm --version)"

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git"
    exit 1
fi
echo "✅ Git: $(git --version)"

echo ""

# Step 2: Install dependencies
echo "Step 2: Installing dependencies..."
echo ""

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

cd dashboard
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dashboard dependencies"
    exit 1
fi
echo "✅ Dashboard dependencies installed"

cd ..
echo ""

# Step 3: Type check
echo "Step 3: Running type checks..."
echo ""

npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Fix them before deploying."
    exit 1
fi
echo "✅ No TypeScript errors"

echo ""

# Step 4: Build test
echo "Step 4: Testing build..."
echo ""

cd dashboard
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi
echo "✅ Build successful"

cd ..
echo ""

# Step 5: Git commit
echo "Step 5: Committing changes to Git..."
echo ""

git add .
git commit -m "🚀 Region Arbitrator ready for Vercel deployment"
if [ $? -ne 0 ]; then
    echo "⚠️  No changes to commit (or commit failed)"
fi

echo ""

# Step 6: Git push
echo "Step 6: Pushing to GitHub..."
echo ""

git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub. Check your connection and permissions."
    exit 1
fi
echo "✅ Pushed to GitHub"

echo ""

# Step 7: Vercel deployment
echo "Step 7: Deploying to Vercel..."
echo ""

if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

cd dashboard
vercel
cd ..

echo ""
echo "=========================================="
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Follow the Vercel prompts"
echo "2. Your dashboard will be live at: https://your-project-name.vercel.app"
echo "3. Share the URL with others!"
echo ""
echo "The Referee is ready to serve! 🏟️"

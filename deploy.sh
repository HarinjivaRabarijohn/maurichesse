#!/bin/bash
# MauRichesse Quick Deploy Script

echo "🚀 MauRichesse Deployment Setup"
echo "================================"

# Step 1: Git init
echo ""
echo "📦 Initializing Git repository..."
git init
git add .
git commit -m "MauRichesse - Ready for deployment"
git branch -M main

# Step 2: Add remote
echo ""
echo "📡 Setting up GitHub remote..."
echo "Go to github.com and create a new repo named 'maurichesse'"
echo "Then paste the URL below:"
read -p "Enter your GitHub repo URL: " github_url
git remote add origin "$github_url"
git push -u origin main

# Step 3: Instructions
echo ""
echo "✅ Git setup complete!"
echo ""
echo "NEXT STEPS:"
echo "==========="
echo "1. Go to render.com and create:"
echo "   - MySQL database (save credentials)"
echo "   - Web Service (backend) - set env variables"
echo ""
echo "2. Update frontend/config.js with Render backend URL"
echo ""
echo "3. Go to netlify.com and deploy frontend folder"
echo ""
echo "4. Test everything at https://YOUR_NETLIFY_URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed steps"

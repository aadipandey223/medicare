#!/bin/bash

# Medicare Platform - Quick Deployment Script
# This script helps deploy to various platforms

echo "=================================================="
echo "🏥 Medicare Platform - Deployment Helper"
echo "=================================================="
echo ""
echo "Select deployment platform:"
echo "1. Vercel (Full-stack - Recommended)"
echo "2. Render (Backend + Frontend)"
echo "3. Heroku (Full-stack)"
echo "4. Railway (Full-stack)"
echo "5. Check deployment readiness"
echo "6. Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Deploying to Vercel..."
    echo ""
    echo "Prerequisites:"
    echo "- npm install -g vercel"
    echo "- vercel login"
    echo ""
    read -p "Have you completed prerequisites? (y/n): " ready
    if [ "$ready" = "y" ]; then
      npm run build
      vercel --prod
      echo ""
      echo "✅ Deployment initiated!"
      echo "🔧 Don't forget to set environment variables in Vercel dashboard"
    fi
    ;;
    
  2)
    echo ""
    echo "🚀 Deploying to Render..."
    echo ""
    echo "Steps:"
    echo "1. Go to https://render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Create Web Service (Backend):"
    echo "   - Build: pip install -r requirements.txt"
    echo "   - Start: gunicorn app:app"
    echo "4. Create Static Site (Frontend):"
    echo "   - Build: npm install && npm run build"
    echo "   - Publish: dist"
    echo "5. Set environment variables"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
    ;;
    
  3)
    echo ""
    echo "🚀 Deploying to Heroku..."
    echo ""
    read -p "Enter app name: " appname
    
    if [ -z "$appname" ]; then
      appname="medicare-app"
    fi
    
    echo "Creating Heroku app: $appname"
    heroku create $appname
    
    echo "Adding PostgreSQL..."
    heroku addons:create heroku-postgresql:mini
    
    echo ""
    echo "⚠️  Set environment variables:"
    echo "heroku config:set GEMINI_API_KEY=your-key"
    echo "heroku config:set JWT_SECRET=\$(python -c 'import secrets; print(secrets.token_hex(32))')"
    echo "heroku config:set SECRET_KEY=\$(python -c 'import secrets; print(secrets.token_hex(32))')"
    echo ""
    read -p "Ready to deploy? (y/n): " deploy
    
    if [ "$deploy" = "y" ]; then
      git push heroku main
      heroku open
    fi
    ;;
    
  4)
    echo ""
    echo "🚀 Deploying to Railway..."
    echo ""
    echo "Steps:"
    echo "1. Go to https://railway.app"
    echo "2. Click 'New Project'"
    echo "3. Select 'Deploy from GitHub'"
    echo "4. Choose medicare repository"
    echo "5. Add PostgreSQL database"
    echo "6. Set environment variables"
    echo "7. Deploy!"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
    ;;
    
  5)
    echo ""
    echo "🔍 Checking deployment readiness..."
    python check_deployment.py
    ;;
    
  6)
    echo "Goodbye!"
    exit 0
    ;;
    
  *)
    echo "Invalid choice. Please run again."
    exit 1
    ;;
esac

echo ""
echo "=================================================="
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo "=================================================="

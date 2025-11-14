# Medicare Platform - Quick Deployment Script (PowerShell)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🏥 Medicare Platform - Deployment Helper" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Select deployment platform:" -ForegroundColor Yellow
Write-Host "1. Vercel (Full-stack - Recommended)"
Write-Host "2. Render (Backend + Frontend)"
Write-Host "3. Heroku (Full-stack)"
Write-Host "4. Railway (Full-stack)"
Write-Host "5. Check deployment readiness"
Write-Host "6. Build frontend for production"
Write-Host "7. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-7)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Prerequisites:" -ForegroundColor Yellow
        Write-Host "- npm install -g vercel"
        Write-Host "- vercel login"
        Write-Host ""
        
        $ready = Read-Host "Have you completed prerequisites? (y/n)"
        if ($ready -eq "y") {
            Write-Host "Building frontend..." -ForegroundColor Cyan
            npm run build
            
            Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
            vercel --prod
            
            Write-Host ""
            Write-Host "✅ Deployment initiated!" -ForegroundColor Green
            Write-Host "🔧 Don't forget to set environment variables in Vercel dashboard" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Required environment variables:" -ForegroundColor Yellow
            Write-Host "- SECRET_KEY"
            Write-Host "- JWT_SECRET"
            Write-Host "- GEMINI_API_KEY"
            Write-Host "- SUPABASE_URL"
            Write-Host "- SUPABASE_SERVICE_KEY"
            Write-Host "- DATABASE_URL"
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Deploying to Render..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Steps:" -ForegroundColor Yellow
        Write-Host "1. Go to https://render.com"
        Write-Host "2. Connect your GitHub repository"
        Write-Host "3. Create Web Service (Backend):"
        Write-Host "   - Build: pip install -r requirements.txt"
        Write-Host "   - Start: gunicorn app:app"
        Write-Host "4. Create Static Site (Frontend):"
        Write-Host "   - Build: npm install && npm run build"
        Write-Host "   - Publish: dist"
        Write-Host "5. Set environment variables"
        Write-Host ""
        Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
        
        Start-Process "https://render.com"
    }
    
    "3" {
        Write-Host ""
        Write-Host "🚀 Deploying to Heroku..." -ForegroundColor Green
        Write-Host ""
        
        $appname = Read-Host "Enter app name (press Enter for 'medicare-app')"
        if ([string]::IsNullOrWhiteSpace($appname)) {
            $appname = "medicare-app"
        }
        
        Write-Host "Creating Heroku app: $appname" -ForegroundColor Cyan
        heroku create $appname
        
        Write-Host "Adding PostgreSQL..." -ForegroundColor Cyan
        heroku addons:create heroku-postgresql:mini
        
        Write-Host ""
        Write-Host "⚠️  Set environment variables:" -ForegroundColor Yellow
        Write-Host "heroku config:set GEMINI_API_KEY=your-key"
        Write-Host "heroku config:set JWT_SECRET=`$(python -c 'import secrets; print(secrets.token_hex(32))')"
        Write-Host "heroku config:set SECRET_KEY=`$(python -c 'import secrets; print(secrets.token_hex(32))')"
        Write-Host ""
        
        $deploy = Read-Host "Ready to deploy? (y/n)"
        if ($deploy -eq "y") {
            Write-Host "Deploying to Heroku..." -ForegroundColor Cyan
            git push heroku main
            heroku open
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "🚀 Deploying to Railway..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Steps:" -ForegroundColor Yellow
        Write-Host "1. Go to https://railway.app"
        Write-Host "2. Click 'New Project'"
        Write-Host "3. Select 'Deploy from GitHub'"
        Write-Host "4. Choose medicare repository"
        Write-Host "5. Add PostgreSQL database"
        Write-Host "6. Set environment variables"
        Write-Host "7. Deploy!"
        Write-Host ""
        Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
        
        Start-Process "https://railway.app"
    }
    
    "5" {
        Write-Host ""
        Write-Host "🔍 Checking deployment readiness..." -ForegroundColor Cyan
        python check_deployment.py
    }
    
    "6" {
        Write-Host ""
        Write-Host "🔨 Building frontend for production..." -ForegroundColor Cyan
        Write-Host ""
        
        if (Test-Path "node_modules") {
            npm run build
            Write-Host ""
            Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
            Write-Host "📁 Output: dist/" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
            npm install
            npm run build
            Write-Host ""
            Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
        }
    }
    
    "7" {
        Write-Host "Goodbye!" -ForegroundColor Green
        exit 0
    }
    
    default {
        Write-Host "Invalid choice. Please run again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📖 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

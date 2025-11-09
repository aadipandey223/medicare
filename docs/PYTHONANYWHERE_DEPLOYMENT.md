# 🚀 PythonAnywhere + Vercel Deployment Guide

## Overview
- **Frontend**: Vercel (React)
- **Backend**: PythonAnywhere (Flask)
- **Backend URL**: `https://aadipandey2121.pythonanywhere.com`

## Backend Setup (PythonAnywhere)

### 1. Upload Files
Upload these files to PythonAnywhere:
- `app.py`
- `requirements.txt`
- `.env` (or set environment variables in dashboard)

### 2. Install Dependencies
In PythonAnywhere Bash console:
```bash
pip3.10 install --user -r requirements.txt
```

### 3. Set Environment Variables
In PythonAnywhere dashboard → **Web** tab → **Environment variables**:
```
FLASK_ENV=production
JWT_SECRET=your-secret-key-here
DATABASE_URL=sqlite:///medicare.db
SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 4. Configure WSGI File
In PythonAnywhere dashboard → **Web** tab → **WSGI configuration file**:
```python
import sys
import os

# Add your project directory to path
path = '/home/yourusername/path/to/medicare'
if path not in sys.path:
    sys.path.insert(0, path)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import Flask app
from app import app as application

if __name__ == "__main__":
    application.run()
```

### 5. Reload Web App
Click **Reload** button in PythonAnywhere dashboard.

## Frontend Setup (Vercel)

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Vite/React

### 2. Set Environment Variables
In Vercel dashboard → **Settings** → **Environment Variables**:
```
VITE_API_URL=https://aadipandey2121.pythonanywhere.com/api
VITE_SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Deploy
- Push to GitHub → Vercel auto-deploys
- Or click **Deploy** in Vercel dashboard

## CORS Configuration

The backend (`app.py`) is already configured to:
- Allow Vercel domains (`*.vercel.app`)
- Allow your custom domain (if set via `FRONTEND_URL`)
- Allow localhost for development

## Testing

### Test Backend
```bash
curl https://aadipandey2121.pythonanywhere.com/api/health
```

### Test Frontend
Visit your Vercel URL and check browser console for API calls.

## Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` is set correctly in PythonAnywhere
- Verify backend allows your Vercel domain
- Check browser console for exact error

### API Not Working
- Verify `VITE_API_URL` in Vercel matches your PythonAnywhere URL
- Check PythonAnywhere error logs
- Ensure backend is reloaded after changes

### Database Issues
- PythonAnywhere uses SQLite by default
- Database file location: `/home/yourusername/medicare.db`
- For PostgreSQL, update `DATABASE_URL` in environment variables

## Important Notes

1. **PythonAnywhere Free Tier**:
   - Web app must be accessed at least once every 3 months
   - Limited to 1 web app
   - No custom domains on free tier

2. **Vercel Free Tier**:
   - Unlimited deployments
   - Custom domains supported
   - Auto HTTPS

3. **Environment Variables**:
   - Never commit `.env` files
   - Set in hosting dashboards
   - Restart app after changing env vars


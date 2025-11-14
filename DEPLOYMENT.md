# 🚀 Medicare Platform - Complete Deployment Guide

This guide covers deploying the Medicare healthcare platform to various hosting providers.

## 📋 Prerequisites

Before deployment, ensure you have:

1. ✅ GitHub account with your code pushed
2. ✅ Google Gemini API key ([Get here](https://makersuite.google.com/app/apikey))
3. ✅ Supabase account for file storage ([supabase.com](https://supabase.com))
4. ✅ All environment variables ready (see `.env` file)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Full Stack)

**Pros:** Automatic deployments, serverless, free tier, built-in CDN

**Steps:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **medicare**
   - Directory? **./  (current directory)**
   - Override settings? **No**

5. **Set Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add these variables:
     ```
     SECRET_KEY=<generate-random-string>
     JWT_SECRET=<generate-random-string>
     GEMINI_API_KEY=<your-gemini-key>
     SUPABASE_URL=<your-supabase-url>
     SUPABASE_SERVICE_KEY=<your-service-key>
     DATABASE_URL=<your-database-url>
     GOOGLE_CLIENT_ID=<your-google-oauth-id>
     ```

6. **Deploy to Production:**
```bash
vercel --prod
```

Your app will be live at: `https://medicare-<random>.vercel.app`

---

### Option 2: Render (Backend) + Netlify (Frontend)

**Pros:** Separate frontend/backend, free tier, automatic SSL

#### Backend on Render:

1. **Create Render Account:** [render.com](https://render.com)

2. **New Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select `medicare` repo

3. **Configure Service:**
   - Name: `medicare-backend`
   - Environment: `Python 3.11`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2`

4. **Environment Variables:**
   Add in Render dashboard:
   ```
   SECRET_KEY=<random-string>
   JWT_SECRET=<random-string>
   GEMINI_API_KEY=<your-key>
   SUPABASE_URL=<your-url>
   SUPABASE_SERVICE_KEY=<your-key>
   DATABASE_URL=<postgres-url>
   FLASK_ENV=production
   ```

5. **Add PostgreSQL:**
   - In Render dashboard, create new PostgreSQL database
   - Copy connection URL to `DATABASE_URL` env variable

6. **Deploy:**
   - Render will auto-deploy from GitHub
   - Backend URL: `https://medicare-backend.onrender.com`

#### Frontend on Netlify:

1. **Build Frontend:**
```bash
npm run build
```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop `dist` folder
   - Or connect GitHub repo

3. **Environment Variables:**
   ```
   VITE_API_URL=https://medicare-backend.onrender.com
   ```

4. **Configure Redirects:**
   Create `public/_redirects`:
   ```
   /api/*  https://medicare-backend.onrender.com/api/:splat  200
   /*      /index.html                                         200
   ```

---

### Option 3: Heroku (Full Stack)

**Pros:** Easy setup, managed PostgreSQL, free tier (with credit card)

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login:**
```bash
heroku login
```

3. **Create App:**
```bash
heroku create medicare-healthcare
```

4. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:mini
```

5. **Set Environment Variables:**
```bash
heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
heroku config:set JWT_SECRET=$(python -c 'import secrets; print(secrets.token_hex(32))')
heroku config:set GEMINI_API_KEY=your-key
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_SERVICE_KEY=your-key
heroku config:set FLASK_ENV=production
```

6. **Deploy:**
```bash
git push heroku main
```

7. **Open App:**
```bash
heroku open
```

8. **View Logs:**
```bash
heroku logs --tail
```

---

### Option 4: Railway (Full Stack)

**Pros:** Free tier, automatic deployments, easy setup

1. **Go to:** [railway.app](https://railway.app)

2. **New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose `medicare` repository

3. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will auto-inject `DATABASE_URL`

4. **Environment Variables:**
   Add in Railway dashboard:
   ```
   SECRET_KEY=<random-string>
   JWT_SECRET=<random-string>
   GEMINI_API_KEY=<your-key>
   SUPABASE_URL=<your-url>
   SUPABASE_SERVICE_KEY=<your-key>
   FLASK_ENV=production
   ```

5. **Deploy:**
   - Railway auto-deploys on push
   - Get URL from dashboard

---

### Option 5: GitHub Pages (Frontend Only)

**Pros:** Free, built-in GitHub integration

**Note:** Backend needs separate hosting (use Render/Heroku)

1. **Update package.json:**
```json
{
  "homepage": "https://aadipandey223.github.io/medicare",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

3. **Deploy:**
```bash
npm run deploy
```

4. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source: `gh-pages` branch
   - Save

---

## 🔐 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | Use `secrets.token_hex(32)` |
| `JWT_SECRET` | JWT signing key | Use `secrets.token_hex(32)` |
| `GEMINI_API_KEY` | Google Gemini API | `AIzaSy...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJh...` |
| `DATABASE_URL` | Database connection | `sqlite:///` or `postgresql://` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `FLASK_ENV` | Environment mode | `production` |
| `VITE_API_URL` | Frontend API URL | `https://api.example.com` |

**Generate secure keys:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🗄️ Database Setup

### SQLite (Development/Small Scale)
- Default: `sqlite:///medicare.db`
- File-based, no setup needed
- Good for <10 concurrent users

### PostgreSQL (Production/Scale)
- Recommended for production
- Provided by Render, Heroku, Railway
- Set `DATABASE_URL` to connection string

**Initialize Database:**
```bash
python scripts/init_db.py
python scripts/create_admin.py
```

---

## 🔧 Troubleshooting

### Issue: Import errors after deployment
**Solution:** Ensure all dependencies in `requirements.txt`
```bash
pip freeze > requirements.txt
```

### Issue: CORS errors
**Solution:** Update `CORS_ORIGINS` in app.py with frontend URL

### Issue: Database not found
**Solution:** Run initialization scripts:
```bash
python scripts/init_db.py
```

### Issue: 502 Bad Gateway
**Solution:** Check logs, ensure gunicorn is running:
```bash
gunicorn app:app --bind 0.0.0.0:5000 --workers 2
```

### Issue: Static files not loading
**Solution:** Build frontend and check `dist` folder exists:
```bash
npm run build
```

---

## 📊 Post-Deployment Checklist

- [ ] Backend API accessible at `/api/health`
- [ ] Frontend loads at root URL
- [ ] Admin login works (`admin@gehu.ac.in` / `admin123`)
- [ ] Database tables created
- [ ] File uploads work (Supabase)
- [ ] AI symptom analysis works (Gemini)
- [ ] CORS configured for frontend domain
- [ ] Environment variables set
- [ ] SSL certificate active (HTTPS)
- [ ] Domain configured (optional)

---

## 🔄 Continuous Deployment

### Automatic Deployments:

**Vercel/Netlify:**
- Automatic on git push to main branch

**Render:**
- Enable auto-deploy in dashboard
- Deploys on git push

**Heroku:**
- Enable automatic deployments in dashboard
- Or use `git push heroku main`

### GitHub Actions (Already Configured):
See `.github/workflows/deploy.yml` for automatic Vercel deployment on push.

---

## 🆘 Support

For deployment issues:
1. Check deployment logs in provider dashboard
2. Verify all environment variables are set
3. Test backend API endpoints with Postman
4. Check browser console for frontend errors

---

## 📞 Contact

For help with deployment:
- GitHub Issues: [github.com/aadipandey223/medicare](https://github.com/aadipandey223/medicare)
- Email: [Your Email]

---

## ✅ Success!

Once deployed:
1. Test all features
2. Create test accounts
3. Upload sample documents
4. Try AI symptom analysis
5. Share your deployed URL! 🎉

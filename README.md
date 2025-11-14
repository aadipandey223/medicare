# 🏥 Medicare Platform

A comprehensive healthcare platform connecting patients with doctors, featuring real-time consultations, document management, and AI-powered health insights.

## ✨ Features

- 🔐 **Authentication** - Email/Password + Google OAuth
- 👥 **Multi-Role System** - Patient, Doctor, and Admin dashboards
- 💬 **Real-time Consultations** - Live chat between patients and doctors
- 📄 **Document Management** - Secure file uploads with cloud storage
- ⭐ **Rating System** - Patient feedback and doctor ratings
- 🔔 **Notifications** - Real-time updates for consultations and messages
- 🎨 **Modern UI** - Material-UI with dark mode support
- 🤖 **AI Health Analysis** - Symptom analysis and health recommendations

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for development)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd medicare
```

2. **Backend Setup**
```bash
pip install -r requirements.txt
python scripts/create_admin.py  # Create admin user (optional)
python app.py  # Start backend server (runs on http://localhost:5000)
```

3. **Frontend Setup**
```bash
npm install
npm run dev  # Start development server (runs on http://localhost:3000)
```

## 📁 Project Structure

```
medicare/
├── app.py              # Flask backend application
├── requirements.txt    # Python dependencies
├── src/                # React frontend application
│   ├── api/           # API client functions
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   └── services/      # External services
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── package.json       # Node.js dependencies
```

## 🔧 Environment Variables

### Backend (.env)
```
FLASK_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL=sqlite:///medicare.db
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Material-UI
- **Backend**: Flask + SQLAlchemy + JWT
- **Database**: SQLite / PostgreSQL
- **Storage**: Supabase Storage
- **Auth**: Google OAuth + Email/Password

## 🚀 Deployment

The project is ready for deployment on multiple platforms:

### Deploy to Vercel (Recommended for Full-Stack)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Set Environment Variables in Vercel Dashboard:**
```
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-key
DATABASE_URL=your-database-url
```

### Deploy to Render

1. **Connect GitHub Repository:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Select the medicare repository

2. **Backend Service:**
   - Click "New +" → "Web Service"
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - Environment: Python 3.11

3. **Frontend Service:**
   - Click "New +" → "Static Site"
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Set Environment Variables:**
   - Add all required variables from `.env` file

### Deploy to Heroku

1. **Install Heroku CLI and Login:**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku App:**
```bash
heroku create medicare-app
```

3. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables:**
```bash
heroku config:set GEMINI_API_KEY=your-key
heroku config:set JWT_SECRET=your-secret
heroku config:set SECRET_KEY=your-secret
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_SERVICE_KEY=your-key
```

5. **Deploy:**
```bash
git push heroku main
heroku open
```

### Deploy Frontend to Netlify

1. **Build the frontend:**
```bash
npm run build
```

2. **Deploy:**
   - Drag and drop `dist` folder to [netlify.com](https://netlify.com)
   - Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

3. **Set Environment Variables:**
   - Add `VITE_API_URL` pointing to your backend

### GitHub Pages (Frontend Only)

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Update package.json:**
```json
{
  "homepage": "https://aadipandey223.github.io/medicare",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Deploy:**
```bash
npm run deploy
```

## 📝 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

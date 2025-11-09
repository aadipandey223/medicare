# 🏥 Medicare Platform

A comprehensive healthcare platform connecting patients with doctors, featuring real-time consultations, document management, and AI-powered health insights.

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
python scripts/create_admin.py  # Create admin user
python app.py  # Start backend server
```

3. **Frontend Setup**
```bash
npm install
npm run dev  # Start development server
```

## 📁 Project Structure

```
medicare/
├── backend/              # Backend files
│   ├── app.py           # Main Flask application
│   ├── requirements.txt # Python dependencies
│   ├── Procfile         # Production server config
│   └── render.yaml      # Render deployment config
├── src/                 # Frontend React application
│   ├── api/            # API client functions
│   ├── components/     # Reusable components
│   ├── context/        # React contexts
│   ├── pages/          # Page components
│   ├── services/       # External services
│   └── utils/          # Utility functions
├── docs/               # Documentation
├── scripts/            # Utility scripts
├── package.json        # Node.js dependencies
├── vite.config.js      # Vite configuration
└── vercel.json         # Vercel deployment config
```

## 🎯 Features

- ✅ User Authentication (Email/Password + Google OAuth)
- ✅ Patient Dashboard
- ✅ Doctor Dashboard
- ✅ Admin Portal
- ✅ Real-time Consultation Chat
- ✅ Document Upload & Management
- ✅ Rating & Feedback System
- ✅ Profile Viewing
- ✅ Notification System
- ✅ Password Reset (Admin-managed)

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deploy to production
- [Production Readiness](PRODUCTION_READINESS_CHECKLIST.md) - Pre-deployment checklist
- [Quick Deploy](QUICK_DEPLOY.md) - 5-minute deployment guide

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

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Configure environment variables

## 📝 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


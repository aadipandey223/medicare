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

The project is configured for deployment on:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: PostgreSQL

See `docs/` folder for detailed deployment guides.

## 📝 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

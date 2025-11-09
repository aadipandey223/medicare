# 📁 Project Structure

## Clean & Organized Structure

```
medicare/
├── 📄 README.md                    # Main project documentation
├── 📄 DEPLOYMENT_GUIDE.md          # Deployment instructions
├── 📄 PRODUCTION_READINESS_CHECKLIST.md
├── 📄 QUICK_DEPLOY.md
│
├── 🔧 Configuration Files
│   ├── package.json                # Node.js dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── vercel.json                 # Vercel deployment
│   ├── requirements.txt            # Python dependencies
│   ├── Procfile                    # Production server
│   ├── render.yaml                 # Render deployment
│   ├── .gitignore                  # Git ignore rules
│   └── index.html                  # HTML entry point
│
├── 🐍 Backend (Flask)
│   └── app.py                      # Main Flask application
│
├── ⚛️ Frontend (React)
│   └── src/
│       ├── App.jsx                 # Main app component
│       ├── main.jsx                # Entry point
│       ├── index.css               # Global styles
│       │
│       ├── api/                    # API clients
│       │   ├── admin.js
│       │   ├── api.js
│       │   ├── auth.js
│       │   ├── documents.js
│       │   └── notifications.js
│       │
│       ├── components/             # Reusable components
│       │   ├── AdminNavigation.jsx
│       │   ├── BackButton.jsx
│       │   ├── DoctorNavigation.jsx
│       │   ├── GoldDustCursor.jsx
│       │   ├── MedicalLogo.jsx
│       │   └── Navigation.jsx
│       │
│       ├── context/                # React contexts
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       │
│       ├── pages/                  # Page components
│       │   ├── admin/              # Admin pages
│       │   ├── doctor/             # Doctor pages
│       │   ├── Auth.jsx
│       │   ├── Consult.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Doctors.jsx
│       │   ├── DoctorProfile.jsx
│       │   ├── History.jsx
│       │   ├── LLMAnalysis.jsx
│       │   ├── Notifications.jsx
│       │   ├── Settings.jsx
│       │   └── Upload.jsx
│       │
│       ├── services/               # External services
│       │   └── supabaseStorage.js
│       │
│       └── utils/                  # Utility functions
│           └── debounce.js
│
├── 📚 docs/                        # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── PRODUCTION_READINESS_CHECKLIST.md
│   ├── QUICK_DEPLOY.md
│   └── archive/                    # Old/duplicate files
│
└── 🛠️ scripts/                     # Utility scripts
    ├── create_admin.py             # Create admin user
    ├── generate_secret_key.py      # Generate JWT secret
    ├── init_db.py                  # Initialize database
    ├── reset_db.py                 # Reset database
    ├── test_api.py                 # API testing
    ├── start_backend.bat           # Windows backend start
    ├── start_backend.ps1           # PowerShell backend start
    ├── start_frontend.bat          # Windows frontend start
    └── start_frontend.ps1          # PowerShell frontend start
```

## 🗑️ Files Removed

- ✅ `aaa.jsx` - Test file
- ✅ `w.txt`, `r.txt`, `ui.txt` - Temporary files
- ✅ `patient_db.sql` - Old SQL file
- ✅ Duplicate Python files moved to `docs/archive/`

## ✅ Everything Works

- ✅ Backend imports correctly
- ✅ Frontend structure intact
- ✅ All dependencies in place
- ✅ Deployment files ready
- ✅ Clean root directory


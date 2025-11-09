# 🏥 Medicare Patient Portal - Quick Start

## 🎯 What We Built

A **modern, beautiful React + Flask application** with:
- ✅ **Full Google OAuth Authentication**
- ✅ **Email/Password Login & Registration**
- ✅ **JWT Token-based Security**
- ✅ **Beautiful Material-UI Interface**
- ✅ **8 Complete Pages** (Dashboard, Upload, Doctors, Consult, LLM Analysis, History, Notifications)
- ✅ **Protected Routes**
- ✅ **User Profile Management**

---

## ⚡ Quick Start (3 Steps)

### **Step 1: Get Google OAuth Credentials**

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **+ CREATE CREDENTIALS → OAuth client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
6. **Copy your Client ID** (looks like: xxxxx.apps.googleusercontent.com)

### **Step 2: Configure Environment**

Edit **TWO .env files** and add your Google Client ID:

**File 1: `.env` (Backend)**
```bash
SECRET_KEY=5f1c30c90238bda19ce89f81ab56c243cdd8cd4903e374dc3d4efaeec2d2f9d2
DATABASE_URL=sqlite:///medicare.db
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE  # ← Replace this
PORT=5000
FLASK_ENV=development
```

**File 2: `.env.local` (Frontend)**
```bash
VITE_GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE  # ← Replace this
VITE_API_URL=http://localhost:5000
```

### **Step 3: Run the App**

Open **TWO terminals**:

**Terminal 1 - Backend:**
```powershell
python app_auth.py
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

Then open: **http://localhost:5173**

---

## 🎨 What You'll See

### **Login Page**
- Beautiful gradient design
- Email/Password login
- **Google OAuth button** (one-click sign-in)
- Tab to switch to registration

### **Dashboard**
- Medical overview cards
- Recent activity
- Quick actions

### **All Pages**
- 📊 Dashboard - Health overview
- 📤 Upload - Medical records upload
- 👨‍⚕️ Doctors - Find and book doctors
- 💬 Consult - Online consultations
- 🧠 LLM Analysis - AI health analysis
- 📈 History - Medical history timeline
- 🔔 Notifications - Alerts and updates

---

## 🔐 Authentication Features

### **Email/Password Authentication**
- Secure bcrypt password hashing
- JWT token-based sessions
- Auto-login after registration

### **Google OAuth**
- One-click sign-in
- Auto-creates user account
- No password needed

### **Security**
- All passwords hashed (never stored in plain text)
- JWT tokens expire in 7 days
- Protected routes require authentication
- Secure token storage in localStorage

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ React 18.2
- 🎨 Material-UI 5.14
- 🚀 Vite 5.0
- 🛣️ React Router 6.20
- 🔐 @react-oauth/google

### **Backend**
- 🐍 Python 3.12
- 🌶️ Flask 3.0
- 🗄️ SQLAlchemy 2.0
- 🔒 PyJWT + bcrypt
- 🔑 Google OAuth 2.0

---

## 📖 Detailed Setup Guide

For complete step-by-step instructions, see:
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Full detailed guide with screenshots and troubleshooting

---

## 🐛 Troubleshooting

### "Google OAuth not working"
✅ Check that Client ID is correct in **both** .env files  
✅ Verify authorized origins include `http://localhost:5173`  
✅ Make sure both backend and frontend are running  

### "CORS Error"
✅ Backend should be running on port 5000  
✅ Frontend should be running on port 5173  
✅ Check VITE_API_URL is `http://localhost:5000`  

### "Module not found"
**Backend:**
```powershell
pip install -r requirements.txt
```

**Frontend:**
```powershell
npm install
```

---

## 📁 Project Structure

```
medicare/
├── Backend (Flask)
│   ├── app_auth.py          # Authentication API
│   ├── requirements.txt     # Python packages
│   ├── .env                # Backend config (SECRET_KEY, GOOGLE_CLIENT_ID)
│   └── medicare.db         # SQLite database (auto-created)
│
├── Frontend (React)
│   ├── src/
│   │   ├── api/auth.js            # API calls
│   │   ├── context/AuthContext.jsx # Auth state
│   │   ├── pages/Auth.jsx         # Login/Register
│   │   └── App.jsx                # Main app
│   ├── .env.local          # Frontend config (VITE_GOOGLE_CLIENT_ID)
│   └── package.json        # Node packages
│
└── Documentation
    ├── README_QUICKSTART.md  # This file
    └── SETUP_GUIDE.md        # Detailed guide
```

---

## 🎯 Testing the App

### **1. Test Email Registration**
- Go to http://localhost:5173
- Click "Register" tab
- Fill in:
  - Name: Test User
  - Email: test@example.com
  - Password: Test123!
- Click "Create Account"
- ✅ Should redirect to Dashboard

### **2. Test Email Login**
- Logout (sidebar)
- Click "Login" tab
- Enter: test@example.com / Test123!
- ✅ Should redirect to Dashboard

### **3. Test Google OAuth**
- Logout
- Click "Continue with Google"
- Select your Google account
- ✅ Should redirect to Dashboard
- ✅ Check sidebar - shows your Google name/email

---

## 🚀 Next Steps

After authentication works:

1. **Connect other pages to backend APIs**
   - Medical record uploads
   - Doctor consultations
   - LLM health analysis

2. **Add more features**
   - Password reset
   - Email verification
   - Profile picture upload
   - Two-factor authentication

3. **Deploy to production**
   - Use PostgreSQL instead of SQLite
   - Deploy backend to Railway/Render
   - Deploy frontend to Vercel/Netlify
   - Enable HTTPS

---

## 💡 Quick Commands

```powershell
# Generate new SECRET_KEY
python generate_secret_key.py

# Install Python packages
pip install -r requirements.txt

# Run backend
python app_auth.py

# Install Node packages
npm install

# Run frontend (dev)
npm run dev

# Build frontend (production)
npm run build
```

---

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Read the full **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
3. Verify all environment variables are set correctly
4. Make sure both backend and frontend are running

---

**🎉 Enjoy your fully functional Medicare Patient Portal with Google OAuth!**

# 🏥 Medicare Patient Portal - Full Authentication Setup Guide

## 🚀 Complete Setup Instructions

### **Part 1: Google OAuth Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or use existing)
   - Click "Select a project" → "New Project"
   - Name: "Medicare Patient Portal"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click and Enable it

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: Medicare Patient Portal
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
     - Click "Save and Continue" through the steps
   
5. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "Medicare Web Client"
   - Authorized JavaScript origins:
     - http://localhost:5173
     - http://localhost:3000
   - Authorized redirect URIs:
     - http://localhost:5173
     - http://localhost:5173/auth
   - Click "CREATE"
   
6. **Copy Your Client ID**
   - You'll see a popup with your Client ID and Client Secret
   - **COPY THE CLIENT ID** (looks like: xxxxx.apps.googleusercontent.com)

---

### **Part 2: Backend Setup (Python/Flask)**

1. **Install Python Dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

2. **Create Environment File**
   - Copy the `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Edit .env File**
   - Open `.env` in VS Code
   - Add a strong SECRET_KEY:
   ```
   SECRET_KEY=your-super-secret-key-change-this-in-production
   DATABASE_URL=sqlite:///medicare.db
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP_6
   PORT=5000
   FLASK_ENV=development
   ```

4. **Initialize Database**
   ```powershell
   python app_auth.py
   ```
   - The database will be created automatically on first run
   - Press Ctrl+C to stop after it says "Running on http://127.0.0.1:5000"

---

### **Part 3: Frontend Setup (React/Vite)**

1. **Update .env File**
   - Open `.env` in the root directory
   - Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   VITE_API_URL=http://localhost:5000
   ```

2. **Install Frontend Dependencies** (if not done)
   ```powershell
   npm install
   ```

---

### **Part 4: Running the Application**

You need **TWO terminals** running simultaneously:

#### **Terminal 1 - Backend (Flask)**
```powershell
python app_auth.py
```
Expected output:
```
 * Running on http://127.0.0.1:5000
```

#### **Terminal 2 - Frontend (React)**
```powershell
npm run dev
```
Expected output:
```
  ➜  Local:   http://localhost:5173/
```

---

### **Part 5: Test the Application**

1. **Open Browser**
   - Go to: http://localhost:5173

2. **Test Registration**
   - Click "Register" tab
   - Fill in:
     - Full Name: Test User
     - Email: test@example.com
     - Password: Test123!
     - (Optional) Age, Gender, Medical History
   - Click "Create Account"
   - Should redirect to Dashboard

3. **Test Login**
   - Logout from the sidebar
   - Click "Login" tab
   - Enter credentials:
     - Email: test@example.com
     - Password: Test123!
   - Click "Login"
   - Should redirect to Dashboard

4. **Test Google OAuth**
   - Click "Continue with Google" button
   - Select your Google account
   - Should redirect to Dashboard
   - Check Navigation - should show your Google name/email

---

## 🔧 Troubleshooting

### **"Google OAuth not working"**
- ✅ Verify Client ID is correct in `.env`
- ✅ Check authorized origins include `http://localhost:5173`
- ✅ Make sure both frontend and backend are running
- ✅ Clear browser cache and try again

### **"CORS Error"**
- ✅ Backend should have CORS enabled (already configured in app_auth.py)
- ✅ Make sure backend is running on port 5000
- ✅ Check that VITE_API_URL in .env is `http://localhost:5000`

### **"JWT Token Invalid"**
- ✅ Make sure SECRET_KEY is set in backend .env
- ✅ Try clearing localStorage and logging in again
- ✅ Restart the backend server

### **"Import Error: No module named..."**
- ✅ Run `pip install -r requirements.txt`
- ✅ Make sure you're in the correct directory
- ✅ Check Python version (should be 3.8+)

---

## 📁 File Structure

```
medicare/
├── backend (Flask)
│   ├── app_auth.py          # Main backend with authentication
│   ├── requirements.txt     # Python dependencies
│   ├── .env                # Backend environment variables
│   └── medicare.db         # SQLite database (auto-created)
│
├── frontend (React)
│   ├── src/
│   │   ├── api/
│   │   │   └── auth.js     # API calls to backend
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── pages/
│   │   │   └── Auth.jsx    # Login/Register with Google OAuth
│   │   ├── components/
│   │   │   └── Navigation.jsx   # Sidebar with user info
│   │   └── App.jsx         # Main app with AuthProvider
│   ├── .env                # Frontend environment variables
│   └── package.json        # Node dependencies
```

---

## 🎉 Features Implemented

✅ **Email/Password Registration**
- Password hashing with bcrypt
- Automatic JWT token generation
- User profile creation

✅ **Email/Password Login**
- Secure authentication
- JWT token-based sessions
- Auto-redirect to dashboard

✅ **Google OAuth Authentication**
- One-click sign-in with Google
- Auto-creates user account
- Extracts name/email from Google

✅ **Protected Routes**
- JWT verification on all protected endpoints
- Auto-redirect to login if not authenticated
- Token stored in localStorage

✅ **User Profile Management**
- View current user info
- Update profile (age, gender, medical history)
- Display user info in navigation

✅ **Logout Functionality**
- Clear token from localStorage
- Redirect to login page
- Reset auth state

---

## 🔐 Security Notes

- **Passwords**: Hashed with bcrypt (never stored in plain text)
- **JWT Tokens**: 7-day expiration, can be customized
- **SECRET_KEY**: Change this in production to a strong random value
- **Google OAuth**: Uses official Google OAuth 2.0 library
- **CORS**: Configured for localhost development
- **HTTPS**: For production, use HTTPS for both frontend and backend

---

## 📝 Next Steps

After authentication is working:

1. **Connect other pages to backend**
   - Upload medical records
   - Doctor consultations
   - LLM analysis
   - Medical history

2. **Add more features**
   - Password reset
   - Email verification
   - Two-factor authentication
   - Profile picture upload

3. **Deploy to production**
   - Use environment variables for production
   - Enable HTTPS
   - Use production database (PostgreSQL)
   - Deploy frontend to Vercel/Netlify
   - Deploy backend to Heroku/Railway

---

## 💡 Quick Commands Reference

```powershell
# Install Python packages
pip install -r requirements.txt

# Run backend
python app_auth.py

# Install Node packages
npm install

# Run frontend
npm run dev

# Build for production
npm run build
```

---

**🎯 You're all set! Follow the steps above and you'll have a fully functional authentication system with Google OAuth.**

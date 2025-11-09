# 🔧 Google OAuth & Database Setup Guide

## 🔐 Google OAuth Fix

### **Problem**: Google OAuth not working - getting 404 errors

### **Solution Steps**:

**Step 1: Get Your Google Client ID**

1. Go to: https://console.cloud.google.com/
2. If you don't have a project, create one:
   - Click "Select a Project" (top left)
   - Click "NEW PROJECT"
   - Name: "Medicare Patient Portal"
   - Click "CREATE"
3. Wait for project to be created (2-3 minutes)
4. Go to **APIs & Services** → **Library**
5. Search for "Google+ API"
6. Click on it and press **ENABLE**

**Step 2: Create OAuth Credentials**

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → Select **OAuth client ID**
3. If asked to configure OAuth consent screen:
   - Choose **External** user type
   - Fill in:
     - App name: Medicare Patient Portal
     - User support email: aadipandey223@gmail.com
     - Developer contact: aadipandey223@gmail.com
   - Click **SAVE AND CONTINUE**
   - On Scopes: Just click **SAVE AND CONTINUE**
   - On Summary: Click **BACK TO DASHBOARD**

4. Click **+ CREATE CREDENTIALS** → **OAuth client ID** again
5. Application type: **Web application**
6. Name: "Medicare Web Client"
7. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   http://localhost:5173
   http://127.0.0.1:3000
   http://127.0.0.1:5173
   ```
8. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000
   http://localhost:3000/auth
   http://localhost:5173
   http://localhost:5173/auth
   ```
9. Click **CREATE**
10. Copy your **Client ID** (it looks like: `123456789.apps.googleusercontent.com`)

**Step 3: Update Your .env Files**

**File 1: `.env.local` (Frontend Configuration)**
```bash
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000
```

**File 2: `.env` (Backend Configuration)**
```bash
SECRET_KEY=5f1c30c90238bda19ce89f81ab56c243cdd8cd4903e374dc3d4efaeec2d2f9d2
DATABASE_URL=sqlite:///medicare.db
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
PORT=5000
FLASK_ENV=development
```

**Step 4: Restart Servers**

Kill both servers (Ctrl+C) and restart:

**Terminal 1 - Backend:**
```powershell
python app_auth.py
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

**Step 5: Test**

1. Open http://localhost:3000
2. Click **Register** tab
3. Click **"Continue with Google"** button
4. Select your Google account
5. Should auto-create account and login

---

## 🗄️ Database Explanation

### **What is the Database?**

The database stores all user information securely. We're using **SQLite** for development (easy to use) and it will be upgraded to PostgreSQL for production.

### **Database File Location**

```
E:\Aadi\medicare\medicare\medicare.db
```

This file is created automatically when you first run the backend.

### **What Data is Stored?**

#### **Users Table**

Stores patient account information:

```sql
users (
  id,                    -- Unique user ID
  email,                 -- User's email (unique)
  password_hash,         -- Encrypted password (NOT plain text)
  name,                  -- Full name
  phone,                 -- Phone number (optional)
  age,                   -- Age (optional)
  gender,                -- Gender (optional)
  medical_history,       -- Medical conditions/history (optional)
  google_id,             -- Google OAuth ID (if signed up with Google)
  is_active,             -- Account status (active/inactive)
  created_at             -- Account creation date
)
```

#### **Example User Data**

```json
{
  "id": 1,
  "email": "john@example.com",
  "password_hash": "$2b$12$encrypted_hash_here",  // Never visible
  "name": "John Doe",
  "phone": "+91 9997181525",
  "age": 28,
  "gender": "Male",
  "medical_history": "Diabetes, Hypertension",
  "google_id": null,
  "is_active": true,
  "created_at": "2025-11-06T18:59:51"
}
```

#### **Example Google OAuth User**

```json
{
  "id": 2,
  "email": "jane@gmail.com",
  "password_hash": null,  // No password for OAuth users
  "name": "Jane Smith",
  "phone": null,
  "age": null,
  "gender": null,
  "medical_history": null,
  "google_id": "1234567890",  // Google's unique ID
  "is_active": true,
  "created_at": "2025-11-06T19:05:30"
}
```

### **Security Features**

✅ **Passwords**: Hashed with bcrypt (one-way encryption)
- Even if database is stolen, passwords cannot be recovered
- Each password has a unique "salt" for extra security

✅ **Google OAuth**: Uses official Google authentication
- No passwords stored for Google accounts
- Google verifies the user

✅ **JWT Tokens**: 7-day session tokens
- Signed with SECRET_KEY
- Can't be forged without the secret

---

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────┐
│           users                      │
├─────────────────────────────────────┤
│ id (PRIMARY KEY)                    │
│ email (UNIQUE)                      │
│ password_hash                       │
│ name                                │
│ phone                               │
│ age                                 │
│ gender                              │
│ medical_history (TEXT)              │
│ google_id (UNIQUE, OPTIONAL)        │
│ is_active (BOOLEAN)                 │
│ created_at (TIMESTAMP)              │
└─────────────────────────────────────┘

(Future tables for medical records, appointments, etc.)
```

---

## 🔄 Data Flow

### **Registration Flow**

```
1. User fills form with email/password/name
2. Frontend sends to backend: POST /api/auth/register
3. Backend:
   - Validates email format
   - Checks if email already exists
   - Hashes password with bcrypt
   - Saves to database (users table)
   - Creates JWT token
4. Frontend stores token in localStorage
5. User redirected to Dashboard
```

### **Google OAuth Flow**

```
1. User clicks "Continue with Google"
2. Google popup appears
3. User selects account
4. Google sends credential to frontend
5. Frontend sends to backend: POST /api/auth/google
6. Backend:
   - Verifies credential with Google
   - Checks if user email already exists
   - If exists: Updates google_id
   - If new: Creates user in database
   - Creates JWT token
7. Frontend stores token
8. User redirected to Dashboard
```

### **Login Flow**

```
1. User enters email/password
2. Frontend sends to backend: POST /api/auth/login
3. Backend:
   - Finds user by email
   - Checks password with bcrypt
   - If valid: Creates JWT token
4. Frontend stores token
5. User redirected to Dashboard
```

---

## 🛠️ Database Maintenance

### **View Database (SQLite)**

**Option 1: VS Code Extension**
1. Install "SQLite Viewer" extension
2. Right-click `medicare.db`
3. Select "Open with SQLite Viewer"

**Option 2: Command Line**
```powershell
# List all users
sqlite3 medicare.db "SELECT id, email, name, phone, created_at FROM users;"

# Check database size
dir medicare.db
```

### **Reset Database**

```powershell
# Delete database (WARNING: All data lost!)
Remove-Item medicare.db

# Restart backend - new database will be created
python app_auth.py
```

### **Backup Database**

```powershell
# Copy database to backup folder
Copy-Item medicare.db backup/medicare_backup_$(Get-Date -Format yyyyMMdd_HHmmss).db
```

---

## 🚀 Future Database Additions

As we add features, new tables will be created:

### **Medical Records Table**
```sql
medical_records (
  id,
  user_id (FK to users),
  document_type,  -- PDF, Image, etc
  file_path,
  uploaded_at
)
```

### **Appointments Table**
```sql
appointments (
  id,
  user_id (FK to users),
  doctor_id,
  date_time,
  status,  -- Scheduled, Completed, Cancelled
  notes
)
```

### **LLM Analysis Table**
```sql
llm_analysis (
  id,
  user_id (FK to users),
  symptoms_input,
  analysis_result,
  date_analyzed
)
```

---

## ✅ Quick Checklist

Before testing, make sure:

- [ ] Google Client ID copied to `.env.local`
- [ ] Google Client ID copied to `.env`
- [ ] Both files saved
- [ ] Backend restarted (`python app_auth.py`)
- [ ] Frontend restarted (`npm run dev`)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] No "Failed to fetch" errors in console
- [ ] Testing registration with email/password first
- [ ] Then testing Google OAuth

---

## 🆘 Troubleshooting

### **Error: "Google is not defined"**
→ Check VITE_GOOGLE_CLIENT_ID is set in .env.local

### **Error: "401 - Invalid token"**
→ Client ID is wrong, regenerate from Google Console

### **Error: "CORS Error"**
→ Backend not running, start it: `python app_auth.py`

### **Error: "400 - Bad Request"**
→ Missing required fields (email, password, name)

### **Database won't open in SQLite Viewer**
→ Close database in backend first (Ctrl+C), then open

---

## 📝 Summary

- **Database**: SQLite (automatic setup)
- **Stores**: User profiles, authentication info, emails, medical history
- **Security**: Bcrypt hashing, OAuth verification, JWT tokens
- **Google OAuth**: Real setup required (follow steps above)
- **Future**: PostgreSQL in production

**Next Steps:**
1. Set up Google OAuth (follow STEP 1-5 above)
2. Test registration/login
3. Explore Settings page
4. Try different themes
5. Send feedback (in Settings)

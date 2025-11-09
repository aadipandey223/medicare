# 🚀 Quick Start Guide - Medicare Portal

## Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- npm installed

## Step 1: Fix Database (If Needed)

If you get database errors, reset the database:
```powershell
python reset_db.py
```

## Step 2: Start Backend Server

Open Terminal/PowerShell 1:
```powershell
cd E:\Aadi\medicare\medicare
python app.py
```

Wait for:
```
✅ Test doctor created: doctor@medicare.com / doctor123
 * Running on http://0.0.0.0:5000
```

**OR use the PowerShell script:**
```powershell
.\start_backend.ps1
```

## Step 3: Start Frontend Server

Open Terminal/PowerShell 2 (new window):
```powershell
cd E:\Aadi\medicare\medicare
npm run dev
```

Wait for:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**OR use the PowerShell script:**
```powershell
.\start_frontend.ps1
```

## Step 4: Access the Application

1. Open browser: `http://localhost:3000`
2. You'll see the **Medicare Login** page

## Step 5: Test Login

### Doctor Login:
- **Email**: `doctor@medicare.com`
- **Password**: `doctor123`
- Click "Login"
- You'll be redirected to Doctor Dashboard

### Patient Login:
- Click "Register" tab
- Fill in your details
- Use any email (e.g., `patient@test.com`)
- Use any password (min 6 characters, e.g., `patient123`)
- Click "Create Account"
- You'll be automatically logged in

## Step 6: Test Full Flow

### In Patient Tab:
1. Go to "Consult" page
2. Click "Request Consultation"
3. Select "Dr. John Smith"
4. Enter symptoms (e.g., "Headache and fever")
5. Click "Send Request"

### In Doctor Tab:
1. Go to "Patient Requests"
2. See the consultation request
3. Click "Accept"
4. Go to "Active Consultations"
5. Start chatting with the patient

### Both Tabs:
- Messages update automatically every 2 seconds
- Both can send messages in real-time
- Chat interface works like WhatsApp

## Troubleshooting

### Backend won't start:
- Make sure Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Reset database: `python reset_db.py`

### Frontend won't start:
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is available

### Database errors:
- Run: `python reset_db.py`
- Then restart: `python app.py`

### Port already in use:
- Backend (5000): Kill the process using port 5000
- Frontend (3000): Change port in `vite.config.js`

## Features

### Doctor Features:
- ✅ Dashboard with statistics
- ✅ View and accept/reject patient requests
- ✅ Chat with patients in active consultations
- ✅ View all patients
- ✅ Update profile settings

### Patient Features:
- ✅ Request consultation with doctors
- ✅ Chat with doctor in active consultations
- ✅ Upload medical documents
- ✅ View medical history
- ✅ Update profile

## Test Credentials Summary

**Doctor:**
- Email: `doctor@medicare.com`
- Password: `doctor123`

**Patient:**
- Register new account (any email/password)

## Support

If you encounter any issues:
1. Check `FIX_DATABASE.md` for database issues
2. Check browser console for frontend errors
3. Check terminal for backend errors
4. Make sure both servers are running

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 3000
3. ✅ Test doctor login
4. ✅ Test patient registration
5. ✅ Test consultation flow
6. ✅ Test chat functionality

Enjoy testing! 🎉

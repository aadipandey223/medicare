# 🔧 Database Fix Guide

## Problem
If you get this error:
```
sqlite3.OperationalError: no such column: doctors.password
```

This means your database schema is outdated and doesn't have the new Doctor table.

## Solution

### Option 1: Automatic Fix (Recommended)
Run this command in PowerShell:
```powershell
python reset_db.py
python app.py
```

### Option 2: Manual Fix
1. Delete the database file:
   ```powershell
   Remove-Item medicare.db -Force
   Remove-Item medicare.db-journal -Force
   ```

2. Restart the backend:
   ```powershell
   python app.py
   ```

The database will be automatically recreated with the correct schema including:
- ✅ Users table (patients)
- ✅ Doctors table (new)
- ✅ Consultations table (new)
- ✅ Messages table (new)
- ✅ Test doctor account (doctor@medicare.com / doctor123)

## Verify Fix

After restarting, you should see:
```
✅ Test doctor created: doctor@medicare.com / doctor123
 * Running on http://0.0.0.0:5000
```

## Starting Both Services

### Backend (Terminal 1):
```powershell
python app.py
# OR
.\start_backend.ps1
```

### Frontend (Terminal 2):
```powershell
npm run dev
# OR
.\start_frontend.ps1
```

## Test Credentials

**Doctor:**
- Email: `doctor@medicare.com`
- Password: `doctor123`

**Patient:**
- Register a new account on the login page


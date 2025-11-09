# 🚀 Localhost Error - How to Start Application

## Problem
"Localhost error" - Application won't open at http://localhost:3000

## Root Causes
1. Frontend server not running
2. Frontend crashed or didn't start
3. Port 3000 already in use
4. Incorrect commands executed

---

## ✅ Solution - Start Application Correctly

### Step 1: Open TWO Terminals

**Terminal 1** - Backend
**Terminal 2** - Frontend

### Step 2: Terminal 1 - Start Backend

```bash
cd e:\Aadi\medicare\medicare
python app.py
```

**Wait for:**
```
* Running on http://127.0.0.1:5000
* Running on http://192.168.0.110:5000
Debugger is active!
```

**Leave this terminal running!** ✅

### Step 3: Terminal 2 - Start Frontend

```bash
cd e:\Aadi\medicare\medicare
npm run dev
```

**Wait for:**
```
VITE v5.4.21 ready in XXX ms

➜ Local:   http://localhost:3000/
➜ Network: use --host to expose
```

**Leave this terminal running!** ✅

### Step 4: Open Browser

Visit: **http://localhost:3000**

**You should see:** Medicare Portal login page ✅

---

## 🎯 What Each Server Does

### Backend (Port 5000)
- Handles authentication (login, register)
- Manages user data
- Processes file operations
- **File**: `app.py`
- **Start**: `python app.py`
- **URL**: http://localhost:5000

### Frontend (Port 3000)
- Displays the web interface
- Handles user interactions
- Sends requests to backend
- **Folder**: `src/`
- **Start**: `npm run dev`
- **URL**: http://localhost:3000

---

## 📋 Startup Checklist

### Before Starting

- [ ] Two terminal windows open
- [ ] Both in folder: `e:\Aadi\medicare\medicare`
- [ ] No other services on ports 3000 or 5000
- [ ] Internet connection active
- [ ] About 1 minute to start

### Starting Backend

- [ ] Command: `python app.py`
- [ ] Wait for: "Running on http://127.0.0.1:5000"
- [ ] See: "Debugger is active!"
- [ ] Terminal stays open

### Starting Frontend

- [ ] Command: `npm run dev`
- [ ] Wait for: "VITE ready"
- [ ] See: "Local: http://localhost:3000"
- [ ] Terminal stays open

### Opening App

- [ ] Open browser
- [ ] Go to: http://localhost:3000
- [ ] Should see login page
- [ ] No errors in console (F12)

---

## Common Errors & Fixes

### Error: "Connection refused"
**Cause**: Backend not running on port 5000
**Fix**: 
```bash
# Terminal 1
python app.py
# Wait for "Running on http://127.0.0.1:5000"
```

### Error: "Cannot access localhost:3000"
**Cause**: Frontend not running on port 3000
**Fix**:
```bash
# Terminal 2
npm run dev
# Wait for "Local: http://localhost:3000"
```

### Error: "Port 3000 already in use"
**Cause**: Another app using port 3000
**Fix**:
```bash
# Kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Error: "Port 5000 already in use"
**Cause**: Another app using port 5000
**Fix**:
```bash
# Kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then restart
python app.py
```

### Error: "Module not found"
**Cause**: Dependencies not installed
**Fix**:
```bash
# Install dependencies
npm install

# Then start
npm run dev
```

### Error: "White screen"
**Cause**: Frontend loaded but backend not responding
**Fix**:
1. Check backend is running (see "Running on http://127.0.0.1:5000")
2. Open DevTools (F12)
3. Check Console for errors
4. Check Network tab for failed requests

### Error: "Failed to fetch"
**Cause**: Backend not running or CORS issue
**Fix**:
1. Verify backend running: `python app.py`
2. Verify frontend can reach: http://localhost:5000/api/health
3. Should return: `{"status":"ok"}`

---

## Step-by-Step Startup Guide

### ✅ First Time Setup

```bash
# 1. Open Terminal 1 (Admin Mode)
cd e:\Aadi\medicare\medicare

# 2. Start Backend
python app.py
# Wait 5-10 seconds for startup

# 3. Open Terminal 2 (New Window)
cd e:\Aadi\medicare\medicare

# 4. Install dependencies (first time only)
npm install

# 5. Start Frontend
npm run dev
# Wait 5 seconds for startup

# 6. Open Browser
# Go to: http://localhost:3000
# Should see Medicare Portal ✅
```

### ✅ Subsequent Startups

```bash
# Terminal 1
python app.py
# Wait for "Running on..."

# Terminal 2
npm run dev
# Wait for "Local: http://localhost:3000"

# Browser
# Go to http://localhost:3000 ✅
```

---

## Verification

### Check Backend
```bash
# In browser, visit:
http://localhost:5000/api/health

# Should show:
{"status":"ok"}
```

### Check Frontend
```bash
# In browser, visit:
http://localhost:3000

# Should show:
Medicare Portal with Login/Register
```

### Check Communication
1. Open DevTools (F12)
2. Go to Network tab
3. Try login
4. Should see requests to:
   - `/api/auth/login`
   - Status should be 401 or 200 (not failed)

---

## Terminal Tips

### Keep Both Terminals Visible
- Arrange windows side-by-side
- Left: Backend (Terminal 1)
- Right: Frontend (Terminal 2)
- Both should stay running

### Read Terminal Output
```
✅ Good: "Running on http://127.0.0.1:5000"
❌ Bad: "Error: [Errno 48] Address already in use"

✅ Good: "Local: http://localhost:3000"
❌ Bad: "Error: listen EADDRINUSE: address already in use :::3000"
```

### Stop Servers
- Press **Ctrl+C** in each terminal
- Wait 2 seconds
- Terminal will close or show prompt

### Restart Servers
1. Stop both (Ctrl+C)
2. Wait 2 seconds
3. Start backend: `python app.py`
4. Start frontend: `npm run dev`
5. Open browser

---

## Quick Troubleshooting Flow

```
App not opening at localhost:3000?
    ↓
Check Terminal 1 (Backend)
    ├─ Shows "Running on http://127.0.0.1:5000"? → YES ✅
    └─ No? → Start: python app.py
    ↓
Check Terminal 2 (Frontend)
    ├─ Shows "Local: http://localhost:3000"? → YES ✅
    └─ No? → Start: npm run dev
    ↓
Refresh Browser (Ctrl+F5)
    ├─ Page loads? → YES ✅ SUCCESS!
    └─ Still error? → Open F12 and check Console
```

---

## Browser Compatibility

Works with:
- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari

**Recommended**: Chrome (best performance)

---

## Once App Opens

### Next Steps
1. **Register** or use **Demo Login**
2. **Verify** you can see Dashboard
3. **Test** Upload feature
4. **Check** Settings page
5. **Try** different themes

### Demo Credentials
- **Email**: demo@test.com
- **Password**: (click Demo Login button)
- **No registration needed**

### Register New Account
1. Click "Register" tab
2. Fill in all fields
3. Click "Create Account"
4. Auto-logged in to Dashboard

---

## Performance

### Expected Load Times
- Backend startup: 5-10 seconds
- Frontend startup: 5-10 seconds
- App opening: < 2 seconds
- Page navigation: < 1 second
- Login: < 2 seconds

### If Slow
1. Check internet speed
2. Check computer CPU/memory usage
3. Close other applications
4. Try restart

---

## Keeping Servers Running

### Important
- ⚠️ DO NOT close either terminal
- ⚠️ Both must stay running while using app
- ⚠️ If you close, app will stop working
- ⚠️ When done, press Ctrl+C to stop

### Session Duration
- Servers keep running indefinitely
- As long as terminals are open
- Close terminals = Stop servers
- Reopen terminals = Restart servers

---

## Common Success Indicators

✅ You'll see:
- Browser shows Medicare Portal
- Login form displayed
- Can enter email/password
- "Demo Login" button visible
- No errors in console (F12)

❌ You won't see:
- "Cannot reach localhost"
- "Connection refused"
- "Port in use"
- Blank white screen
- Console errors

---

## Quick Reference

| What | Command | Location |
|------|---------|----------|
| Start Backend | `python app.py` | Terminal 1 |
| Start Frontend | `npm run dev` | Terminal 2 |
| Open App | http://localhost:3000 | Browser |
| Health Check | http://localhost:5000/api/health | Browser |
| Stop Both | Ctrl+C | Both Terminals |

---

## Support

### Still Having Issues?
1. **Read**: This entire guide
2. **Check**: Both terminal outputs
3. **Verify**: Correct folder: `e:\Aadi\medicare\medicare`
4. **Check**: File exists: `app.py` and `package.json`
5. **Screenshot**: Terminal output showing error

### Contact
📧 Email: aadipandey223@gmail.com
📞 Phone: +91 9997181525

---

## Summary

**To run the app:**

1. **Terminal 1**: `python app.py` (Backend)
2. **Terminal 2**: `npm run dev` (Frontend)
3. **Browser**: Visit http://localhost:3000

**Wait for both to show ready messages, then open app. ✅**

---

**Last Updated**: November 6, 2025
**Status**: Verified Working

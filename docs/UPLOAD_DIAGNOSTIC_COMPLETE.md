# 🔍 Upload Not Working - Comprehensive Diagnostic & Fix

## Current Status
- ✅ RLS disabled
- ✅ No policies blocking
- ❌ Upload still failing

**Root causes to check**:
1. Frontend server not running (port 3000)
2. Backend server not running (port 5000)
3. Supabase credentials wrong in .env.local
4. Frontend not restarted after RLS fix
5. Browser cache not cleared

---

## ✅ QUICK FIX - DO THIS NOW (5 Steps)

### Step 1: Kill Any Running Processes
```powershell
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
Start-Sleep -Seconds 2
```

### Step 2: Clear Browser Cache
```
In browser:
Press: Ctrl + Shift + Delete
Select: All time
Check: Cookies and cached images/files
Click: Clear data
```

### Step 3: Start Backend
```powershell
cd e:\Aadi\medicare\medicare
python app.py
```
**Wait for**: `Running on http://127.0.0.1:5000`

### Step 4: Start Frontend (New Terminal)
```powershell
cd e:\Aadi\medicare\medicare
npm run dev
```
**Wait for**: `Local: http://localhost:3000`

### Step 5: Test Upload
```
1. Open: http://localhost:3000
2. Click: Demo Login (or login with your account)
3. Click: Upload menu
4. Select file: PDF/JPG/PNG, < 6MB
5. Click: Upload Document
6. Should see: ✅ File uploaded to cloud successfully!
```

---

## 🧪 DETAILED DIAGNOSTICS

### Test 1: Check Servers Running

**Check Frontend**:
```powershell
netstat -ano | findstr "3000"
```
**Expected**: Shows process listening on port 3000
**If empty**: Frontend not running → Start with `npm run dev`

**Check Backend**:
```powershell
netstat -ano | findstr "5000"
```
**Expected**: Shows process listening on port 5000
**If empty**: Backend not running → Start with `python app.py`

### Test 2: Check Browser Console

**Steps**:
1. Open http://localhost:3000
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for red errors
5. Try upload
6. Look for error messages

**Expected Logs** (Working):
```
✅ File uploaded to Supabase: {...}
✅ Public URL generated: https://...
📤 Upload Details:
  User ID: 1
  File name: myfile.pdf
```

**Expected Logs** (Not Working):
```
❌ Upload error: (message)
Error message: (what went wrong)
Error type: (type of error)
```

### Test 3: Check Supabase Credentials

**File**: `.env.local`

**Should have**:
```
VITE_SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... (long string)
VITE_API_URL=http://localhost:5000
```

**If missing**: Add them now
**If wrong URL**: Update to correct URL

### Test 4: Check Network in Browser

**Steps**:
1. Open http://localhost:3000
2. Press F12
3. Go to Network tab
4. Try upload
5. Look for request to supabase
6. Check response status

**Expected**:
```
Request: POST to supabase storage
Status: 200 OK
Response: File data (success)
```

**Failure**:
```
Status: 403 Forbidden (permission issue)
Status: 404 Not Found (bucket not found)
Status: 400 Bad Request (invalid file)
CORS error (server not allowing)
```

---

## 🚀 STEP-BY-STEP STARTUP GUIDE

### Part 1: Close Everything

**Step 1a**: Kill Node processes
```powershell
taskkill /F /IM node.exe 2>nul
```

**Step 1b**: Kill Python processes
```powershell
taskkill /F /IM python.exe 2>nul
```

**Step 1c**: Wait
```powershell
Start-Sleep -Seconds 3
```

### Part 2: Start Backend

**Step 2a**: Open new PowerShell window
```powershell
# Or use existing terminal if no servers running
```

**Step 2b**: Navigate to project
```powershell
cd e:\Aadi\medicare\medicare
```

**Step 2c**: Start Python backend
```powershell
python app.py
```

**Expected Output**:
```
Running on http://127.0.0.1:5000
WARNING in app.runningOn a development server...
Debugger is active!
```

**Step 2d**: Wait for "Running on..."
```
Don't proceed until you see:
"Running on http://127.0.0.1:5000"
```

### Part 3: Start Frontend (New Terminal)

**Step 3a**: Open NEW PowerShell window
```
Right-click Start → Windows PowerShell
```

**Step 3b**: Navigate
```powershell
cd e:\Aadi\medicare\medicare
```

**Step 3c**: Start frontend
```powershell
npm run dev
```

**Expected Output**:
```
VITE v5.4.21 ready in XXX ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

**Step 3d**: Wait for "Local:..."
```
Don't proceed until you see:
"Local: http://localhost:3000/"
```

### Part 4: Clear Browser & Test

**Step 4a**: Open browser
```
http://localhost:3000
```

**Step 4b**: Clear cache
```
Press: Ctrl + Shift + Delete
Select: All time
Check: Cookies and cached images/files
Click: Clear data
Reload: F5
```

**Step 4c**: Login
```
Demo Login
or
Register → Login
```

**Step 4d**: Test Upload
```
Click: Upload
Select: PDF/JPG/PNG file (< 6MB)
Click: Upload Document
Wait: 2-3 seconds
Expected: ✅ Success message
```

---

## 🔧 COMMON ISSUES & FIXES

### Issue 1: "Cannot find module" (Frontend)
```
Error: Cannot find module '@supabase/supabase-js'
Fix: npm install
Then: npm run dev
```

### Issue 2: "Python: command not found"
```
Error: python: command not found
Fix: Use: python3 app.py (or check Python installed)
Verify: python --version
```

### Issue 3: "Port 3000 already in use"
```
Error: Port 3000 is already in use
Fix: taskkill /F /IM node.exe
Then: npm run dev
```

### Issue 4: "Port 5000 already in use"
```
Error: Address already in use
Fix: taskkill /F /IM python.exe
Then: python app.py
```

### Issue 5: "CORS error"
```
Error: Access blocked by CORS policy
Fix: Make sure backend has CORS enabled
Check: app.py has: CORS(app)
```

### Issue 6: "Supabase bucket not found"
```
Error: bucket not found
Fix: Go to Supabase Dashboard
Storage → medical-documents → Verify bucket exists
If not: Create bucket with exact name
```

### Issue 7: "RLS policy violation"
```
Error: new row violates row-level security policy
Fix: Go to Supabase Dashboard
Storage → medical-documents → Policies
Disable RLS or delete all policies
```

### Issue 8: "File size too large"
```
Error: File size exceeds maximum 6 MB
Fix: Select file < 6 MB
Or: Increase limit in Upload.jsx if needed
```

### Issue 9: "File type not supported"
```
Error: File type not supported. Use PDF, JPG, or PNG
Fix: Select PDF, JPG, or PNG file
Other formats: Change allowedTypes in Upload.jsx
```

### Issue 10: "Authentication error"
```
Error: You must be logged in to upload
Fix: Click Demo Login or Register
Verify: localStorage has token (F12 → Application)
```

---

## 📋 VERIFICATION CHECKLIST

Before testing upload, verify ALL:

- [ ] **Backend running**
  - Command: `python app.py`
  - Port: 5000
  - Shows: "Running on http://127.0.0.1:5000"

- [ ] **Frontend running**
  - Command: `npm run dev`
  - Port: 3000
  - Shows: "Local: http://localhost:3000/"

- [ ] **Supabase bucket exists**
  - Name: medical-documents
  - Status: Public
  - RLS: Disabled (no policies)

- [ ] **Supabase credentials in .env.local**
  - VITE_SUPABASE_URL: https://icvtjsfcuwqjhgduntyw.supabase.co
  - VITE_SUPABASE_ANON_KEY: (configured)
  - VITE_API_URL: http://localhost:5000

- [ ] **Browser cleared**
  - Cache cleared: Ctrl+Shift+Delete
  - Page reloaded: F5
  - localStorage cleared (optional)

- [ ] **Logged in**
  - Demo Login used
  - Or registered and logged in
  - User visible in UI

All checked? → Try upload now! ✅

---

## 🎯 UPLOAD TEST SCRIPT

### Copy & Paste These Commands

**Terminal 1 - Backend**:
```powershell
cd e:\Aadi\medicare\medicare
taskkill /F /IM python.exe 2>nul
Start-Sleep -Seconds 2
python app.py
```
Wait for: "Running on http://127.0.0.1:5000"

**Terminal 2 - Frontend**:
```powershell
cd e:\Aadi\medicare\medicare
taskkill /F /IM node.exe 2>nul
Start-Sleep -Seconds 2
npm run dev
```
Wait for: "Local: http://localhost:3000/"

**Browser**:
```
1. Ctrl+Shift+Delete (clear cache)
2. http://localhost:3000
3. Demo Login
4. Click Upload
5. Select file
6. Upload
7. Should work! ✅
```

---

## 🔍 DEBUG CONSOLE OUTPUT

### What to Look For

**Good Signs** ✅:
```
✅ File uploaded successfully
✅ Public URL generated
📤 Upload Details:
✅ Restoring session for: (username)
```

**Bad Signs** ❌:
```
❌ Upload error:
❌ Supabase error:
❌ You must be logged in
Cannot find module
CORS policy error
```

### How to See Console Output

**Step 1**: Open browser DevTools
```
Press: F12
```

**Step 2**: Go to Console tab
```
Tabs at top: Elements, Console, Sources, Network
Click: Console
```

**Step 3**: Try upload
```
Select file → Click Upload Document
Look for logs/errors in console
```

**Step 4**: Copy errors
```
Right-click error
Select: Copy
Share with support
```

---

## 📞 IF STILL STUCK

### What to Share

1. **Screenshot of Console** (F12)
   - What errors appear?
   - What is the exact error message?

2. **Screenshot of Network Tab** (F12 → Network)
   - What request failed?
   - What is the status code?
   - What is the response?

3. **Screenshot of Supabase Dashboard**
   - Storage → medical-documents → Policies
   - What policies exist?
   - Is RLS enabled or disabled?

4. **Terminal Output**
   - What does `python app.py` show?
   - What does `npm run dev` show?
   - Any errors on startup?

5. **File Being Uploaded**
   - Name: (e.g., test.pdf)
   - Size: (e.g., 1.5 MB)
   - Type: (PDF/JPG/PNG)

### Contact for Help

📧 Email: aadipandey223@gmail.com
📞 Phone: +91 9997181525

Include:
- Screenshots from above
- Exact error message
- Steps you took to reproduce
- What operating system you're using (Windows 10/11)

---

## 🚀 DO THIS STEP-BY-STEP

### Minute 1-2: Stop & Start Servers
```powershell
# Terminal 1
taskkill /F /IM node.exe 2>nul ; taskkill /F /IM python.exe 2>nul
Start-Sleep -Seconds 3

# Terminal 1 (Backend)
cd e:\Aadi\medicare\medicare
python app.py
# Wait for: Running on http://127.0.0.1:5000
```

### Minute 3-4: Start Frontend
```powershell
# Terminal 2 (Frontend)
cd e:\Aadi\medicare\medicare
npm run dev
# Wait for: Local: http://localhost:3000
```

### Minute 5: Clear & Test
```
Browser:
- Ctrl+Shift+Delete (clear cache)
- http://localhost:3000
- Demo Login
- Upload → Select file → Upload Document
- Should work! ✅
```

---

**Status**: Ready to debug and fix
**Time to implement**: 5-10 minutes
**Expected result**: Upload will work ✅

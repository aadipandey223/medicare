# 🔧 Setup Backend Upload - Get Service Role Key

## Quick Setup (3 Steps)

### Step 1: Get Service Role Key from Supabase
```
1. Go to: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw
2. Click: Settings (bottom left)
3. Click: API
4. Find: "Service role secret" section
5. Copy the long key (starts with eyJ...)
```

### Step 2: Add to Your System
```
Option A - Temporary (for testing):
  SET SUPABASE_SERVICE_KEY=your_key_here

Option B - Permanent (in .env file):
  Create file: .env in project root
  Add: SUPABASE_SERVICE_KEY=your_key_here
```

### Step 3: Restart Backend
```powershell
Ctrl+C (stop current backend)
python app.py
```

Watch for: `✅ Supabase initialized for backend uploads`

---

## 🔐 WHERE TO FIND SERVICE ROLE KEY

### In Supabase Dashboard

**Path**:
```
Project: icvtjsfcuwqjhgduntyw
  → Settings (bottom of left sidebar)
    → API tab
      → Service role secret ← COPY THIS
```

**What it looks like**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6I...
(very long string starting with eyJ)
```

### NOT to Confuse With:
```
❌ Anonymous public key (eyJ... starting one, but different)
❌ API key (shorter)
❌ JWT (used by auth, not for uploads)

✅ Service role secret (this is what you need!)
```

---

## 📝 ADD TO .env FILE

### Create .env File
```
1. Open project root
2. Create file: .env
3. Add these lines:

SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=sqlite:///medicare.db
JWT_SECRET=your-secret-key-change-in-production
```

### File Location
```
e:\Aadi\medicare\medicare\.env
                         ↑
                    This file
```

### Content Template
```ini
# Supabase Configuration
SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdnRqc2ZjdXdxamhnZHVudHl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQzNzM4MSwiZXhwIjoyMDc4MDEzMzgxfQ.PASTE_YOUR_SERVICE_KEY_HERE

# Database
DATABASE_URL=sqlite:///medicare.db

# Security
JWT_SECRET=your-secret-key-change-in-production
```

---

## 🚀 TEST IT WORKS

### Step 1: Verify Backend Started
```
Terminal output should show:
✅ Supabase initialized for backend uploads
```

If you see:
```
⚠️  SUPABASE_SERVICE_KEY not set - uploads may fail
```
Then the key is not configured. Add it to .env or environment variables.

### Step 2: Test Upload
```
1. Go to: http://localhost:3000
2. Login or Demo Login
3. Click: Upload menu
4. Select: File (PDF/JPG/PNG, < 6MB)
5. Click: Upload Document
6. Should show: ✅ File uploaded to cloud successfully!
```

### Step 3: Check Backend Logs
```
Terminal where python app.py is running should show:

📤 Backend upload requested
✅ User authenticated: (username)
📁 File: (filename), Size: X.XX MB
🚀 Uploading to Supabase...
✅ Upload response received
✅ Public URL: https://...
📦 Upload complete
```

---

## 🔍 FIND SERVICE ROLE KEY - DETAILED STEPS

### In Supabase Dashboard

**Step 1 - Login**:
```
Go to: https://app.supabase.com
Login with your account
```

**Step 2 - Select Project**:
```
Projects area
Find: icvtjsfcuwqjhgduntyw
Click it
```

**Step 3 - Go to Settings**:
```
Left sidebar (bottom)
Look for: Settings (gear icon)
Click: Settings
```

**Step 4 - Find API Section**:
```
Settings page tabs:
  - General
  - Database
  - API ← CLICK THIS
  - Auth
  - etc.
```

**Step 5 - Find Service Role Secret**:
```
In API tab, look for section:

Project API keys
├─ anon public key
│  └─ eyJ... (skip this)
└─ service_role secret
   └─ eyJ... ← COPY THIS ONE
```

**Step 6 - Copy Key**:
```
Find: "service_role secret" section
Hover over the key
Click: Copy button
```

**Result**:
```
Key copied to clipboard
Ready to paste into .env file
```

---

## 📋 SETUP CHECKLIST

Before testing upload, verify:

- [ ] Got Service Role Key from Supabase
- [ ] Created .env file in project root
- [ ] Added SUPABASE_URL to .env
- [ ] Added SUPABASE_SERVICE_KEY to .env
- [ ] Stopped backend (Ctrl+C)
- [ ] Started backend (python app.py)
- [ ] See: "✅ Supabase initialized for backend uploads"
- [ ] Frontend running (npm run dev)
- [ ] Logged into app
- [ ] Ready to test upload!

---

## ✅ EXPECTED BEHAVIOR

### When Working
```
Terminal (backend):
📤 Backend upload requested
✅ User authenticated: (name)
📁 File: document.pdf, Size: 1.23 MB
🚀 Uploading to Supabase...
✅ Upload response received
✅ Public URL: https://icvtjsfcuwqjhgduntyw.supabase.co/...
📦 Upload complete

Browser:
✅ File uploaded to cloud successfully!
(green success message)
```

### When Not Working
```
If see: "⚠️  SUPABASE_SERVICE_KEY not set"
→ Add key to .env file

If see: "❌ Supabase error"
→ Verify key is correct (from Settings → API → service_role secret)

If see: "Upload failed"
→ Check frontend console (F12) for error details
```

---

## 🔐 SECURITY NOTE

### Service Role Key
```
⚠️  This is a SECRET key - don't share it!
✅ Only needed on backend (not frontend)
✅ Can regenerate if compromised
✅ Bypasses RLS (that's why we use it)
```

### Keeping It Safe
```
✅ Store in .env (not in code)
✅ Add .env to .gitignore
✅ Never commit .env to git
✅ Use different keys for dev/prod
```

---

## 🆘 TROUBLESHOOTING

### "Key doesn't work"
```
Check:
1. Copied full key (very long string)
2. No extra spaces before/after
3. Key starts with: eyJ
4. Restarted backend after adding
5. Used service_role secret (not anon key)
```

### "Still getting RLS error"
```
The backend endpoint should bypass RLS
If still failing:
1. Check backend logs (look for errors)
2. Verify key is in .env
3. Check Console (F12) for error
4. Screenshot error and send to: aadipandey223@gmail.com
```

### "File uploaded but can't download"
```
Check:
1. Bucket is PUBLIC (not private)
2. RLS disabled on bucket
3. File path is correct
4. URL returns 403 = permission issue
```

---

## 🚀 NEXT STEPS

### Now:
1. Get Service Role Key
2. Add to .env
3. Restart backend
4. Test upload

### If Works:
✅ File uploads complete! You're done!

### If Doesn't Work:
1. Check backend logs
2. Check browser console (F12)
3. Take screenshot of error
4. Email: aadipandey223@gmail.com

---

**Status**: Ready to configure
**Time**: 5 minutes
**Result**: Backend uploads will work! ✅

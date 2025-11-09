# 🚨 URGENT: Create Supabase Bucket NOW - 2 Minutes

## Your Error
```
Upload failed: bucket not found
```

## Quick Fix (2 Minutes)

### Step 1: Go to Supabase Dashboard
```
🔗 https://app.supabase.com
📱 Login with your account
🏗️ Select project: icvtjsfcuwqjhgduntyw
```

### Step 2: Create Bucket
```
Left Menu → Storage
Click: "New Bucket" (or "+ Create Bucket")
```

### Step 3: Fill Form
```
Name: medical-documents (EXACT - must match this)
Public: ☑ CHECKED (IMPORTANT!)
Click: Create
```

### Step 4: Done!
```
✅ Bucket created
✅ Set to Public
✅ Go back to app
✅ Try upload again
```

---

## 🎯 What Your Code Expects

Your `supabaseStorage.js` file is looking for this:
```javascript
.from('medical-documents')  ← This bucket must exist!
.upload(filePath, file)
```

**Bucket Name**: Exactly `medical-documents`
**Status**: Must be PUBLIC
**Result**: Uploads will work!

---

## 📊 Configuration Check

Your `.env.local` has:
```
✅ VITE_SUPABASE_URL = https://icvtjsfcuwqjhgduntyw.supabase.co
✅ VITE_SUPABASE_ANON_KEY = (configured)
✅ VITE_API_URL = http://localhost:5000
```

Everything is ready! **Just need the bucket.**

---

## 🔍 Visual Guide

### Dashboard Screenshot Path
```
1. https://app.supabase.com
   ↓
2. Click project: icvtjsfcuwqjhgduntyw
   ↓
3. Left sidebar → Storage
   ↓
4. Click "New Bucket" button
   ↓
5. Name: medical-documents
   ↓
6. Toggle Public: ON
   ↓
7. Click Create
   ↓
✅ DONE!
```

---

## 📱 Mobile-Friendly Path
```
app.supabase.com → Login → Projects → icvtjsfcuwqjhgduntyw → Storage → New Bucket
```

---

## ✅ TEST AFTER CREATING

1. App: http://localhost:3000
2. Login or Demo Login
3. Click Upload
4. Select file (PDF/JPG/PNG, < 6MB)
5. Click Upload Document
6. Should show: ✅ **File uploaded to cloud successfully!**

---

## 🆘 IF YOU CAN'T FIND THE BUTTON

### In Supabase Dashboard:
```
Can't see "Storage" on left?
→ Scroll down left sidebar
→ Look for: Database, SQL Editor, Storage, Auth, Functions
→ Click: Storage

Can't see "New Bucket"?
→ Look for: [+ New Bucket] button
→ Or: [Create Bucket] button
→ Or: [Create first bucket] message
```

---

## 🚀 DO THIS NOW

1. Open: https://app.supabase.com
2. Login
3. Select project: **icvtjsfcuwqjhgduntyw**
4. Click: **Storage**
5. Click: **New Bucket**
6. Enter name: **medical-documents**
7. Toggle Public: **ON**
8. Click: **Create**
9. Come back and try upload

**Time**: 2 minutes
**Result**: ✅ Uploads work!

---

## 🔗 DIRECT LINK

Your Project: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw

Go there → Click Storage → New Bucket → medical-documents → Public → Create

---

**STOP HERE** - Go create the bucket now, then come back and test upload!

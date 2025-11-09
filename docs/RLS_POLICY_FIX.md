# 🔒 RLS Policy Error - Row-Level Security Blocking Upload

## The Error
```
Upload failed: Supabase error: new row violates row-level security policy
```

## Root Cause
**Row-Level Security (RLS)** policies are enabled on the `medical-documents` bucket but are too restrictive. They're blocking your uploads.

---

## ✅ SOLUTION - Disable RLS for Medical-Documents Bucket

### Step 1: Go to Supabase Dashboard
```
🔗 https://app.supabase.com
📱 Login
🏗️ Project: icvtjsfcuwqjhgduntyw
```

### Step 2: Navigate to Storage Policies
```
Left Menu → Storage
Click: medical-documents (bucket)
Click: Policies tab
```

### Step 3: Disable RLS (Option A - RECOMMENDED)

**Find the RLS toggle** (usually at top of Policies tab):
```
"Enable RLS" toggle → TURN OFF (disable it)
Click: Save
```

If you don't see a toggle:
1. Look for existing policies
2. Click the policy name
3. Click "Delete" to remove it
4. Repeat for all policies
5. Result: No RLS policies, bucket is open for uploads

### Step 4: Verify
```
Policies tab should now show:
"No policies" or "RLS disabled"
```

---

## 🎯 Alternative - Create Proper RLS Policy (More Complex)

If you want to keep RLS but allow uploads:

### Step 1: Go to Storage Policies
```
Supabase → Storage → medical-documents → Policies
```

### Step 2: Create New Policy
```
Click: New Policy
Name: Allow user uploads
Target roles: authenticated
```

### Step 3: Set Permissions

**For INSERT** (allow uploads):
```
USING: auth.uid()::text = substring(bucket_path from 'users/([^/]+)/'),
WITH CHECK: auth.uid()::text = substring(bucket_path from 'users/([^/]+)/')
```

**OR simpler - Allow all**:
```
USING: true
WITH CHECK: true
```

### Step 4: Create Policy
```
Click: Create
Verify: Policy now shows in list
```

---

## 📊 RLS Policy Explained

### What is RLS?
```
Row-Level Security = Database-level security
Blocks access based on rules
Can be too strict and block legitimate uploads
```

### Your Issue
```
Current: RLS enabled with strict policy
Result: Upload blocked
Fix: Disable RLS or create permissive policy
```

---

## 🚀 QUICK FIX (RECOMMENDED)

### Do This Right Now:

1. Go to: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw
2. Click: Storage
3. Click: medical-documents
4. Click: Policies tab
5. Find: "Enable RLS" toggle or any existing policy
6. If toggle: **Turn OFF**
7. If policies: **Delete all of them**
8. Save/Confirm

### Result
```
✅ RLS disabled for medical-documents bucket
✅ Uploads will now work
✅ Files will upload successfully
```

---

## 🧪 TEST AFTER FIXING

1. Go to: http://localhost:3000
2. Login
3. Navigate to Upload
4. Select file (PDF/JPG/PNG, < 6MB)
5. Click Upload Document
6. Should show: ✅ **File uploaded to cloud successfully!**

---

## 📱 SCREENSHOTS GUIDE

### Find RLS Toggle

**Location 1 - Policies Tab Header**:
```
Storage
  → medical-documents
    → Policies tab
      → [Enable RLS toggle] ← Look here first
      → Turn OFF
```

**Location 2 - If No Toggle**:
```
Storage
  → medical-documents
    → Policies tab
      → Shows existing policies
      → Click policy name
      → Click Delete
      → Repeat for all
      → No policies = RLS disabled
```

---

## 🔍 VERIFY RLS STATUS

After making changes, Policies tab should show:

### ✅ Disabled (Good for us)
```
No Row-Level Security Policy
or
No policies
or
RLS is OFF
```

### ❌ Enabled (Bad for uploads)
```
RLS enabled with policies:
  - Policy 1: ...
  - Policy 2: ...
or
Enable RLS toggle: ON
```

---

## 🛡️ SECURITY NOTE

### Public Bucket (No RLS)
```
Pros:
✅ Easy to use
✅ Uploads work immediately
✅ Good for development
✅ Public documents are visible (which you want)

Cons:
❌ Less restrictive
❌ Anyone can access files
❌ Limited per-user control

Best for: Photo sharing, public documents, file uploads
```

### Private Bucket (With RLS)
```
Pros:
✅ Secure
✅ User-level access control
✅ Fine-grained permissions

Cons:
❌ Complex setup
❌ Must configure policies correctly
❌ Uploads need proper configuration

Best for: Private data, health records (but use with care!)
```

**Your Case**: Public bucket is fine for medical documents (accessible by public URLs after upload).

---

## 🔐 SUPABASE SETTINGS

### Current Configuration
```
Bucket: medical-documents
Status: Public ✅
RLS: Currently ENABLED (too strict) ❌ → Should be OFF ✅
```

### After Fix
```
Bucket: medical-documents
Status: Public ✅
RLS: DISABLED ✅
Result: Uploads work! ✅
```

---

## 🆘 TROUBLESHOOTING

### "I Can't Find RLS Toggle"
```
1. Make sure you're in: Storage → medical-documents → Policies
2. Look at top of page near bucket name
3. Or look in Settings tab instead of Policies
4. If still can't find: Delete all policies manually
```

### "I See Existing Policies"
```
1. Each policy is blocking uploads
2. Click on each policy
3. Click Delete
4. Delete all policies
5. No policies = uploads work
```

### "Upload Still Fails After Disabling"
```
1. Clear browser cache: Ctrl+Shift+Delete
2. Restart frontend: Ctrl+C then npm run dev
3. Try upload again
4. Check console (F12) for error message
5. Email: aadipandey223@gmail.com with screenshot
```

---

## 📋 STEP-BY-STEP WITH IMAGES

### Step 1: Open Supabase
```
URL: https://app.supabase.com
Screenshot location: Top left corner
```

### Step 2: Select Project
```
Projects section
Find: icvtjsfcuwqjhgduntyw
Click it
```

### Step 3: Go to Storage
```
Left sidebar
Find: Storage (below SQL Editor)
Click it
```

### Step 4: Select Bucket
```
Buckets list
Find: medical-documents
Click it
```

### Step 5: Open Policies
```
Tabs at top: Info, Policies, Lifecycle
Click: Policies
```

### Step 6: Disable RLS
```
Find: RLS toggle or existing policies
Toggle OFF or Delete policies
Click: Confirm/Save
```

### Step 7: Verify
```
Page should now show:
"No Row-Level Security Policy"
or
"No policies"
```

---

## ✅ COMPLETION CHECKLIST

- [ ] Logged into Supabase Dashboard
- [ ] Selected project: icvtjsfcuwqjhgduntyw
- [ ] Opened Storage
- [ ] Clicked medical-documents bucket
- [ ] Opened Policies tab
- [ ] Found RLS toggle or policies
- [ ] Disabled RLS (OFF) or deleted all policies
- [ ] Saved changes
- [ ] Restarted frontend: npm run dev
- [ ] Cleared browser cache
- [ ] Tried upload again
- [ ] Upload successful! ✅

---

## 📞 STILL STUCK?

### Quick Diagnostics

**Test 1**: Check Console
```
Press: F12
Go to: Console tab
Try upload
Look for: Red error messages
Screenshot it
```

**Test 2**: Check Network
```
Press: F12
Go to: Network tab
Try upload
Look for: Failed requests to supabase
Screenshot it
```

**Test 3**: Check Settings
```
In Supabase:
Storage → medical-documents → Settings
Verify: Bucket is Public (not Private)
```

---

## 🎯 EXPECTED BEHAVIOR

### After Fix Works
```
1. Click Upload
2. Select file
3. Click "Upload Document"
4. See progress bar
5. See green success message
6. See message: "File uploaded to cloud successfully!"
7. No errors in console
```

### While Broken (Now)
```
1. Click Upload
2. Select file
3. Click "Upload Document"
4. See error: "RLS policy violation"
5. No file uploaded
6. Red error in console
```

---

## 🚀 DO THIS NOW

1. https://app.supabase.com
2. Project: icvtjsfcuwqjhgduntyw
3. Storage → medical-documents → Policies
4. Disable RLS or delete policies
5. Save
6. Come back to app
7. Try upload
8. Should work! ✅

**Time**: 3 minutes
**Result**: Uploads will succeed

---

**Last Updated**: November 6, 2025
**Status**: Ready to Fix
**Difficulty**: Easy (3 clicks)

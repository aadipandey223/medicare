# 🔧 Upload Document Error - Troubleshooting Guide

## Problem
When clicking on "Upload Document" button, an error occurs.

---

## Possible Causes & Solutions

### 1. **Supabase Not Connected**

#### Check Credentials
Make sure `.env.local` has Supabase credentials:

```bash
VITE_SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Verify in Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Type: `import.meta.env.VITE_SUPABASE_URL`
4. Should return: `https://icvtjsfcuwqjhgduntyw.supabase.co`

If it shows `undefined`, the .env file isn't loaded. **Solution**: Restart frontend with `npm run dev`

---

### 2. **Supabase Bucket Not Created**

#### Check if Bucket Exists
1. Visit: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw
2. Login with provided credentials
3. Go to Storage tab
4. Look for bucket named `medical-documents`
5. If not found, create it:
   - Click "New Bucket"
   - Name: `medical-documents`
   - Public or Private: **Public**
   - Click "Create Bucket"

#### Create Bucket via Code (if needed)
```bash
# Run this in Supabase SQL Editor
SELECT * FROM storage.buckets WHERE name = 'medical-documents';
```

---

### 3. **User Not Logged In**

#### Check Authentication
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Look for localStorage key `token`
4. If missing, user isn't logged in

**Solution**: Login first before uploading

#### Verify User Object
In browser console:
```javascript
// Check if user is logged in
JSON.parse(localStorage.getItem('user'))

// Should return:
{
  "id": 1,
  "name": "Your Name",
  "email": "your@email.com",
  "phone": "...",
  "age": 25,
  "gender": "Male",
  "role": "patient"
}
```

---

### 4. **File Size Too Large**

#### Supabase Limits
- Default limit: 6 MB per file
- Our code accepts: PDF, JPG, PNG (Max 10MB shown in UI)

**Solution**: Use smaller files (< 6 MB)

#### Check File Size
1. Right-click file on computer
2. Check "Size" property
3. Should be < 6 MB

---

### 5. **Browser Console Errors**

#### How to Check
1. Open DevTools (F12)
2. Click Console tab
3. Try uploading file
4. Look for red error messages
5. Screenshot and send

#### Common Errors

**Error: "Supabase credentials not configured"**
```
Solution: Restart frontend (npm run dev)
```

**Error: "Failed to upload: bucket not found"**
```
Solution: Create medical-documents bucket in Supabase
```

**Error: "Failed to upload: CORS error"**
```
Solution: Bucket permissions issue - check bucket is public
```

**Error: "Failed to upload: user not authenticated"**
```
Solution: Login first before uploading
```

---

## Step-by-Step Upload Test

### Step 1: Verify Supabase Project
```bash
# Check project is accessible
curl https://icvtjsfcuwqjhgduntyw.supabase.co/rest/v1/health -I
# Should return 200 OK
```

### Step 2: Verify Frontend Environment
1. Open DevTools (F12)
2. Console: `import.meta.env.VITE_SUPABASE_URL`
3. Should show: `https://icvtjsfcuwqjhgduntyw.supabase.co`

### Step 3: Verify User Logged In
1. Go to Dashboard
2. Should show your profile info
3. Check localStorage has `token` and `user`

### Step 4: Test Upload
1. Click "Upload" in menu
2. Select a small image file (< 1 MB)
3. Add a description
4. Click "Upload Document"
5. Should show success message

---

## Debug Mode - How to Enable Detailed Logging

### Add This to Upload.jsx (temporary)
```jsx
const handleUpload = async (e) => {
  e.preventDefault();
  if (!file) return;
  
  console.log('=== UPLOAD DEBUG ===');
  console.log('User:', user);
  console.log('File:', file.name, file.size, file.type);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURED' : 'MISSING');
  
  if (!user) {
    console.error('User not authenticated!');
    setError('You must be logged in to upload documents');
    return;
  }

  setUploading(true);
  setError('');
  
  try {
    console.log('Starting upload...');
    const result = await uploadToSupabase(file, user.id, description);
    console.log('✅ Upload successful:', result);
    setSuccess(true);
    
    setTimeout(() => {
      setFile(null);
      setPreview(null);
      setDescription('');
      setSuccess(false);
    }, 3000);
  } catch (err) {
    console.error('❌ Upload error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    setError('Upload failed: ' + (err.message || 'Unknown error'));
  } finally {
    setUploading(false);
  }
};
```

---

## Network Troubleshooting

### Check Supabase Connection in Browser
1. Open DevTools (F12)
2. Go to Network tab
3. Try uploading
4. Look for requests to `supabase.co`
5. Check status:
   - 200/201 = Success ✅
   - 400/401 = Auth error ❌
   - 403 = Permission error ❌
   - 404 = Bucket not found ❌
   - 413 = File too large ❌

### Example Successful Request
```
POST https://icvtjsfcuwqjhgduntyw.supabase.co/storage/v1/object/medical-documents/users/1/documents/...
Status: 200 OK
Response: {"path":"users/1/documents/...","fullPath":"...","id":"..."}
```

---

## Fix Checklist

- [ ] Supabase credentials in `.env.local`
- [ ] Frontend restarted (`npm run dev`)
- [ ] Logged in with valid user account
- [ ] Supabase bucket `medical-documents` exists and is public
- [ ] File size < 6 MB
- [ ] File type is PDF, JPG, or PNG
- [ ] Browser console shows no errors
- [ ] Network requests show 200 status
- [ ] User ID is valid (not null or undefined)

---

## If Still Not Working

### 1. Clear Everything and Start Fresh
```bash
# Stop frontend
Ctrl+C

# Clear node_modules cache
rm -r node_modules/.vite

# Restart frontend
npm run dev
```

### 2. Check Supabase Project Status
- Visit: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw/settings/general
- Check: Project Status should be "Active"
- Check: API quota not exceeded

### 3. Test with cURL
```bash
# Test Supabase connection
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://icvtjsfcuwqjhgduntyw.supabase.co/storage/v1/object/

# Should return file list (or empty if no files)
```

### 4. Recreate .env.local
Delete `.env.local` and create new one:
```bash
VITE_SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdnRqc2ZjdXdxamhnZHVudHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzczODEsImV4cCI6MjA3ODAxMzM4MX0.V-kML_HtAulRPtx4zoSrCLPJ4-X1TWJgT_VVDepjzhI
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

---

## Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Supabase credentials not configured" | .env.local missing | Restart frontend with npm run dev |
| "bucket not found" | Bucket doesn't exist | Create medical-documents bucket |
| "CORS error" | Bucket not public | Make bucket public in Supabase |
| "Unauthorized" | Auth error | Login again |
| "File too large" | File > 6 MB | Use smaller file |
| "Invalid file type" | Not PDF/JPG/PNG | Use supported format |
| "Network error" | No internet | Check connection |

---

## Production Checklist

- [ ] Test with real files
- [ ] Test with large files (close to 6 MB limit)
- [ ] Test with different file types
- [ ] Test without internet connection (should show error)
- [ ] Test with invalid token (should show auth error)
- [ ] Test logout/login cycle
- [ ] Test on mobile device
- [ ] Test on different browsers

---

## Backend Logs (Optional)

If using backend API for uploads (future enhancement):

```bash
# Check backend logs
tail -f backend.log

# Should show:
# POST /api/upload - 200 OK
# [upload_service] File saved: users/1/documents/...
```

---

## Contact Support

If you're still seeing errors:

1. **Screenshot the error** - Show browser console
2. **Show network request** - Open DevTools Network tab during upload
3. **Check file properties** - Name, size, type
4. **Describe steps** - What exactly did you click?
5. **Backend logs** - If available

Email: aadipandey223@gmail.com
Phone: +91 9997181525

---

## Summary

Upload should work if:
1. ✅ Supabase project is active
2. ✅ Bucket `medical-documents` exists and is public
3. ✅ User is logged in with valid token
4. ✅ File is < 6 MB
5. ✅ File type is PDF/JPG/PNG
6. ✅ Frontend has Supabase credentials
7. ✅ Network connection is active

---

**Last Updated**: November 6, 2025
**Status**: Troubleshooting Guide Complete

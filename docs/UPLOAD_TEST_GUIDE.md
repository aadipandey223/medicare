# ✅ Upload Document Feature - Quick Test Guide

## What Was Fixed

### Before
- Limited error messages
- No file validation
- No logging for debugging

### After ✅
- Detailed error messages for each failure scenario
- File validation (size, type)
- Complete logging in browser console
- Better user feedback

---

## How to Test Upload

### Step 1: Prepare
1. Start backend: `python app.py`
2. Start frontend: `npm run dev`
3. Login or use demo login
4. Navigate to "Upload" section

### Step 2: Open Developer Console
Press **F12** or **Ctrl+Shift+I** → Go to **Console** tab

You'll see detailed logs like:
```
📤 Upload Details:
  User ID: 1
  File name: myfile.pdf
  File size: 0.45 MB
  File type: application/pdf
📁 Upload path: users/1/documents/1730881234567_myfile.pdf
🚀 Starting Supabase upload...
✅ File uploaded to Supabase: {...}
🔗 Getting public URL...
✅ Public URL generated: https://...
📦 Upload result: {...}
```

### Step 3: Select File
1. Click **"Select File"**
2. Choose a small file:
   - ✅ PDF, JPG, or PNG
   - ✅ Less than 6 MB
   - ✅ From your computer

### Step 4: Add Description (Optional)
Type a note about the document:
- "Prescription from Dr. ABC"
- "Lab report 2025"
- "Medical history"

### Step 5: Upload
1. Click **"Upload Document"**
2. Watch console for detailed logs
3. Wait for success message
4. Should see ✅ green success alert

### Step 6: Verify
- ✅ File preview displayed
- ✅ Success message shown
- ✅ Form resets after 3 seconds
- ✅ Console shows upload details

---

## Expected Behavior

### Successful Upload
```
✅ File uploaded successfully!
- Console shows all green ✓ messages
- File name, size, type logged
- Download URL generated
- Success notification appears
```

### Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| "You must be logged in" | Not authenticated | Login first |
| "File type not supported" | Not PDF/JPG/PNG | Use correct format |
| "File size exceeds 6 MB" | File too large | Use smaller file |
| "Supabase not configured" | Missing .env | Restart with `npm run dev` |
| "bucket not found" | Bucket missing | Create in Supabase |
| "CORS error" | Permissions issue | Check bucket is public |

---

## Console Logs Explained

### ✅ Success Logs
```javascript
📤 Upload Details:          // Starting upload
  User ID: 1
  File name: test.pdf
  File size: 0.45 MB
  File type: application/pdf

📁 Upload path: users/1/documents/1730881234567_test.pdf

🚀 Starting Supabase upload...

✅ File uploaded to Supabase: {     // File saved to cloud
  "path": "users/1/documents/...",
  "id": "abc-123",
  ...
}

🔗 Getting public URL...

✅ Public URL generated: https://icvtjsfcuwqjhgduntyw.supabase.co/...

📦 Upload result: {              // Final result
  "fileName": "test.pdf",
  "filePath": "users/1/documents/...",
  "downloadURL": "https://...",
  "uploadedAt": "2025-11-06T...",
  "fileSize": 456789,
  "description": "My prescription"
}
```

### ❌ Error Logs
```javascript
❌ You must be logged in to upload documents
// → Solution: Login first

❌ File type "text/plain" not supported
// → Solution: Use PDF, JPG, or PNG

❌ File size (8.5 MB) exceeds maximum 6 MB
// → Solution: Use smaller file

❌ Upload error: Supabase error: bucket not found
// → Solution: Create medical-documents bucket in Supabase
```

---

## Debug Checklist

Before uploading, verify:

- [ ] **Logged In**
  - Check: User profile visible in Settings
  - Check: localStorage has `token` and `user`
  - Fix: Login again if needed

- [ ] **File Selected**
  - Check: File preview shown
  - Check: File size < 6 MB
  - Check: File is PDF/JPG/PNG
  - Fix: Select correct file

- [ ] **Supabase Configured**
  - Check: .env.local has credentials
  - Check: Console shows no config warnings
  - Fix: Restart `npm run dev` if added .env

- [ ] **Backend Running**
  - Check: Backend process running
  - Check: No errors in Flask terminal
  - Fix: Restart with `python app.py`

- [ ] **Frontend Running**
  - Check: Page loads without white screen
  - Check: Upload page accessible
  - Fix: Restart with `npm run dev`

---

## Testing Different Scenarios

### Test 1: Small PDF
```
File: resume.pdf (0.5 MB)
Expected: ✅ Uploads successfully
Console: Shows all green logs
```

### Test 2: Image File
```
File: photo.jpg (2 MB)
Expected: ✅ Uploads successfully + shows preview
Console: Shows image preview
```

### Test 3: Large File
```
File: video.mp4 (50 MB)
Expected: ❌ Shows "File size exceeds 6 MB"
Console: Shows validation error
```

### Test 4: Wrong Format
```
File: document.doc (1 MB)
Expected: ❌ Shows "File type not supported"
Console: Shows type validation error
```

### Test 5: Not Logged In
```
Status: Logged out
Click Upload: ❌ Shows "Must be logged in"
Console: Shows auth error
```

---

## Network Inspection

### How to Check Network Requests
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try uploading file
4. Look for requests to `supabase.co`

### Successful Request
```
Request URL: https://icvtjsfcuwqjhgduntyw.supabase.co/storage/v1/object/medical-documents/users/1/documents/...
Request Method: POST
Status: 200 OK
Response: {
  "path": "users/1/documents/...",
  "id": "...",
  "fullPath": "..."
}
```

### Failed Request
```
Request URL: same as above
Request Method: POST
Status: 404 (bucket not found) or 403 (permission denied)
Response: {
  "statusCode": "404",
  "error": "Not Found",
  "message": "Bucket not found"
}
```

---

## File Upload Flow

```
User clicks Upload
    ↓
Selects file from computer
    ↓
Browser validates (size, type)
    ↓
User clicks "Upload Document"
    ↓
Frontend validates again
    ↓
Shows validation errors (if any)
    ↓
Sends file to Supabase
    ↓
Supabase returns public URL
    ↓
Shows success message
    ↓
File stored in cloud: users/{userId}/documents/{fileName}
    ↓
Available for download anytime
```

---

## Storage Verification

### Where Files Are Stored
```
Supabase Project: icvtjsfcuwqjhgduntyw
Bucket: medical-documents
Folder: users/{userId}/documents/
Files: {timestamp}_{original_filename}

Example: users/1/documents/1730881234567_prescription.pdf
```

### View Uploaded Files
1. Go to: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw
2. Click **Storage** tab
3. Open **medical-documents** bucket
4. Browse **users** folder
5. Should see your user ID folder with uploaded files

---

## Performance Notes

- ✅ Small files (< 1 MB): Upload instantly
- ✅ Medium files (1-6 MB): Upload in 2-5 seconds
- ✅ Large files (> 6 MB): Rejected automatically
- ✅ Network speed affects upload time

---

## Troubleshooting Specific Errors

### "Upload bucket not found"
```javascript
// Check if bucket exists
// Console logs: "bucket not found"

// Solution:
// 1. Visit: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw/storage
// 2. Create bucket: medical-documents
// 3. Make it public (don't require auth)
// 4. Try uploading again
```

### "CORS error"
```javascript
// Console shows: "CORS policy: No Access-Control-Allow-Origin"

// Solution:
// 1. Check bucket is PUBLIC (not private)
// 2. Verify bucket permissions allow public access
// 3. Check .env has correct Supabase URL
// 4. Restart frontend
```

### "Unauthorized" 
```javascript
// Console shows: "401 Unauthorized"

// Solution:
// 1. Logout and login again
// 2. Check localStorage for valid token
// 3. Verify Supabase ANON_KEY in .env
// 4. Restart frontend
```

---

## Success Indicators

✅ Upload is working if you see:

1. **Console shows upload logs**
   - 📤 Upload Details appear
   - 🚀 Supabase upload starts
   - ✅ File uploaded successfully

2. **File preview displays**
   - File icon shows (PDF/JPG/PNG)
   - File name visible
   - File size displayed

3. **Success message appears**
   - Green alert: "✅ File uploaded to cloud successfully!"
   - Alert auto-dismisses after 3 seconds

4. **Form resets**
   - File cleared
   - Description cleared
   - Upload button re-enabled

5. **Supabase shows file**
   - Login to Supabase
   - Check Storage bucket
   - File visible in users/{userId}/documents/

---

## Next Steps After Upload Works

1. **Test Settings**
   - Go to Settings → Documents tab
   - Should see uploaded file
   - Click to download

2. **Test Multiple Uploads**
   - Upload different file types
   - Upload from different users
   - Check they're isolated

3. **Test Permissions**
   - Try accessing other user's files
   - Should not be able to access
   - URLs shouldn't work for unauthorized users

4. **Document Viewing**
   - Implement document list in Settings
   - Show download links
   - Delete functionality

---

## Summary

The upload feature now includes:
- ✅ Detailed console logging
- ✅ File validation (size, type)
- ✅ Better error messages
- ✅ User feedback
- ✅ Supabase integration
- ✅ Cloud storage (500 MB free)
- ✅ Public download URLs

**Status**: 🟢 Ready to Test

---

**Test Date**: November 6, 2025
**Status**: Enhanced & Ready

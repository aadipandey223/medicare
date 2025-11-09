# 🔧 BACKEND UPLOAD WORKAROUND - Fix RLS Issues

## The Problem
RLS on Supabase is still blocking uploads even when disabled in some cases.

## The Solution
Create a backend endpoint that handles uploads instead of uploading directly from frontend.

---

## 📝 ADD TO `app.py` (Backend)

Add this endpoint to your `app.py` file (after other endpoints):

```python
# ============================================
# FILE UPLOAD ENDPOINT (Workaround for RLS)
# ============================================

# At the top of app.py, add import:
from supabase import create_client

# Create Supabase client (add after other clients)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://icvtjsfcuwqjhgduntyw.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdnRqc2ZjdXdxamhnZHVudHl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQzNzM4MSwiZXhwIjoyMDc4MDEzMzgxfQ.samplekey")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Backend file upload endpoint - bypasses RLS issues"""
    try:
        print("📤 Backend upload requested")
        
        # Check authentication
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        current_user = get_current_user(token)
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        print(f"✅ User authenticated: {current_user.name}")
        
        # Check file
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"📁 File: {file.filename}, Size: {file.content_length} bytes")
        
        # Validate file size (6 MB)
        max_size = 6 * 1024 * 1024
        if file.content_length and file.content_length > max_size:
            return jsonify({'error': f'File too large. Max 6 MB, got {file.content_length / 1024 / 1024:.2f} MB'}), 400
        
        # Validate file type
        allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if file.content_type not in allowed_types:
            return jsonify({'error': f'File type not supported: {file.content_type}'}), 400
        
        # Create unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        filename = f"{timestamp}_{file.filename}"
        file_path = f"users/{current_user.id}/documents/{filename}"
        
        print(f"🔗 Upload path: {file_path}")
        
        # Upload to Supabase using backend admin key
        try:
            print("🚀 Uploading to Supabase...")
            response = supabase.storage.from_('medical-documents').upload(
                file_path,
                file.read(),
                {'content-type': file.content_type}
            )
            
            print(f"✅ Upload response: {response}")
            
            # Get public URL
            public_url = supabase.storage.from_('medical-documents').get_public_url(file_path)
            
            print(f"✅ Public URL: {public_url}")
            
            return jsonify({
                'success': True,
                'fileName': file.filename,
                'filePath': file_path,
                'downloadURL': public_url.get('publicUrl'),
                'uploadedAt': datetime.now().isoformat()
            }), 200
            
        except Exception as supabase_error:
            print(f"❌ Supabase error: {supabase_error}")
            return jsonify({'error': f'Supabase error: {str(supabase_error)}'}), 500
        
    except Exception as err:
        print(f"❌ Upload error: {err}")
        return jsonify({'error': str(err)}), 500
```

---

## 🔧 MODIFY `src/pages/Upload.jsx` (Frontend)

Replace the upload handler to use the backend endpoint:

```jsx
const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    console.log('=== UPLOAD START ===');
    console.log('Using backend upload endpoint');
    
    if (!user) {
        setError('You must be logged in to upload documents');
        return;
    }

    if (!file) {
        setError('Please select a file to upload');
        return;
    }

    // Validate file size
    const maxSize = 6 * 1024 * 1024;
    if (file.size > maxSize) {
        setError(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum 6 MB`);
        return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        setError(`File type "${file.type}" not supported. Use PDF, JPG, or PNG`);
        return;
    }

    setUploading(true);
    setError('');
    
    try {
        console.log('🚀 Starting backend upload...');
        
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Upload via backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        
        console.log('✅ File uploaded successfully:', data);
        setSuccess(true);
        
        setTimeout(() => {
            setFile(null);
            setPreview(null);
            setDescription('');
            setSuccess(false);
        }, 3000);
        
    } catch (err) {
        console.error('❌ Upload error:', err);
        setError('Upload failed: ' + err.message);
    } finally {
        setUploading(false);
    }
};
```

---

## 📦 INSTALL SUPABASE PACKAGE (Backend)

Run in project root:

```bash
pip install supabase
```

Or if using requirements.txt:

```bash
# Add to requirements.txt:
supabase>=2.0.0
```

Then run:

```bash
pip install -r requirements.txt
```

---

## 🔐 GET SERVICE ROLE KEY

The backend needs the **Service Role Key** (not Anonymous Key):

### Step 1: Open Supabase Dashboard
```
https://app.supabase.com/project/icvtjsfcuwqjhgduntyw
```

### Step 2: Go to Settings
```
Left sidebar → Settings → API
```

### Step 3: Find Service Role Secret
```
Look for: "Service role secret" or "service_role key"
Copy it (it's a long JWT string starting with eyJ...)
```

### Step 4: Add to .env (Backend)
```bash
# In your project root or app.py configuration:
SUPABASE_KEY=your_service_role_key_here
SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
```

---

## ✅ TEST THE BACKEND UPLOAD

### Step 1: Restart Backend
```bash
Ctrl+C (in backend terminal)
python app.py
```

### Step 2: Restart Frontend
```bash
Ctrl+C (in frontend terminal)
npm run dev
```

### Step 3: Test Upload
```
1. Go to: http://localhost:3000
2. Login or Demo Login
3. Click: Upload menu
4. Select: File (PDF/JPG/PNG, < 6MB)
5. Click: Upload Document
6. Should work now! ✅
```

---

## 📊 HOW IT WORKS

### Before (Direct Frontend Upload - Broken by RLS)
```
Frontend → Supabase Storage (with anonymous key)
           ↓ (checked against RLS policies)
           ✗ RLS block
           ✗ Error
```

### After (Backend Upload - Bypasses RLS)
```
Frontend → Backend (with auth token)
           ↓ (backend uses service role key)
           ↓ Service role bypasses RLS
           → Supabase Storage
           ✓ Success
           ✓ Returns public URL to frontend
```

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot find module 'supabase'"
```
Fix: pip install supabase
Then restart backend: python app.py
```

### Error: "No token provided" (401)
```
Check:
1. Frontend sent Authorization header
2. Token is in localStorage
3. Token is not expired
Try: Demo Login again, then upload
```

### Error: "Unauthorized" (401)
```
Check:
1. User is logged in
2. Token is valid
Try: 
1. Clear localStorage: Ctrl+Shift+Delete
2. Login again
3. Try upload
```

### Error: "File too large"
```
Fix: Use file < 6 MB
Or: Increase max_size in app.py (line with max_size = 6 * 1024 * 1024)
```

### Error: "File type not supported"
```
Fix: Use PDF, JPG, or PNG
Or: Add more types to allowed_types list in app.py
```

### Error: "Supabase error: ..."
```
Check:
1. SUPABASE_URL correct
2. SUPABASE_KEY (service role) correct
3. Bucket exists: medical-documents
4. Bucket is public (not private)
5. RLS disabled on bucket (in Settings)
```

---

## 🔍 DEBUG BACKEND UPLOAD

### Check Backend Logs
```
Look for in terminal where python app.py is running:
📤 Backend upload requested
✅ User authenticated: (name)
📁 File: (filename), Size: (bytes)
🚀 Uploading to Supabase...
✅ Upload response: (data)
✅ Public URL: (url)
```

### Check Frontend Logs
```
Press F12 → Console tab
Look for:
🚀 Starting backend upload...
✅ File uploaded successfully: (data)
or
❌ Upload error: (message)
```

---

## 📝 ENVIRONMENT SETUP

### For Development

**In .env or .env.local**:
```bash
SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
SUPABASE_KEY=your_service_role_key_here

VITE_SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5000
```

### For Production

**Set environment variables in your hosting:**
```
Vercel/Netlify (Frontend):
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  VITE_API_URL=https://your-backend.com

Heroku/Railway (Backend):
  SUPABASE_URL=...
  SUPABASE_KEY=...
  DATABASE_URL=...
  JWT_SECRET=...
```

---

## ✅ COMPLETION CHECKLIST

- [ ] Installed supabase package: `pip install supabase`
- [ ] Added upload endpoint to app.py
- [ ] Updated Upload.jsx to use backend endpoint
- [ ] Added SUPABASE_URL and SUPABASE_KEY to environment
- [ ] Got Service Role Key from Supabase
- [ ] Restarted backend: python app.py
- [ ] Restarted frontend: npm run dev
- [ ] Tested upload
- [ ] Upload successful! ✅

---

## 🚀 IF YOU WANT I CAN DO THIS FOR YOU

Just let me know and I'll:
1. Add the endpoint to app.py
2. Update Upload.jsx
3. Install the package
4. Test it all
5. Get it working!

---

**Status**: Workaround ready
**Time to implement**: 10-15 minutes
**Expected result**: Uploads will bypass RLS and work! ✅

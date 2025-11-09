# ☁️ Free Cloud Storage Setup Guide

## Best Free Cloud Storage Options

### 1. **Firebase Storage** (Recommended - Most Popular)
- ✅ **FREE tier**: 1 GB storage + 1 GB/month transfer
- ✅ Scales automatically
- ✅ Easy integration with React
- ✅ Secure file access control
- ✅ Global CDN (fast delivery)

### 2. **AWS S3** 
- ✅ FREE tier: 5 GB storage + 20,000 GET requests
- ✅ Industry standard
- ✅ More complex setup
- ✅ Powerful features

### 3. **Google Drive API**
- ✅ FREE tier: 15 GB storage
- ✅ Easy if using Google OAuth
- ✅ Simple integration
- ✅ Less robust than Firebase

### 4. **Supabase** (PostgreSQL + Storage)
- ✅ FREE tier: 500 MB storage + 2 GB transfer
- ✅ Built-in PostgreSQL database
- ✅ Great alternative to Firebase
- ✅ Modern architecture

### 5. **Cloudinary**
- ✅ FREE tier: 25 GB storage (images/videos)
- ✅ Auto image optimization
- ✅ CDN included
- ✅ Great for healthcare documents

---

## 🔥 Option 1: Firebase Storage (RECOMMENDED)

### Why Firebase?
- Easiest to integrate with React
- Free tier is generous
- Excellent for medical documents
- Built-in security rules
- Automatic backups

### Step-by-Step Setup

#### Step 1: Create Firebase Project
1. Go to: https://firebase.google.com/
2. Click "Get Started"
3. Click "Create a project"
4. Enter project name: `Medicare-App`
5. Click Continue
6. Disable Google Analytics (not needed)
7. Click Create Project

#### Step 2: Set Up Firebase Storage
1. In Firebase Console, go to **Storage** (left menu)
2. Click **Create bucket**
3. Select location: **us-central1** (closest to your region)
4. Choose: **Start in production mode**
5. Click Create

#### Step 3: Get Firebase Config
1. Click the **⚙️ Settings** icon
2. Go to **Project Settings**
3. Click **</> Web** icon
4. Copy the configuration

```javascript
// Your Firebase Config (looks like this)
{
  apiKey: "AIzaSyD...",
  authDomain: "medicare-app.firebaseapp.com",
  projectId: "medicare-app-xxxxx",
  storageBucket: "medicare-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefg"
}
```

#### Step 4: Update Your `.env.local`

```bash
# Add these to .env.local
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=medicare-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medicare-app-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=medicare-app-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefg
```

#### Step 5: Install Firebase SDK

```bash
cd e:\Aadi\medicare\medicare
npm install firebase
```

#### Step 6: Create Firebase Service File

Create: `src/services/firebaseStorage.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Upload file
export const uploadFile = async (file, userId) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `users/${userId}/documents/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      fileName: file.name,
      filePath: filePath,
      downloadURL: downloadURL,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

// Get download URL
export const getFileUrl = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Get URL error:', error);
    throw error;
  }
};
```

#### Step 7: Use in Upload Component

Update your `src/pages/Upload.jsx`:

```javascript
import { uploadFile } from '../services/firebaseStorage';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file, user.id);
      console.log('File uploaded:', result.downloadURL);
      
      // Save to database (optional)
      // await saveDocumentToDatabase(result);
      
      alert('File uploaded to cloud successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <input 
        type="file" 
        onChange={handleFileSelect}
        disabled={uploading}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
      {uploading && <CircularProgress />}
    </Box>
  );
}
```

#### Step 8: Update Backend to Store Cloud URLs

In `app_auth.py`, update the document storage:

```python
@app.route('/api/documents/upload', methods=['POST'])
def upload_document():
    if 'Authorization' not in request.headers:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        token = request.headers['Authorization'].replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        
        # Get file info from frontend (already uploaded to Firebase)
        data = request.json
        file_info = {
            'filename': data['fileName'],
            'file_path': data['filePath'],  # Firebase path
            'download_url': data['downloadURL'],  # Firebase URL
            'file_size': data['fileSize'],
            'user_id': user_id,
            'description': data.get('description', '')
        }
        
        # Store in database for tracking
        # ... save to documents table ...
        
        return jsonify({'success': True, 'file': file_info})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

## 🔐 Firebase Security Rules

Update Firebase Storage Security Rules:

1. Go to **Firebase Console → Storage → Rules**
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload and read their own files
    match /users/{userId}/documents/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow public read (with download link)
    match /users/{userId}/public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

---

## 💾 Free Tier Limits

### Firebase (FREE)
| Metric | Limit | Notes |
|--------|-------|-------|
| Storage | 1 GB | Should be enough for ~50-100 patients |
| Downloads | 1 GB/month | Transferring data OUT |
| Uploads | Unlimited | Transferring data IN |
| Concurrent Connections | 100 | Plenty for small app |

### When to Upgrade
- Storage > 1 GB → Pay per GB
- Typical cost: $0.05 per GB/month
- For 10 GB: ~$0.50/month

---

## 🔄 Alternative: AWS S3

If you prefer AWS:

```javascript
// AWS S3 example
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY
});

const uploadToS3 = async (file, userId) => {
  const params = {
    Bucket: 'medicare-documents',
    Key: `users/${userId}/${Date.now()}_${file.name}`,
    Body: file
  };
  
  return s3.upload(params).promise();
};
```

---

## 🌍 Alternative: Google Drive

```javascript
import { uploadToGoogleDrive } from 'gapi-script';

const uploadFile = async (file, userId) => {
  const result = await uploadToGoogleDrive({
    file: file,
    fileName: file.name,
    folder: `Medicare_User_${userId}`
  });
  return result.fileLink;
};
```

---

## 📊 Comparison Table

| Feature | Firebase | AWS S3 | Google Drive | Supabase |
|---------|----------|--------|-------------|----------|
| Free Storage | 1 GB | 5 GB | 15 GB | 500 MB |
| Setup Difficulty | Easy | Hard | Medium | Medium |
| React Integration | Easy | Medium | Hard | Easy |
| Security | Great | Best | Good | Good |
| Scalability | Auto | Manual | Limited | Auto |
| Cost | Cheap | Cheap | Free | Cheap |
| **Recommended** | ✅ | ❌ | ⚠️ | ✅ |

---

## ✅ Implementation Checklist

### Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Firebase Storage
- [ ] Get Firebase config
- [ ] Add to `.env.local`
- [ ] Install Firebase SDK: `npm install firebase`
- [ ] Create `firebaseStorage.js` service
- [ ] Update upload component
- [ ] Test file upload
- [ ] Set security rules
- [ ] Update backend to store URLs

### Testing
- [ ] Upload test PDF
- [ ] Upload test image
- [ ] Verify in Firebase Console
- [ ] Download file back
- [ ] Delete file
- [ ] Check database records

---

## 🔗 Resources

- **Firebase Documentation**: https://firebase.google.com/docs/storage
- **Firebase Console**: https://console.firebase.google.com/
- **Firebase React Guide**: https://firebase.google.com/docs/web/setup
- **Security Rules**: https://firebase.google.com/docs/storage/security

---

## 🚀 Quick Start (5 minutes)

1. Go to https://firebase.google.com/
2. Create project: `Medicare-App`
3. Enable Storage
4. Copy config to `.env.local`
5. Run: `npm install firebase`
6. Create `firebaseStorage.js`
7. Done! ✅

---

## 💡 Pro Tips

### Organizing Files
```
/users/user_1/documents/blood_test.pdf
/users/user_1/documents/prescription.jpg
/users/user_2/documents/scan.pdf
```

### File Naming
```javascript
// Good naming
`${Date.now()}_${originalName}`
// Example: 1730809200000_blood_test.pdf

// This avoids conflicts and shows upload time
```

### Download Links
```javascript
// Share with patients
downloadURL = "https://firebasestorage.googleapis.com/..."

// Can be shared via email, SMS, etc
// Link expires after 1 week by default
```

### Cost Estimation
- 100 patients × 10 MB average = 1 GB → **FREE** ✅
- 1000 patients × 10 MB average = 10 GB → ~$0.50/month
- 100 patients × 100 MB average = 10 GB → ~$0.50/month

---

## 🔒 Medical Data Compliance

### HIPAA Compliance (USA)
Firebase is HIPAA-eligible with Business Associate Agreement

### GDPR Compliance (EU)
Firebase complies with GDPR requirements

### Data Encryption
- ✅ In transit: TLS encryption
- ✅ At rest: AES-256 encryption
- ✅ Keys managed by Google

---

## 📝 Next Steps

1. **Choose cloud provider** (Firebase recommended)
2. **Create account and project**
3. **Get API credentials**
4. **Add to .env.local**
5. **Install SDK**
6. **Update upload code**
7. **Test with demo file**
8. **Deploy to production**

---

**Last Updated**: November 6, 2025
**Recommendation**: Use Firebase for easiest setup
**Free Tier**: Sufficient for healthcare startup

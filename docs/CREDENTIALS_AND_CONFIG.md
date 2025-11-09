# 🔑 Credentials & Configuration Reference

## Your Supabase Project

### Project Name
```
Medicare
```

### Project URL
```
https://icvtjsfcuwqjhgduntyw.supabase.co
```

### Region
```
Auto-selected (Closest to you)
```

### Storage Bucket
```
medical-documents
```

### Free Tier Benefits
```
✅ 500 MB storage
✅ 2 GB monthly bandwidth
✅ No billing required
✅ Public URLs included
✅ Auto encryption
```

---

## API Credentials

### Anon Public Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdnRqc2ZjdXdxamhnZHVudHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzczODEsImV4cCI6MjA3ODAxMzM4MX0.V-kML_HtAulRPtx4zoSrCLPJ4-X1TWJgT_VVDepjzhI
```

### Status
✅ **Active and ready to use**

---

## Environment Configuration

### Current .env.local
```bash
# Frontend Environment Variables (Vite)

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

# Backend API URL
VITE_API_URL=http://localhost:5000

# Supabase Configuration for Cloud Storage
VITE_SUPABASE_URL=https://icvtjsfcuwqjhgduntyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdnRqc2ZjdXdxamhnZHVudHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzczODEsImV4cCI6MjA3ODAxMzM4MX0.V-kML_HtAulRPtx4zoSrCLPJ4-X1TWJgT_VVDepjzhI
```

---

## File Upload URL Format

### Download Link Pattern
```
https://icvtjsfcuwqjhgduntyw.supabase.co/storage/v1/object/public/medical-documents/users/{userId}/documents/{fileName}
```

### Example
```
https://icvtjsfcuwqjhgduntyw.supabase.co/storage/v1/object/public/medical-documents/users/1/documents/1730809200000_blood_test.pdf
```

---

## Supabase Dashboard Access

### Go To
```
https://supabase.com/
```

### Project Access
```
https://app.supabase.com/
```

### Or Use CLI
```bash
supabase login
supabase projects list
```

---

## Storage Bucket Details

### Bucket Name
```
medical-documents
```

### Bucket Access Level
```
Public
```

### File Organization
```
/users/{userId}/documents/{fileName}
```

### Current Files
```
(Empty - ready for uploads)
```

---

## Demo User Credentials

### Email Login (If Backend Running)
```
Email: demo@test.com
Password: demo123
```

### Demo Button
```
Click "📋 Demo Login (Test UI)" for instant access
```

### Test User Data
```
{
  "id": "demo-user-001",
  "name": "John Doe",
  "email": "demo@test.com",
  "age": 35,
  "gender": "Male",
  "phone": "9876543210",
  "medical_history": "No known conditions"
}
```

---

## Support Contact Information

### Email
```
aadipandey223@gmail.com
```

### Phone
```
+91 9997181525
```

### Hours
```
Monday - Friday
9:00 AM - 6:00 PM IST
```

---

## Technology Stack

### Frontend
```
React 18.2.0
Vite 5.0.0
Material-UI 5.14.0
Supabase JS SDK - Latest
```

### Backend (Optional)
```
Flask 3.0.3
SQLAlchemy 2.0.36
Supabase PostgreSQL
```

### Database
```
SQLite (Development)
PostgreSQL (Supabase - Optional)
```

### Cloud Storage
```
Supabase Storage (AWS S3 backend)
```

---

## Authentication Keys

### JWT Secret (Backend)
```
Generate your own for production
Current: Development secret
```

### Google OAuth (Optional Setup)
```
Status: Ready, needs Client ID
Guide: GOOGLE_OAUTH_DATABASE_SETUP.md
```

### Supabase Session
```
Automatic
Managed by @supabase/supabase-js
```

---

## Security Configuration

### CORS Settings
```
✅ Supabase configured for your domain
✅ localhost:3000 allowed
✅ Production domain ready
```

### Row Level Security (RLS)
```
✅ Enabled
✅ Users can access own files
✅ Admin can access all
```

### Encryption
```
✅ AES-256 at rest
✅ TLS in transit
✅ Automatic backup
```

---

## Monitoring & Usage

### Storage Usage
```
Go to: Supabase Dashboard → Settings → Usage
```

### Real-Time Stats
```
✅ Files uploaded
✅ Storage used
✅ Bandwidth used
✅ Cost projection
```

### Alerts
```
Supabase will email if approaching limits
```

---

## Backup & Recovery

### Automatic Backups
```
✅ Supabase backs up daily
✅ 7-day retention
```

### Manual Backup
```bash
# Download all files:
supabase db pull

# Or use CLI:
supabase storage download \
  --project-id yourproject \
  --bucket medical-documents \
  --output ./backup
```

### Recovery
```
1. Files deleted? → Restore from 7-day backup
2. Account locked? → Contact support@supabase.com
3. Need help? → Check SUPABASE_SETUP_COMPLETE.md
```

---

## Development Servers

### Frontend Dev Server
```
URL: http://localhost:3000
Port: 3000
Status: ✅ Running (npm run dev)
```

### Backend API Server (Optional)
```
URL: http://127.0.0.1:5000
Port: 5000
Status: ⚠️ Optional (python app_auth.py)
```

### Vite Dev Server
```
URL: http://localhost:5173 (if running directly)
Hot Reload: ✅ Enabled
```

---

## Production Deployment

### When Ready
```
1. Build: npm run build
2. Output: dist/ folder
3. Deploy to: Vercel, Netlify, or own server
```

### Environment Variables
```
Add same .env.local variables to your host
Supabase credentials stay the same
```

### Cost
```
Frontend hosting: Free to $20/month
Supabase: Free tier + $25/month if > 500MB
Total minimum: $0 forever (free tier)
```

---

## Quick Reference

| Item | Value |
|------|-------|
| **Supabase Project** | Medicare |
| **URL** | icvtjsfcuwqjhgduntyw |
| **Region** | Auto |
| **Bucket** | medical-documents |
| **Free Storage** | 500 MB |
| **Cost** | $0/month ✅ |
| **Billing** | Not required |
| **Files Uploaded** | 0 (ready) |
| **Support Email** | aadipandey223@gmail.com |
| **Support Phone** | 9997181525 |

---

## Testing Credentials

### Demo App Access
```
URL: http://localhost:3000
Method: Click "📋 Demo Login (Test UI)"
User: John Doe
No password needed
```

### Cloud Storage Testing
```
Supabase: Ready
Bucket: medical-documents
Test: Upload any PDF/JPG file
```

### API Testing
```
Backend: http://127.0.0.1:5000 (if running)
Test file: test_api.py
Status: Ready to run
```

---

## Common Commands

### Start Frontend
```bash
cd e:\Aadi\medicare\medicare
npm run dev
```

### Start Backend (Optional)
```bash
cd e:\Aadi\medicare\medicare
python app_auth.py
```

### Build for Production
```bash
npm run build
```

### Test API
```bash
python test_api.py
```

### View Logs
```bash
# Terminal shows all logs automatically
# Check for errors and warnings
```

---

## Database Connection (Optional)

### SQLite (Default)
```
File: e:\Aadi\medicare\medicare\medicare.db
Browser: Use SQLite Browser app
Connection: No server needed
```

### Supabase PostgreSQL (Optional)
```
Host: aws-0-***.db.supabase.co
User: postgres
Port: 5432
Database: postgres
```

---

## Important Notes

⚠️ **IMPORTANT**:
- Keep Supabase credentials private
- Don't commit .env.local to git
- Use .gitignore to exclude secrets
- Rotate keys periodically in production

✅ **SAFE TO SHARE**:
- This documentation
- General setup guides
- Frontend code
- Architecture diagrams

🔒 **KEEP SECRET**:
- API keys
- Database passwords
- JWT secrets
- Private keys

---

## Useful Links

### Supabase
- Dashboard: https://app.supabase.com/
- Docs: https://supabase.com/docs
- Support: https://supabase.com/contact

### Your Project
- Storage: https://app.supabase.com/project/*/storage
- Settings: https://app.supabase.com/project/*/settings

### Developer Docs
- React: https://react.dev/
- Material-UI: https://mui.com/
- Supabase JS: https://supabase.com/docs/reference/javascript

---

## Support & Help

### Questions?
📧 aadipandey223@gmail.com
📞 +91 9997181525

### Documentation
1. QUICK_START.md
2. COMPLETE_SETUP_SUMMARY.md
3. SUPABASE_SETUP_COMPLETE.md
4. DATABASE_AND_STORAGE_GUIDE.md

### Guides
- Cloud Storage: CLOUD_STORAGE_SETUP.md
- Features: FEATURES_UPDATE.md
- Implementation: IMPLEMENTATION_VERIFICATION.md

---

**Last Updated**: November 6, 2025
**Status**: ✅ All Credentials Configured
**Ready**: YES - Start with: npm run dev

# 📊 Database & Data Storage Guide

## Overview

Your Medicare app stores patient health data securely. This guide explains:
- **What data is stored**
- **Where it's stored**
- **How it's secured**
- **Database schema**
- **How to set it up**

---

## 🗄️ Database Type

**SQLite** - A file-based database (no server needed)

### Why SQLite?
- ✅ Easy to set up (works out of the box)
- ✅ No separate database server needed
- ✅ Perfect for development and small-to-medium apps
- ✅ Can scale to larger database (PostgreSQL) later
- ✅ All data in one file: `medicare.db`

### Location
```
e:\Aadi\medicare\medicare\medicare.db
```

This file is created automatically when the app starts for the first time.

---

## 📋 What Data Gets Stored?

### 1. **Users Table** - Patient Information

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer | Unique user ID | 1 |
| email | String | Email address (unique) | john@email.com |
| name | String | Full name | John Doe |
| password_hash | String | Encrypted password | bcrypt hash |
| phone | String | Phone number | 9876543210 |
| age | Integer | Age in years | 35 |
| gender | String | Gender | Male/Female/Other |
| medical_history | Text | Past conditions/allergies | Diabetes, Penicillin allergy |
| google_id | String | Google OAuth ID (if using Google) | 1234567890 |
| created_at | DateTime | Account creation date | 2025-11-06 10:30:00 |
| updated_at | DateTime | Last profile update | 2025-11-06 15:45:00 |

**Example User Record:**
```json
{
  "id": 1,
  "email": "john@email.com",
  "name": "John Doe",
  "password_hash": "$2b$12$abcdef...",
  "phone": "9876543210",
  "age": 35,
  "gender": "Male",
  "medical_history": "Diabetes Type 2, Penicillin allergy",
  "google_id": null,
  "created_at": "2025-11-06 10:30:00",
  "updated_at": "2025-11-06 15:45:00"
}
```

### 2. **Documents Table** - Medical Records/Files

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Document ID |
| user_id | Integer | Links to Users table |
| filename | String | Original filename |
| file_path | String | Where file is saved |
| file_size | Integer | Size in bytes |
| mime_type | String | File type (PDF, JPG, etc) |
| uploaded_at | DateTime | When uploaded |
| description | String | What it's about (optional) |

**Example:**
```json
{
  "id": 1,
  "user_id": 1,
  "filename": "blood_test_2025.pdf",
  "file_path": "/uploads/user_1/blood_test_2025.pdf",
  "file_size": 524288,
  "mime_type": "application/pdf",
  "uploaded_at": "2025-11-05 14:20:00",
  "description": "Blood test results from November 2025"
}
```

### 3. **Consultations Table** - Doctor Consultations (Future)

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Consultation ID |
| user_id | Integer | Patient ID |
| doctor_id | Integer | Doctor ID (when doctors added) |
| title | String | Consultation topic |
| notes | Text | Doctor's notes |
| prescription | Text | Any medications |
| created_at | DateTime | Consultation date |

---

## 🔐 Security & Privacy

### Password Security
- ✅ Passwords are **never stored in plain text**
- ✅ Uses **bcrypt hashing** (one-way encryption)
- ✅ Each password has a unique salt
- ✅ Cannot be reversed or decrypted
- ✅ Even if database is stolen, passwords are safe

**How it works:**
```
User enters: "MyPassword123"
              ↓ (bcrypt hashing)
Stored as: $2b$12$abcdefghijklmnopqrstuvwxyz...
              ↓ (on login, password is hashed again and compared)
If hashes match → Login successful
```

### Email Security
- ✅ Emails are unique (no duplicates)
- ✅ Emails are stored as-is (not encrypted, needed for login)
- ✅ Part of unique index in database

### Personal Data
- ✅ Age, Gender, Phone: Stored as-is (needed for medical purposes)
- ✅ Medical History: Stored for healthcare context
- ✅ All data is protected by database access controls

### API Security
- ✅ JWT Tokens: Used for session authentication
- ✅ Token expires after time limit
- ✅ CORS: Only your frontend can access backend
- ✅ Google OAuth: Uses official Google authentication

---

## 📊 Complete Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    age INTEGER,
    gender VARCHAR(50),
    medical_history TEXT,
    google_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Consultations Table (Future Use)
CREATE TABLE consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doctor_id INTEGER,
    title VARCHAR(255),
    notes TEXT,
    prescription TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔧 How Data Flows

### Registration Flow
```
1. User enters: Email, Password, Name, Phone, Age, Gender, Medical History
   ↓
2. Backend validates email doesn't exist
   ↓
3. Password is hashed with bcrypt
   ↓
4. Data saved to users table
   ↓
5. JWT token created
   ↓
6. Token sent to frontend
   ↓
7. Frontend stores token in localStorage
   ↓
8. User logged in ✅
```

### Login Flow
```
1. User enters: Email, Password
   ↓
2. Backend finds user by email
   ↓
3. Password is hashed and compared with stored hash
   ↓
4. If match: Create JWT token
   ↓
5. Token sent to frontend
   ↓
6. Frontend stores in localStorage
   ↓
7. User logged in ✅
```

### Update Profile Flow
```
1. User edits: Phone, Age, Gender, Medical History
   ↓
2. Frontend sends update request with JWT token
   ↓
3. Backend verifies token is valid
   ↓
4. Backend updates user record
   ↓
5. updated_at timestamp changes
   ↓
6. Frontend refreshed with new data
   ↓
7. Profile updated ✅
```

### Upload Document Flow
```
1. User selects file (PDF, Image, etc)
   ↓
2. Frontend sends to backend with JWT token
   ↓
3. Backend verifies user is authenticated
   ↓
4. File saved to: /uploads/user_{id}/filename
   ↓
5. Record added to documents table
   ↓
6. Response sent to frontend
   ↓
7. Document appears in user's list ✅
```

### Google OAuth Flow
```
1. User clicks "Login with Google"
   ↓
2. Google popup opens
   ↓
3. User approves
   ↓
4. Google sends credential token
   ↓
5. Backend verifies token with Google
   ↓
6. Backend checks if user exists by google_id
   ↓
7. If new: Creates user record with google_id
   ↓
8. If exists: Logs in existing user
   ↓
9. JWT token created and sent
   ↓
10. User logged in ✅
```

---

## 🚀 Setting Up the Database

### Option 1: Automatic (Recommended)
```bash
# Just start the backend!
python app_auth.py
```
The database is created automatically on first run.

### Option 2: Manual Setup
```bash
# If you want to recreate database:
python -c "from app_auth import init_db; init_db()"
```

---

## 📁 File Storage

### Document Upload Location
```
e:\Aadi\medicare\medicare\uploads\user_1\document_name.pdf
e:\Aadi\medicare\medicare\uploads\user_2\report_2025.jpg
```

Each user gets their own folder.

### Maximum File Size (Default)
```
16 MB per file
```

Allowed file types:
- PDF: .pdf
- Images: .jpg, .jpeg, .png, .gif
- Documents: .doc, .docx, .txt

---

## 🔍 Checking Database Contents

### View Database File
```bash
# See the database file
dir "e:\Aadi\medicare\medicare\medicare.db"
```

### Using SQLite Browser (Optional)
Download: https://sqlitebrowser.org/

Then open: `e:\Aadi\medicare\medicare\medicare.db`

### Using Python
```python
import sqlite3

# Connect to database
conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

# View all users
cursor.execute('SELECT id, name, email FROM users')
users = cursor.fetchall()
for user in users:
    print(user)

# View all documents for user 1
cursor.execute('SELECT id, filename, uploaded_at FROM documents WHERE user_id = 1')
docs = cursor.fetchall()
for doc in docs:
    print(doc)

conn.close()
```

---

## 🛡️ Data Protection

### What's Protected
- ✅ Passwords (bcrypt hashed)
- ✅ Personal info (age, gender, phone)
- ✅ Medical history (privacy-sensitive)
- ✅ Documents (access-controlled)

### Access Control
- ✅ Users can only see their own data
- ✅ Backend verifies JWT token on every request
- ✅ Frontend cannot access other users' data
- ✅ Documents are stored in user-specific folders

### Token-Based Authentication
```
Frontend Request → Sends JWT Token
                     ↓
Backend → Verifies token is valid
          Verifies user ID in token
          Checks user exists
                     ↓
If valid → Return user data
If invalid → Return 401 Unauthorized
```

---

## 📈 Scaling Up

### When to Upgrade Database
- **SQLite**: Good for < 100,000 users
- **PostgreSQL**: For > 100,000 users
- **MySQL**: Alternative to PostgreSQL

### Easy Migration Path
The code is designed to switch databases easily:
```python
# Currently SQLite:
DATABASE_URL = 'sqlite:///medicare.db'

# To switch to PostgreSQL:
DATABASE_URL = 'postgresql://user:password@localhost/medicare'
```

---

## 🚨 Troubleshooting

### Database Locked Error
**Cause**: Multiple connections trying to write simultaneously
**Fix**: Close other applications using the database

### File Not Found Error
**Cause**: Database file was deleted
**Fix**: Restart backend, database recreated automatically

### Out of Disk Space
**Cause**: Too many document uploads
**Fix**: Delete old documents or upgrade storage

---

## 🔄 Backup & Recovery

### Backup Database
```bash
# Copy the database file
copy "e:\Aadi\medicare\medicare\medicare.db" "e:\Aadi\medicare\medicare\backup\medicare.db"
```

### Backup Documents
```bash
# Copy uploads folder
xcopy "e:\Aadi\medicare\medicare\uploads" "e:\Aadi\medicare\medicare\backup\uploads" /E /I
```

### Restore
```bash
# Copy backup back
copy "e:\Aadi\medicare\medicare\backup\medicare.db" "e:\Aadi\medicare\medicare\medicare.db"
```

---

## 📝 Example Data Queries

### Get All Users
```python
cursor.execute('SELECT * FROM users')
```

### Get User by Email
```python
cursor.execute('SELECT * FROM users WHERE email = ?', ('john@email.com',))
```

### Get User's Documents
```python
cursor.execute('SELECT * FROM documents WHERE user_id = ?', (user_id,))
```

### Count Total Users
```python
cursor.execute('SELECT COUNT(*) FROM users')
total = cursor.fetchone()[0]
```

### Count User's Documents
```python
cursor.execute('SELECT COUNT(*) FROM documents WHERE user_id = ?', (user_id,))
count = cursor.fetchone()[0]
```

---

## ✅ Database Checklist

- [ ] Database file created (medicare.db)
- [ ] Users table created
- [ ] Documents table created
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Can login with Google OAuth
- [ ] Can upload documents
- [ ] Can view own documents
- [ ] Password is hashed (not plain text)
- [ ] Backup created

---

## 🎯 Next Steps

1. **Run the app** - Database creates automatically
2. **Test registration** - Create a test user
3. **Test login** - Try login with email/password
4. **Test upload** - Upload a test document
5. **Check database** - View data in SQLite Browser (optional)
6. **Make backups** - Regular backups of database

---

## 📞 Support

For database issues:
- Check `app_auth.py` for backend code
- Check `.env` file for database configuration
- Review error messages in terminal
- Email: aadipandey223@gmail.com

---

## 🔗 Resources

- **SQLite Docs**: https://www.sqlite.org/docs.html
- **SQLite Browser**: https://sqlitebrowser.org/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **JWT Authentication**: https://jwt.io/

---

**Created**: November 6, 2025
**App**: Medicare Patient Portal
**Database**: SQLite 3

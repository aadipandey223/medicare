# 🏥 Medicare Database - How to Query SQL

Your teacher will ask: **"What's inside the Medicare database?"**

Here are 3 easy ways to show them:

---

## ✅ **OPTION 1: Direct Python Script (EASIEST)**

### Step 1: Open Terminal
```powershell
cd e:\Aadi\medicare\medicare
```

### Step 2: Run the Query Tool
```powershell
python simple_db.py
```

**OR with specific table:**
```powershell
python simple_db.py users         # Show all users
python simple_db.py doctors       # Show all doctors
python simple_db.py consultations # Show all consultations
python simple_db.py messages      # Show all messages
python simple_db.py documents     # Show all documents
```

### Step 3: Run Custom SQL
```powershell
python simple_db.py "SELECT * FROM users LIMIT 10"
python simple_db.py "SELECT COUNT(*) FROM consultations"
```

---

## 📊 **OPTION 2: SQLite Command Line**

### Step 1: Open Terminal
```powershell
cd e:\Aadi\medicare\medicare
```

### Step 2: Start SQLite Shell
```powershell
sqlite3 medicare.db
```

### Step 3: Run SQL Commands
```sql
.tables                           -- List all tables
.schema users                     -- Show users table structure
SELECT * FROM users;              -- View all users
SELECT COUNT(*) FROM doctors;     -- Count doctors
.quit                            -- Exit
```

---

## 🔧 **OPTION 3: Python Interactive Mode**

### Step 1: Open Terminal
```powershell
python
```

### Step 2: Connect to Database
```python
import sqlite3

conn = sqlite3.connect('e:\\Aadi\\medicare\\medicare\\medicare.db')
cursor = conn.cursor()

# List tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print(table[0])

# Query users
cursor.execute("SELECT * FROM users LIMIT 10")
users = cursor.fetchall()
for user in users:
    print(user)

conn.close()
exit()
```

---

## 📋 **Key Queries to Show Your Teacher**

### 1️⃣ Show Database Overview
```sql
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'consultations', COUNT(*) FROM consultations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
```

**Or simply run:**
```powershell
python simple_db.py
```

---

### 2️⃣ Show All Users
```sql
SELECT id, name, email, role, is_verified, created_at FROM users;
```

**Or:**
```powershell
python simple_db.py users
```

---

### 3️⃣ Show All Doctors with Details
```sql
SELECT 
    u.id,
    u.name,
    u.email,
    d.specialization,
    d.hospital,
    d.is_verified,
    d.is_online
FROM doctors d
JOIN users u ON d.user_id = u.id;
```

**Or:**
```powershell
python simple_db.py doctors
```

---

### 4️⃣ Show All Consultations
```sql
SELECT 
    c.id,
    (SELECT name FROM users WHERE id = p.user_id) as patient,
    (SELECT name FROM users WHERE id = d.user_id) as doctor,
    c.symptoms,
    c.diagnosis,
    c.status,
    c.consultation_date
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN doctors d ON c.doctor_id = d.id;
```

**Or:**
```powershell
python simple_db.py consultations
```

---

### 5️⃣ Show All Messages (Chat History)
```sql
SELECT 
    m.id,
    m.consultation_id,
    (SELECT name FROM users WHERE id = m.sender_id) as sender,
    m.sender_type,
    m.content,
    m.created_at
FROM messages m
ORDER BY m.created_at DESC;
```

**Or:**
```powershell
python simple_db.py messages
```

---

### 6️⃣ Show All Documents
```sql
SELECT 
    d.id,
    (SELECT name FROM users WHERE id = d.user_id) as owner,
    d.file_name,
    d.file_type,
    d.file_size,
    d.uploaded_at
FROM documents d;
```

**Or:**
```powershell
python simple_db.py documents
```

---

### 7️⃣ Show All Notifications
```sql
SELECT 
    n.id,
    (SELECT name FROM users WHERE id = n.user_id) as user,
    n.title,
    n.type,
    n.is_read,
    n.created_at
FROM notifications n;
```

**Or:**
```powershell
python simple_db.py notifications
```

---

### 8️⃣ Show Doctor Ratings
```sql
SELECT 
    r.id,
    (SELECT name FROM users WHERE id = p.user_id) as patient,
    (SELECT name FROM users WHERE id = d.user_id) as doctor,
    r.doctor_rating,
    r.platform_rating,
    r.feedback,
    r.created_at
FROM ratings r
JOIN patients p ON r.patient_id = p.id
JOIN doctors d ON r.doctor_id = d.id;
```

---

### 9️⃣ Show Table Schema (Structure)
```sql
PRAGMA table_info(users);
PRAGMA table_info(consultations);
PRAGMA table_info(messages);
PRAGMA table_info(documents);
```

---

## 📁 **Database Structure**

### Tables in Medicare Database:

1. **users** - All user accounts (patients, doctors, admins)
2. **doctors** - Doctor profiles with specialization
3. **patients** - Patient medical information
4. **consultations** - Consultation sessions
5. **messages** - Chat messages
6. **message_documents** - Files attached to messages
7. **documents** - Uploaded files
8. **folders** - Document folder hierarchy
9. **consultation_documents** - Documents shared in consultations
10. **notifications** - System notifications
11. **ratings** - Doctor ratings and feedback
12. **document_views** - Document access audit
13. **admin_audits** - Admin actions log
14. **password_resets** - Password reset tokens

---

## 🎯 **For Teacher Demonstration**

**Tell your teacher:**
> "I've created a Medicare healthcare management system with a complete SQLite database. Let me show you all the data..."

Then run:
```powershell
python simple_db.py
```

This will show:
- ✅ All 14 tables
- ✅ Total number of records in each
- ✅ Database overview

Then you can run any query they ask for:
```powershell
python simple_db.py "SELECT COUNT(*) FROM consultations"
python simple_db.py "SELECT * FROM users WHERE role='doctor'"
python simple_db.py doctors
```

---

## ⚠️ **Troubleshooting**

### Error: "database locked"
**Solution:** Close any other connections to the database

### Error: "table 'users' not found"
**Solution:** Run `python simple_db.py` to verify database exists

### Error: "no such module: sqlite3"
**Solution:** sqlite3 is built-in to Python, reinstall Python if needed

---

## 📝 **Quick Reference**

| Command | What it does |
|---------|-------------|
| `python simple_db.py` | Show database overview |
| `python simple_db.py users` | List all users |
| `python simple_db.py doctors` | List all doctors |
| `python simple_db.py consultations` | List all consultations |
| `python simple_db.py messages` | List all chat messages |
| `python simple_db.py documents` | List all uploaded files |
| `sqlite3 medicare.db` | Open SQLite shell |
| `.tables` | List all tables (in SQLite) |
| `.quit` | Exit SQLite shell |

---

**Ready for Teacher Review:** ✅ November 13, 2025


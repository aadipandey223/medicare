# 🏥 Medicare Database Query Tools

Quick guide to query your `medicare.db` SQLite database from terminal/command line.

## Three Ways to Access Your Database:

### 🚀 **EASIEST - Method 1: Windows Batch File (Recommended)**

**For Windows Command Prompt or PowerShell:**

```powershell
# Open PowerShell in the Medicare folder and run:
.\query_db.bat
```

This opens an interactive menu where you can:
- View all tables overview ✓
- See all users ✓
- View doctors and their details ✓
- Check patients data ✓
- View all consultations ✓
- See messages between patients and doctors ✓
- Check uploaded documents ✓
- View notifications ✓
- Run any custom SQL query ✓

**No additional setup needed!**

---

### 📊 **Method 2: Python Interactive Tool**

**For PowerShell:**

```powershell
cd e:\Aadi\medicare\medicare
E:/Aadi/medicare/medicare/.venv/Scripts/python.exe query_db.py
```

This runs an interactive Python tool with the same features as the batch file.

**Features:**
- Show database overview
- View table schema and data
- Execute custom SQL queries
- See all tables with record counts
- Display sample data from any table

---

### 💻 **Method 3: Direct SQLite Shell**

**For PowerShell:**

```powershell
E:/Aadi/medicare/medicare/.venv/Scripts/python.exe sqlite_shell.py
```

Or directly with sqlite3 (if installed):

```powershell
sqlite3 medicare.db
```

**Common SQLite commands:**
```sql
.tables                        -- List all tables
.schema                        -- Show all table schemas
.schema users                  -- Show users table structure
SELECT * FROM users;           -- Query users
SELECT COUNT(*) FROM doctors;  -- Count doctors
.quit                          -- Exit
```

---

## 📋 **Useful SQL Queries for Your Teacher:**

### 1️⃣ **Show Database Overview**
```sql
SELECT name as [Table], COUNT(*) as [Records] 
FROM sqlite_master 
WHERE type='table' 
GROUP BY name 
ORDER BY name;
```

### 2️⃣ **Show All Users**
```sql
SELECT id, name, email, role, is_verified, created_at FROM users;
```

### 3️⃣ **Show Doctors with Specializations**
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

### 4️⃣ **Show Consultation History**
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

### 5️⃣ **Show Messages in Consultations**
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

### 6️⃣ **Show All Documents**
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

### 7️⃣ **Show Doctor Ratings**
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

### 8️⃣ **Show Table Schemas**
```sql
-- For users table
PRAGMA table_info(users);

-- For consultations table
PRAGMA table_info(consultations);

-- For messages table
PRAGMA table_info(messages);

-- For documents table
PRAGMA table_info(documents);
```

### 9️⃣ **Show Database Statistics**
```sql
-- Total records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
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
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'ratings', COUNT(*) FROM ratings;
```

---

## 🎯 **For Your Teacher Demonstration:**

1. **Show Database Overview:**
   - Run `query_db.bat` → Option 1 (shows all tables and record counts)

2. **Show Users:**
   - Run `query_db.bat` → Option 2 (displays all registered users)

3. **Show Doctors:**
   - Run `query_db.bat` → Option 3 (displays doctors with specializations)

4. **Show Consultations:**
   - Run `query_db.bat` → Option 5 (shows patient-doctor consultations)

5. **Show Messages:**
   - Run `query_db.bat` → Option 6 (displays chat messages between users)

6. **Show Documents:**
   - Run `query_db.bat` → Option 7 (displays uploaded files)

7. **Run Custom Query:**
   - Run `query_db.bat` → Option 9 (enter any SQL query)

---

## 📝 **Example Teacher Demonstration:**

```
1. Open PowerShell in C:\Users\YourName\Downloads\medicare\
2. Run: .\query_db.bat
3. Press 1 → Shows overview of all tables
4. Press 2 → Shows all registered users
5. Press 5 → Shows all consultations
6. Press 6 → Shows all messages (chat history)
7. Press 7 → Shows all uploaded documents
8. Press 9 → Run custom SQL queries
```

---

## ⚠️ **Troubleshooting:**

### Error: "Python not found"
- Make sure you're in the Medicare folder: `cd e:\Aadi\medicare\medicare`

### Error: "Database file not found"
- Make sure `medicare.db` exists in the Medicare folder
- Check with: `ls medicare.db` or `dir medicare.db`

### Error: "Module not found: tabulate"
- The script already installed it, but if needed:
  ```powershell
  E:/Aadi/medicare/medicare/.venv/Scripts/pip.exe install tabulate
  ```

---

## 📚 **All Available Tables in Medicare:**

| Table | Purpose |
|-------|---------|
| `users` | All user accounts (patients, doctors, admins) |
| `doctors` | Doctor profiles with specialization |
| `patients` | Patient medical information |
| `consultations` | Consultation sessions between patients and doctors |
| `messages` | Chat messages during consultations |
| `message_documents` | Files attached to messages |
| `documents` | Uploaded files (PDFs, images) |
| `folders` | Document folder hierarchy |
| `consultation_documents` | Documents shared in consultations |
| `notifications` | System notifications for users |
| `ratings` | Doctor ratings and feedback |
| `document_views` | Document access audit trail |
| `admin_audits` | Admin actions log |
| `password_resets` | Password reset tokens |

---

**Created:** November 13, 2025  
**Project:** Medicare Healthcare Management System  
**Ready for Teacher Demo:** ✅ Yes


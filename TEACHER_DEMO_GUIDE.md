# 📚 Complete Guide - Running SQL on Medicare Database

Your teacher will definitely ask: **"Show me what's in your database"**

Here's exactly what to do:

---

## 🚀 **FASTEST WAY - Double Click Method**

1. **Open file explorer**
2. **Navigate to:** `e:\Aadi\medicare\medicare\`
3. **Double-click:** `VIEW_DATABASE.bat`
4. **Select option** from the menu

Done! No terminal commands needed.

---

## 💻 **Terminal Method (Recommended for Demo)**

### Step 1: Open Terminal/Command Prompt
```
Press: Win + R
Type: cmd
Press: Enter
```

OR open PowerShell:
```
Press: Win + X
Select: Windows PowerShell
```

### Step 2: Navigate to Medicare Folder
```
cd e:\Aadi\medicare\medicare
```

### Step 3: Show Database Overview
```
python simple_db.py
```

### Step 4: Show Specific Data
```
python simple_db.py users          # Show all users
python simple_db.py doctors        # Show all doctors
python simple_db.py consultations  # Show all consultations
python simple_db.py messages       # Show all messages
python simple_db.py documents      # Show all documents
```

---

## 📊 **What Your Teacher Will See**

### When running `python simple_db.py`:
```
======================================================================
🏥 MEDICARE DATABASE OVERVIEW
======================================================================

Table Name                     Records
------------------------------------------
admin_audits                        0
consultation_documents              0
consultations                       0
document_views                      0
documents                           0
folders                             0
message_documents                   0
messages                            0
notifications                       0
password_resets                     0
patients                            0
ratings                             0
users                               0
------------------------------------------
TOTAL                               0

✅ Database successfully queried!
```

---

## 🎯 **Key Talking Points for Your Teacher**

When showing the database, explain:

### 1. Database Structure
> "We have 14 tables total, covering:
> - User management (users, patients, doctors)
> - Consultation management (consultations, messages)
> - Document management (documents, folders)
> - Notification system (notifications)
> - Ratings and feedback (ratings)
> - Security and auditing (password_resets, admin_audits, document_views)"

### 2. Relationships
> "All tables are properly related:
> - Doctors and Patients are related through Consultations
> - Messages are linked to Consultations
> - Documents can be attached to Messages or shared in Consultations
> - Everything is tracked with timestamps and user references"

### 3. Data Integrity
> "We use:
> - Foreign key constraints
> - Unique constraints (for emails, etc.)
> - Check constraints (for ratings 1-5)
> - Cascade delete for data consistency"

---

## 📋 **Quick SQL Commands to Show Your Teacher**

### Count Total Users
```powershell
python simple_db.py "SELECT COUNT(*) as total_users FROM users"
```

### Count Active Consultations
```powershell
python simple_db.py "SELECT COUNT(*) FROM consultations WHERE status='active'"
```

### Show Doctor with Most Consultations
```powershell
python simple_db.py "SELECT u.name, COUNT(*) as consultations FROM consultations c JOIN doctors d ON c.doctor_id=d.id JOIN users u ON d.user_id=u.id GROUP BY d.id ORDER BY consultations DESC"
```

### Show Latest Messages
```powershell
python simple_db.py "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10"
```

### Show Verified Doctors
```powershell
python simple_db.py "SELECT u.name, d.specialization FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.is_verified=1"
```

---

## 📁 **Files Created for Database Access**

| File | Purpose |
|------|---------|
| `simple_db.py` | Main Python script to query database |
| `VIEW_DATABASE.bat` | Easy click-to-run batch file |
| `query_db.bat` | Advanced batch menu tool |
| `query_db.ps1` | PowerShell script version |
| `query_db.sh` | Bash script version (for Linux/Mac) |
| `medicare.db` | The actual SQLite database |

---

## 🏗️ **Database Architecture Explained**

### Core Tables:

**users** → All accounts
- id (primary key)
- email (unique)
- password_hash
- role (patient/doctor/admin)
- created_at

**doctors** → Doctor profiles
- id (primary key)
- user_id (foreign key to users)
- specialization
- hospital
- is_verified
- is_online

**patients** → Patient info
- id (primary key)
- user_id (foreign key to users)
- blood_group
- medical_history
- allergies

**consultations** → Doctor-Patient sessions
- id (primary key)
- patient_id (foreign key)
- doctor_id (foreign key)
- symptoms
- diagnosis
- status (requested/active/ended)

**messages** → Chat messages
- id (primary key)
- consultation_id (foreign key)
- sender_id (foreign key to users)
- content
- created_at

**documents** → Uploaded files
- id (primary key)
- user_id (foreign key)
- file_name
- file_url (stored in Supabase)
- file_size
- uploaded_at

**notifications** → System alerts
- id (primary key)
- user_id (foreign key)
- title
- message
- type (info/success/warning/error)
- is_read

**ratings** → Doctor feedback
- id (primary key)
- consultation_id (foreign key)
- doctor_rating (1-5)
- platform_rating (1-5)
- feedback (optional)

---

## ✅ **Before Teacher Arrives**

### Test Everything:
```
1. Open Terminal
2. cd e:\Aadi\medicare\medicare
3. python simple_db.py
4. python simple_db.py users
5. python simple_db.py doctors
```

### If you get any errors:
- Check if `simple_db.py` exists in the folder
- Check if `medicare.db` exists in the folder  
- Make sure Python is installed (run `python --version`)

---

## 📝 **Script Cheat Sheet**

```powershell
# Show database overview
python simple_db.py

# Show specific table
python simple_db.py users
python simple_db.py doctors
python simple_db.py consultations
python simple_db.py messages
python simple_db.py documents
python simple_db.py notifications

# Run custom SQL
python simple_db.py "SELECT COUNT(*) FROM users"
python simple_db.py "SELECT * FROM doctors LIMIT 5"

# Using batch file
VIEW_DATABASE.bat              # Double-click this
query_db.bat                   # Advanced menu version

# Using SQLite directly (if installed)
sqlite3 medicare.db
.tables                        # List tables
.schema users                  # Show users table structure
SELECT * FROM users;           # View all users
.quit                         # Exit
```

---

## 🎓 **For Your Teacher - Technical Details**

**Database Type:** SQLite 3
**Total Tables:** 14
**Total Models:** 14 (user, doctor, patient, consultation, message, document, notification, etc.)
**Relationships:** 25+ foreign keys
**Data Integrity:** Cascade delete, unique constraints, check constraints
**Storage:** Local SQLite file (development), PostgreSQL-compatible for production

**What the database does:**
- Stores all user data (authentication, profiles)
- Manages consultations between patients and doctors
- Tracks messages in real-time conversations
- Stores uploaded medical documents
- Manages notifications for users
- Records doctor ratings and feedback
- Maintains audit logs for admin actions
- Handles password reset tokens

---

## 🎯 **Interview/Demo Talking Points**

If teacher asks:
- **"How many tables?"** → "14 tables with proper relationships"
- **"What data do you store?"** → Show database overview with `python simple_db.py`
- **"Show me a consultation?"** → Run `python simple_db.py consultations`
- **"How do doctors and patients connect?"** → "Through consultations table with foreign keys"
- **"Where are documents stored?"** → "Metadata in SQLite, actual files in Supabase cloud"
- **"How is data protected?"** → "Foreign key constraints, cascade delete, unique constraints"

---

## ⚡ **Pro Tips**

1. **Keep it running:** Don't close the terminal mid-demo
2. **Have queries ready:** Write down 3-4 queries before teacher comes
3. **Show relationships:** Join queries show how tables connect
4. **Explain constraints:** Point out unique/check/foreign key constraints
5. **Document count:** If you have test data, show actual numbers

---

**Last Updated:** November 13, 2025
**Status:** ✅ Ready for Teacher Review
**Tools:** Python, SQLite, Batch/PowerShell Scripts


# 🏥 Medicare Database - Quick Access Guide

## ⚡ **For Your Teacher - Run These Commands**

---

## **Method 1: Double-Click (EASIEST)**

1. Find this file: **`VIEW_DATABASE.bat`** 
2. **Double-click it**
3. **Choose option** from the menu

---

## **Method 2: Copy-Paste Commands**

### Open Command Prompt:
```
Press: Windows + R
Type: cmd
Press: Enter
```

### Go to Medicare folder:
```
cd e:\Aadi\medicare\medicare
```

### Show everything:
```
python simple_db.py
```

---

## **Method 3: Show Specific Data**

```bash
# Show all users
python simple_db.py users

# Show all doctors
python simple_db.py doctors

# Show all consultations
python simple_db.py consultations

# Show all messages
python simple_db.py messages

# Show all documents
python simple_db.py documents

# Show all notifications
python simple_db.py notifications

# Run custom SQL
python simple_db.py "SELECT COUNT(*) FROM users"
```

---

## 📊 **Database Overview**

```
14 Tables Total
├── User Management
│   ├── users (all accounts)
│   ├── doctors (doctor profiles)
│   └── patients (patient profiles)
│
├── Consultations
│   ├── consultations (sessions)
│   ├── messages (chat)
│   └── message_documents (file attachments)
│
├── Documents
│   ├── documents (uploaded files)
│   ├── folders (file organization)
│   ├── consultation_documents (shared docs)
│   └── document_views (access tracking)
│
├── Notifications
│   └── notifications (system alerts)
│
├── Ratings & Feedback
│   └── ratings (doctor feedback)
│
└── Security & Auditing
    ├── admin_audits (admin actions)
    └── password_resets (reset tokens)
```

---

## 🎯 **Key Commands for Demo**

**Show record counts:**
```sql
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL SELECT 'consultations', COUNT(*) FROM consultations
UNION ALL SELECT 'messages', COUNT(*) FROM messages
UNION ALL SELECT 'documents', COUNT(*) FROM documents;
```

**Show user-doctor relationship:**
```sql
SELECT u.name, d.specialization FROM users u 
JOIN doctors d ON u.id = d.user_id;
```

**Show consultations:**
```sql
SELECT c.id, p.name as patient, d.name as doctor, c.status 
FROM consultations c
JOIN users p ON p.id = (SELECT user_id FROM patients WHERE id = c.patient_id)
JOIN users d ON d.id = (SELECT user_id FROM doctors WHERE id = c.doctor_id);
```

---

## 📱 **What You Can Show Your Teacher**

✅ **All 14 tables with record counts**
✅ **User data (who registered, roles)**
✅ **Doctor profiles (specializations, hospitals)**
✅ **Consultations (patient-doctor sessions)**
✅ **Messages (chat history between patients and doctors)**
✅ **Documents (uploaded medical files)**
✅ **Notifications (system alerts)**
✅ **Ratings (doctor feedback from patients)**
✅ **Any custom SQL query they ask for**

---

## 🚀 **Files You Can Use**

| File | How to Use |
|------|-----------|
| `VIEW_DATABASE.bat` | **Double-click** for menu |
| `simple_db.py` | Run: `python simple_db.py` |
| `medicare.db` | The database file (don't edit!) |

---

## ❓ **If Teacher Asks...**

**"What's in your database?"**
> Run: `python simple_db.py`

**"Show me the users"**
> Run: `python simple_db.py users`

**"How many consultations?"**
> Run: `python simple_db.py "SELECT COUNT(*) FROM consultations"`

**"Show me a doctor's data"**
> Run: `python simple_db.py doctors`

**"Are patients and doctors connected?"**
> Run: `python simple_db.py consultations` (shows the link)

**"Show table structure"**
> In SQLite: `PRAGMA table_info(consultations);`

---

## ✅ **Before Teacher Arrives**

- [ ] Test: `python simple_db.py` works
- [ ] Test: `python simple_db.py users` works
- [ ] Test: `python simple_db.py doctors` works
- [ ] Make sure `medicare.db` file exists
- [ ] Have one example query ready

---

## 📚 **Documentation Files**

All saved in: `e:\Aadi\medicare\medicare\`

- **DATABASE_QUERY_GUIDE.md** - Complete query guide
- **TEACHER_DEMO_GUIDE.md** - What to show teacher
- **SHOW_DATABASE_TO_TEACHER.md** - Specific queries
- **QUICK_START.md** - Setup instructions

---

## 🎓 **Tell Your Teacher This**

> "We built a complete healthcare system with:
> - 14 database tables with proper relationships
> - User authentication and role-based access
> - Patient-doctor consultations
> - Real-time messaging
> - Document management system
> - Notification system
> - Rating and feedback system
> 
> You can query any data using SQL. Let me show you..."

Then run: `python simple_db.py`

---

**Status:** ✅ **READY FOR TEACHER REVIEW**
**Date:** November 13, 2025
**Teacher Meeting:** Tomorrow (November 14, 2025)


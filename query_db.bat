@echo off
REM Medicare Database Query Tool - Windows Batch
REM Run this from PowerShell or Command Prompt

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ============================================================
echo     MEDICARE DATABASE QUERY TOOL
echo ============================================================
echo.

set PYTHON="E:/Aadi/medicare/medicare/.venv/Scripts/python.exe"

:menu
cls
echo ============================================================
echo     MEDICARE DATABASE - Query Tool
echo ============================================================
echo.
echo Choose an option:
echo.
echo 1. Show all tables (overview)
echo 2. Show all users
echo 3. Show all doctors
echo 4. Show all patients
echo 5. Show all consultations
echo 6. Show all messages
echo 7. Show all documents
echo 8. Show all notifications
echo 9. Run custom SQL query
echo 0. Exit
echo.
set /p choice="Enter choice (0-9): "

if "%choice%"=="0" goto end
if "%choice%"=="1" goto overview
if "%choice%"=="2" goto users
if "%choice%"=="3" goto doctors
if "%choice%"=="4" goto patients
if "%choice%"=="5" goto consultations
if "%choice%"=="6" goto messages
if "%choice%"=="7" goto documents
if "%choice%"=="8" goto notifications
if "%choice%"=="9" goto custom
echo Invalid choice!
timeout /t 2
goto menu

:overview
cls
echo Getting database overview...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%%'\")
tables = [row[0] for row in cursor.fetchall()]

print('DATABASE OVERVIEW - MEDICARE.DB')
print('='*60)
print()

data = []
total_records = 0

for table in sorted(tables):
    cursor.execute(f'SELECT COUNT(*) FROM {table}')
    count = cursor.fetchone()[0]
    total_records += count
    data.append([table, count])

print(tabulate(data, headers=['Table Name', 'Records'], tablefmt='grid'))
print()
print(f'Total tables: {len(tables)}')
print(f'Total records: {total_records}')

conn.close()
"
pause
goto menu

:users
cls
echo Fetching users...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute('SELECT id, name, email, role, is_verified, created_at FROM users LIMIT 20')
rows = cursor.fetchall()

if rows:
    columns = ['ID', 'Name', 'Email', 'Role', 'Verified', 'Created']
    data = []
    for row in rows:
        data.append(list(row))
    print(tabulate(data, headers=columns, tablefmt='grid'))
    print()
    cursor.execute('SELECT COUNT(*) FROM users')
    total = cursor.fetchone()[0]
    print(f'Total users: {total}')
else:
    print('No users found')

conn.close()
"
pause
goto menu

:doctors
cls
echo Fetching doctors...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute('''
    SELECT u.id, u.name, u.email, d.specialization, d.hospital, d.is_verified, d.is_online
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LIMIT 20
''')
rows = cursor.fetchall()

if rows:
    columns = ['ID', 'Name', 'Email', 'Specialization', 'Hospital', 'Verified', 'Online']
    data = []
    for row in rows:
        data.append(list(row))
    print(tabulate(data, headers=columns, tablefmt='grid'))
    print()
    cursor.execute('SELECT COUNT(*) FROM doctors')
    total = cursor.fetchone()[0]
    print(f'Total doctors: {total}')
else:
    print('No doctors found')

conn.close()
"
pause
goto menu

:patients
cls
echo Fetching patients...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute('''
    SELECT u.id, u.name, u.email, p.blood_group, p.medical_history, u.created_at
    FROM patients p
    JOIN users u ON p.user_id = u.id
    LIMIT 20
''')
rows = cursor.fetchall()

if rows:
    columns = ['ID', 'Name', 'Email', 'Blood Group', 'Medical History', 'Created']
    data = []
    for row in rows:
        data.append(list(row))
    print(tabulate(data, headers=columns, tablefmt='grid'))
    print()
    cursor.execute('SELECT COUNT(*) FROM patients')
    total = cursor.fetchone()[0]
    print(f'Total patients: {total}')
else:
    print('No patients found')

conn.close()
"
pause
goto menu

:consultations
cls
echo Fetching consultations...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute('''
    SELECT c.id, u_p.name as patient, u_d.name as doctor, c.status, c.consultation_date
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    JOIN users u_p ON p.user_id = u_p.id
    JOIN doctors d ON c.doctor_id = d.id
    JOIN users u_d ON d.user_id = u_d.id
    ORDER BY c.consultation_date DESC
    LIMIT 20
''')
rows = cursor.fetchall()

if rows:
    columns = ['ID', 'Patient', 'Doctor', 'Status', 'Date']
    data = []
    for row in rows:
        data.append(list(row))
    print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=[10, 15, 15, 10, 20]))
    print()
    cursor.execute('SELECT COUNT(*) FROM consultations')
    total = cursor.fetchone()[0]
    print(f'Total consultations: {total}')
else:
    print('No consultations found')

conn.close()
"
pause
goto menu

:messages
cls
echo Fetching messages...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute('''
    SELECT m.id, m.consultation_id, u.name as sender, m.sender_type, substr(m.content, 1, 40) as message, m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    ORDER BY m.created_at DESC
    LIMIT 20
''')
rows = cursor.fetchall()

if rows:
    columns = ['ID', 'Consultation', 'Sender', 'Type', 'Message', 'Created']
    data = []
    for row in rows:
        data.append(list(row))
    print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=[5, 12, 15, 8, 40, 20]))
    print()
    cursor.execute('SELECT COUNT(*) FROM messages')
    total = cursor.fetchone()[0]
    print(f'Total messages: {total}')
else:
    print('No messages found')

conn.close()
"
pause
goto menu

:documents
cls
echo Fetching documents...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute('''
    SELECT d.id, u.name as owner, d.file_name, d.file_type, d.file_size, d.uploaded_at
    FROM documents d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.uploaded_at DESC
    LIMIT 20
''')
rows = cursor.fetchall()

if rows:
    columns = ['ID', 'Owner', 'File Name', 'Type', 'Size (bytes)', 'Uploaded']
    data = []
    for row in rows:
        data.append(list(row))
    print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=[5, 15, 25, 10, 12, 20]))
    print()
    cursor.execute('SELECT COUNT(*) FROM documents')
    total = cursor.fetchone()[0]
    print(f'Total documents: {total}')
else:
    print('No documents found')

conn.close()
"
pause
goto menu

:notifications
cls
echo Fetching notifications...
echo.
%PYTHON% -c "
import sqlite3
from tabulate import tabulate

conn = sqlite3.connect('medicare.db')
cursor = conn.cursor()

cursor.execute('''
    SELECT n.id, u.name as user, n.title, n.type, n.is_read, n.created_at
    FROM notifications n
    JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT 20
''')
rows = cursor.fetchall()

if rows:
    columns = ['ID', 'User', 'Title', 'Type', 'Read', 'Created']
    data = []
    for row in rows:
        data.append(list(row))
    print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=[5, 15, 30, 8, 5, 20]))
    print()
    cursor.execute('SELECT COUNT(*) FROM notifications')
    total = cursor.fetchone()[0]
    print(f'Total notifications: {total}')
else:
    print('No notifications found')

conn.close()
"
pause
goto menu

:custom
cls
echo.
echo Enter your SQL query (e.g. SELECT * FROM users LIMIT 5)
echo.
set /p query="SQL: "

echo.
echo Executing query...
echo.

%PYTHON% -c "
import sqlite3
from tabulate import tabulate

try:
    conn = sqlite3.connect('medicare.db')
    cursor = conn.cursor()
    
    cursor.execute('%query%')
    
    if cursor.description:
        rows = cursor.fetchall()
        if rows:
            columns = [description[0] for description in cursor.description]
            data = [list(row) for row in rows]
            print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=40))
            print()
            print(f'Rows returned: {len(rows)}')
        else:
            print('No results')
    else:
        print(f'Query executed. Rows affected: {cursor.rowcount}')
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
"

pause
goto menu

:end
echo.
echo Thank you for using Medicare Database Query Tool!
echo Goodbye!
exit /b

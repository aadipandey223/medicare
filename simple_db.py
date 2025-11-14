#!/usr/bin/env python3
"""
Medicare Database Query Tool - Command Line Version
Simple and direct way to query the Medicare database

Usage:
    python simple_db.py                    # Show database overview
    python simple_db.py users              # Show all users
    python simple_db.py doctors            # Show all doctors
    python simple_db.py consultations      # Show all consultations
    python simple_db.py messages           # Show all messages
    python simple_db.py "SELECT * FROM..."  # Run custom query
"""

import sqlite3
import sys
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / 'medicare.db'

def execute_query(query):
    """Execute a SQL query and display results"""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        if not rows:
            print("⚠️  No results")
            return
        
        # Get column names
        columns = [description[0] for description in cursor.description]
        
        # Print header
        print()
        header = " | ".join(col.ljust(20) for col in columns)
        print(header)
        print("-" * len(header))
        
        # Print rows
        for row in rows:
            values = [str(row[col]).ljust(20) for col in columns]
            print(" | ".join(values))
        
        print()
        print(f"✅ {len(rows)} rows returned")
        
        conn.close()
    
    except sqlite3.Error as e:
        print(f"❌ SQL Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

def show_overview():
    """Show database overview"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]
    
    print()
    print("="*70)
    print("🏥 MEDICARE DATABASE OVERVIEW")
    print("="*70)
    print()
    
    total = 0
    print(f"{'Table Name':<30} {'Records':>10}")
    print("-" * 42)
    
    for table in sorted(tables):
        cursor.execute(f'SELECT COUNT(*) FROM {table}')
        count = cursor.fetchone()[0]
        total += count
        print(f"{table:<30} {count:>10}")
    
    print("-" * 42)
    print(f"{'TOTAL':<30} {total:>10}")
    print()
    
    conn.close()

def main():
    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH}")
        sys.exit(1)
    
    if len(sys.argv) < 2:
        show_overview()
    else:
        command = sys.argv[1].lower()
        
        if command == 'overview':
            show_overview()
        elif command == 'users':
            print("👥 ALL USERS")
            query = "SELECT id, name, email, role, is_verified, created_at FROM users LIMIT 50"
            execute_query(query)
        elif command == 'doctors':
            print("🏥 ALL DOCTORS")
            query = """
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                d.specialization, 
                d.hospital, 
                d.is_verified,
                d.is_online
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            """
            execute_query(query)
        elif command == 'patients':
            print("🧑‍⚕️ ALL PATIENTS")
            query = """
            SELECT 
                u.id,
                u.name,
                u.email,
                p.blood_group,
                u.created_at
            FROM patients p
            JOIN users u ON p.user_id = u.id
            LIMIT 50
            """
            execute_query(query)
        elif command == 'consultations':
            print("💬 ALL CONSULTATIONS")
            query = """
            SELECT 
                c.id,
                (SELECT name FROM users WHERE id = p.user_id) as patient,
                (SELECT name FROM users WHERE id = d.user_id) as doctor,
                c.status,
                c.consultation_date
            FROM consultations c
            JOIN patients p ON c.patient_id = p.id
            JOIN doctors d ON c.doctor_id = d.id
            ORDER BY c.consultation_date DESC
            LIMIT 50
            """
            execute_query(query)
        elif command == 'messages':
            print("💭 ALL MESSAGES")
            query = """
            SELECT 
                m.id,
                m.consultation_id,
                (SELECT name FROM users WHERE id = m.sender_id) as sender,
                m.sender_type,
                substr(m.content, 1, 30) as message,
                m.created_at
            FROM messages m
            ORDER BY m.created_at DESC
            LIMIT 50
            """
            execute_query(query)
        elif command == 'documents':
            print("📄 ALL DOCUMENTS")
            query = """
            SELECT 
                d.id,
                (SELECT name FROM users WHERE id = d.user_id) as owner,
                d.file_name,
                d.file_type,
                d.file_size,
                d.uploaded_at
            FROM documents d
            ORDER BY d.uploaded_at DESC
            LIMIT 50
            """
            execute_query(query)
        elif command == 'notifications':
            print("🔔 ALL NOTIFICATIONS")
            query = """
            SELECT 
                n.id,
                (SELECT name FROM users WHERE id = n.user_id) as user,
                n.title,
                n.type,
                n.is_read,
                n.created_at
            FROM notifications n
            ORDER BY n.created_at DESC
            LIMIT 50
            """
            execute_query(query)
        elif command == 'help':
            print("""
📌 MEDICARE DATABASE QUERY TOOL

Usage:
    python simple_db.py              # Show database overview
    python simple_db.py users        # Show all users
    python simple_db.py doctors      # Show all doctors
    python simple_db.py patients     # Show all patients
    python simple_db.py consultations # Show consultations
    python simple_db.py messages     # Show messages
    python simple_db.py documents    # Show documents
    python simple_db.py notifications # Show notifications
    python simple_db.py "SELECT..." # Run custom SQL query
    python simple_db.py help         # Show this help

Examples:
    python simple_db.py "SELECT COUNT(*) FROM users"
    python simple_db.py "SELECT * FROM consultations LIMIT 5"
    python simple_db.py "SELECT COUNT(*) as count FROM messages"
            """)
        else:
            # Assume it's a SQL query
            execute_query(command)

if __name__ == '__main__':
    main()

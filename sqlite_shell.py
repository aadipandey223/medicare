#!/usr/bin/env python3
"""
Direct SQLite3 Shell Access
Simpler alternative - just opens sqlite3 command line interface to your database
"""

import subprocess
import sys
from pathlib import Path

DB_PATH = Path(__file__).parent / 'medicare.db'

if not DB_PATH.exists():
    print(f"❌ Database not found at {DB_PATH}")
    sys.exit(1)

print("="*80)
print("🏥 MEDICARE DATABASE - SQLITE3 SHELL")
print("="*80)
print(f"\nDatabase: {DB_PATH}")
print("\n💡 Common Commands:")
print("  .tables              - Show all tables")
print("  .schema              - Show all schemas")
print("  .schema users        - Show users table schema")
print("  SELECT * FROM users; - Query users table")
print("  .quit                - Exit\n")
print("="*80 + "\n")

try:
    subprocess.run(['sqlite3', str(DB_PATH)], check=False)
except FileNotFoundError:
    print("❌ sqlite3 command not found. Installing via Python instead...")
    import sqlite3
    import code
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Create an interactive console
    print("💻 Python SQLite3 Interactive Shell\n")
    
    # Simple interactive loop
    while True:
        try:
            query = input("sqlite> ").strip()
            
            if query.lower() == '.quit':
                break
            elif query.lower() == '.tables':
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                """)
                tables = [row[0] for row in cursor.fetchall()]
                print('\n'.join(tables))
            elif query.lower() == '.schema':
                cursor.execute("""
                    SELECT sql FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                """)
                schemas = [row[0] for row in cursor.fetchall()]
                print('\n'.join(schemas) + '\n')
            elif query:
                try:
                    cursor.execute(query)
                    if cursor.description:
                        # SELECT query
                        rows = cursor.fetchall()
                        columns = [description[0] for description in cursor.description]
                        print(','.join(columns))
                        for row in rows:
                            print(','.join(str(x) if x is not None else '' for x in row))
                    else:
                        # INSERT/UPDATE/DELETE
                        conn.commit()
                        print(f"✓ {cursor.rowcount} rows affected")
                except sqlite3.Error as e:
                    print(f"Error: {e}")
        
        except KeyboardInterrupt:
            print("\n👋 Exiting...")
            break
        except EOFError:
            break
    
    conn.close()

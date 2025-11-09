"""
Reset database script - Deletes old database and recreates with new schema
Run this if you get database schema errors
"""
import os
from pathlib import Path

db_path = Path("medicare.db")
journal_path = Path("medicare.db-journal")

if db_path.exists():
    os.remove(db_path)
    print("[OK] Deleted medicare.db")

if journal_path.exists():
    os.remove(journal_path)
    print("[OK] Deleted medicare.db-journal")

print("[OK] Database reset complete. Run 'python app.py' to recreate the database with new schema.")


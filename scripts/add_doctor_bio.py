"""
Migration script to add bio column to doctors table
Run this after updating the Doctor model
"""
import sys
import os
from pathlib import Path

# Add parent directory to path to import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app import engine, SessionLocal, logger

def add_bio_column():
    """Add bio column to doctors table if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if bio column exists
        result = db.execute(text("PRAGMA table_info(doctors)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'bio' not in columns:
            logger.info("Adding 'bio' column to doctors table...")
            db.execute(text("ALTER TABLE doctors ADD COLUMN bio VARCHAR(500)"))
            db.commit()
            logger.info("✅ Successfully added 'bio' column to doctors table")
        else:
            logger.info("'bio' column already exists in doctors table")
            
    except Exception as e:
        logger.error(f"❌ Failed to add bio column: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("ADDING BIO COLUMN TO DOCTORS TABLE")
    print("=" * 60)
    
    try:
        add_bio_column()
        print("\n✅ Migration completed successfully!")
        print("\nDoctors can now add a bio/introduction in their settings.")
        print("Patients will see this when viewing doctor profiles.")
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        sys.exit(1)

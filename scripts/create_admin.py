"""
Script to create an admin user
Usage: python create_admin.py
"""
import sys
from app import Base, engine, SessionLocal, User
import bcrypt

def create_admin():
    """Create an admin user"""
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == 'admin@medicare.com').first()
        if admin:
            print("❌ Admin user already exists!")
            print(f"   Email: {admin.email}")
            print(f"   Role: {admin.role}")
            response = input("\nDo you want to reset the password? (y/n): ")
            if response.lower() == 'y':
                new_password = input("Enter new password: ")
                if new_password:
                    admin.set_password(new_password)
                    db.commit()
                    print("✅ Admin password updated successfully!")
                else:
                    print("❌ Password cannot be empty")
            return
        
        # Get admin details
        print("=" * 50)
        print("Creating Admin User")
        print("=" * 50)
        
        email = input("Enter admin email (default: admin@medicare.com): ").strip()
        if not email:
            email = 'admin@medicare.com'
        
        name = input("Enter admin name (default: Admin User): ").strip()
        if not name:
            name = 'Admin User'
        
        password = input("Enter admin password: ").strip()
        if not password:
            print("❌ Password is required!")
            return
        
        # Create admin user
        admin = User(
            email=email.lower(),
            name=name,
            role='admin',
            is_cured=False
        )
        admin.set_password(password)
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("\n✅ Admin user created successfully!")
        print(f"   Email: {admin.email}")
        print(f"   Name: {admin.name}")
        print(f"   Role: {admin.role}")
        print(f"   ID: {admin.id}")
        print("\nYou can now login with these credentials.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    # Initialize database
    Base.metadata.create_all(bind=engine)
    create_admin()


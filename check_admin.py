"""Check admin accounts and test login"""
from app import SessionLocal, User
import bcrypt

db = SessionLocal()

# Get all admin accounts
admins = db.query(User).filter(User.role == 'admin').all()

print("\n" + "="*60)
print("ADMIN ACCOUNTS IN DATABASE:")
print("="*60)

if not admins:
    print("❌ No admin accounts found!")
    print("\nCreating default admin account...")
    
    # Create admin if none exists
    admin = User(
        email='admin@medicare.com',
        name='Admin User',
        role='admin'
    )
    admin.set_password('admin123')
    db.add(admin)
    db.commit()
    print("✅ Created admin@medicare.com with password: admin123")
else:
    for admin in admins:
        print(f"\n📧 Email: {admin.email}")
        print(f"   Name: {admin.name}")
        print(f"   Role: {admin.role}")
        print(f"   ID: {admin.id}")
        active = getattr(admin, 'is_active', True)
        print(f"   Active: {'✅' if active else '❌'}")

print("\n" + "="*60)
print("LOGIN TEST:")
print("="*60)

# Test login
test_email = 'admin@medicare.com'
test_password = 'admin123'

user = db.query(User).filter(User.email == test_email).first()

if user:
    print(f"\n✅ Found user: {user.email}")
    
    # Test password
    if user.check_password(test_password):
        print(f"✅ Password correct for {test_password}")
        print(f"   Role: {user.role}")
    else:
        print(f"❌ Password incorrect!")
        print(f"   Trying to reset password...")
        user.set_password('admin123')
        db.commit()
        print(f"✅ Password reset to: admin123")
else:
    print(f"❌ User not found: {test_email}")

print("\n" + "="*60)
print("CREDENTIALS TO USE:")
print("="*60)
print("Email: admin@medicare.com")
print("Password: admin123")
print("="*60 + "\n")

db.close()

"""Test admin login with actual credentials"""
from app import SessionLocal, User

db = SessionLocal()

# Get all users
users = db.query(User).all()

print("\n" + "="*70)
print("ALL USER ACCOUNTS:")
print("="*70)

for user in users:
    print(f"\n📧 Email: {user.email}")
    print(f"   Name: {user.name}")
    print(f"   Role: {user.role}")
    print(f"   ID: {user.id}")

# Test the admin account
admin_email = 'admin@gehu.ac.in'
admin = db.query(User).filter(User.email == admin_email).first()

if admin:
    print("\n" + "="*70)
    print("ADMIN ACCOUNT DETAILS:")
    print("="*70)
    print(f"Email: {admin.email}")
    print(f"Name: {admin.name}")
    print(f"Role: {admin.role}")
    
    # Test different passwords
    passwords_to_test = ['admin123', 'Admin@123', 'password', '123456', 'admin']
    
    print("\n" + "="*70)
    print("TESTING PASSWORDS:")
    print("="*70)
    
    password_found = False
    for pwd in passwords_to_test:
        if admin.check_password(pwd):
            print(f"✅ CORRECT PASSWORD: {pwd}")
            password_found = True
            break
        else:
            print(f"❌ Wrong: {pwd}")
    
    if not password_found:
        print("\n⚠️  None of the common passwords work!")
        print("Resetting password to: admin123")
        admin.set_password('admin123')
        db.commit()
        print("✅ Password has been reset!")

print("\n" + "="*70)
print("USE THESE CREDENTIALS TO LOGIN:")
print("="*70)
print(f"Email: {admin.email if admin else 'admin@gehu.ac.in'}")
print("Password: admin123")
print("="*70 + "\n")

db.close()

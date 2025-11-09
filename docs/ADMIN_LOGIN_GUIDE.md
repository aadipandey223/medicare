# How to Login as Admin

## Step 1: Create an Admin User

Run the admin creation script:

```bash
python create_admin.py
```

This will prompt you for:
- **Email** (default: `admin@medicare.com`)
- **Name** (default: `Admin User`)
- **Password** (required)

### Example:
```
Enter admin email (default: admin@medicare.com): admin@medicare.com
Enter admin name (default: Admin User): Admin User
Enter admin password: admin123
```

## Step 2: Login

1. Go to the login page: `http://localhost:3000/auth` (or your frontend URL)
2. Enter your admin credentials:
   - **Email**: `admin@medicare.com` (or the email you used)
   - **Password**: The password you set
3. Click "Sign in"

You will be automatically redirected to `/admin/dashboard`.

## Default Admin Credentials

If you used the defaults:
- **Email**: `admin@medicare.com`
- **Password**: (whatever you set during creation)

## Reset Admin Password

If you need to reset the admin password, run the script again:

```bash
python create_admin.py
```

It will detect the existing admin and ask if you want to reset the password.

## Troubleshooting

### "Invalid email or password"
- Make sure you created the admin user first
- Check that the email matches exactly (case-insensitive)
- Verify the password is correct

### "Account is inactive"
- Check the database to ensure `is_active` is `True` for the admin user

### Admin portal not loading
- Make sure the backend is running
- Check browser console for errors
- Verify the admin role is set correctly in the database

## Database Check

To verify the admin user exists, you can check the database:

```python
from app import SessionLocal, User
db = SessionLocal()
admin = db.query(User).filter(User.email == 'admin@medicare.com').first()
if admin:
    print(f"Admin found: {admin.name}, Role: {admin.role}")
else:
    print("Admin not found")
db.close()
```


"""Test admin login via API"""
import requests
import json

API_URL = "http://localhost:5000"

print("\n" + "="*70)
print("TESTING ADMIN LOGIN API")
print("="*70)

# Test login
login_data = {
    "email": "admin@gehu.ac.in",
    "password": "admin123"
}

print(f"\n📤 Sending POST to {API_URL}/api/auth/login")
print(f"   Email: {login_data['email']}")
print(f"   Password: {login_data['password']}")

try:
    response = requests.post(
        f"{API_URL}/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    
    print(f"\n📥 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ LOGIN SUCCESSFUL!")
        print(f"\n🎫 Token: {data.get('token', 'N/A')[:50]}...")
        print(f"👤 User: {data.get('user', {}).get('name', 'N/A')}")
        print(f"📧 Email: {data.get('user', {}).get('email', 'N/A')}")
        print(f"🔑 Role: {data.get('role', 'N/A')}")
        
        # Test token verification
        token = data.get('token')
        if token:
            print(f"\n📤 Testing token verification...")
            verify_response = requests.get(
                f"{API_URL}/api/auth/verify",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
            print(f"📥 Verify Status: {verify_response.status_code}")
            if verify_response.status_code == 200:
                print("✅ Token is valid!")
                verify_data = verify_response.json()
                print(f"   Verified User: {verify_data.get('user', {}).get('name', 'N/A')}")
                print(f"   Verified Role: {verify_data.get('role', 'N/A')}")
            else:
                print("❌ Token verification failed!")
                print(verify_response.text)
    else:
        print("❌ LOGIN FAILED!")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR: Cannot connect to backend!")
    print("Make sure Flask is running on http://localhost:5000")
    print("\nStart backend with:")
    print("  python app.py")
except Exception as e:
    print(f"\n❌ ERROR: {e}")

print("\n" + "="*70)
print("ADMIN LOGIN CREDENTIALS:")
print("="*70)
print("Email: admin@gehu.ac.in")
print("Password: admin123")
print("="*70 + "\n")

#!/usr/bin/env python
"""
Test the Medicare API
"""
import requests
import json

API_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{API_URL}/api/health")
        print("✅ Backend Health Check:")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

def test_registration():
    """Test registration endpoint"""
    try:
        payload = {
            "email": "test@example.com",
            "password": "Test123!",
            "name": "Test User",
            "role": "patient"
        }
        response = requests.post(f"{API_URL}/api/auth/register", json=payload)
        if response.status_code == 201:
            print("\n✅ Registration Endpoint Working:")
            data = response.json()
            print(f"   - Created user: {data['user']['name']}")
            print(f"   - Email: {data['user']['email']}")
            print(f"   - Role: {data['user']['role']}")
            print(f"   - Token: {data['token'][:20]}...")
            return True
        elif response.status_code == 409:
            print("\n✅ Registration Endpoint Working (User exists):")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"\n❌ Registration failed: {response.status_code}")
            print(f"   {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Medicare API Test Suite")
    print("=" * 60)
    
    health_ok = test_health()
    reg_ok = test_registration()
    
    print("\n" + "=" * 60)
    if health_ok and reg_ok:
        print("✅ All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above.")
    print("=" * 60)

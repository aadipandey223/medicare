"""
Generate a secure random SECRET_KEY for Flask
Run this script and copy the output to your .env file
"""
import secrets

# Generate a secure random key
secret_key = secrets.token_hex(32)

print("\n" + "="*60)
print("🔐 GENERATED SECRET KEY FOR YOUR .env FILE")
print("="*60)
print(f"\nSECRET_KEY={secret_key}")
print("\n" + "="*60)
print("\n📝 Copy the line above and paste it into your .env file")
print("   (Replace the existing SECRET_KEY line)\n")

"""
Test if the project is ready for deployment
"""
import os
import sys

def check_file(filepath, description):
    """Check if a file exists"""
    exists = os.path.exists(filepath)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {filepath}")
    return exists

def check_env_var(var_name, description):
    """Check if environment variable is set"""
    exists = os.getenv(var_name) is not None
    status = "✅" if exists else "⚠️"
    print(f"{status} {description}: {var_name}")
    return exists

print("\n" + "="*70)
print("🚀 DEPLOYMENT READINESS CHECK")
print("="*70)

# Check essential files
print("\n📁 Essential Files:")
files_ok = all([
    check_file("app.py", "Flask backend"),
    check_file("requirements.txt", "Python dependencies"),
    check_file("package.json", "Node dependencies"),
    check_file("vite.config.js", "Vite configuration"),
    check_file(".env", "Environment variables"),
    check_file("Procfile", "Heroku configuration"),
    check_file("vercel.json", "Vercel configuration"),
    check_file("render.yaml", "Render configuration"),
    check_file("runtime.txt", "Python version"),
])

# Check deployment files
print("\n🔧 Deployment Files:")
deploy_ok = all([
    check_file("Procfile", "Heroku Procfile"),
    check_file("vercel.json", "Vercel config"),
    check_file("render.yaml", "Render config"),
    check_file(".github/workflows/deploy.yml", "GitHub Actions"),
])

# Check environment variables
print("\n🔐 Environment Variables:")
from dotenv import load_dotenv
load_dotenv()

env_ok = all([
    check_env_var("SECRET_KEY", "Flask secret key"),
    check_env_var("JWT_SECRET", "JWT signing key"),
    check_env_var("GEMINI_API_KEY", "Google Gemini API"),
    check_env_var("SUPABASE_URL", "Supabase URL"),
    check_env_var("SUPABASE_SERVICE_KEY", "Supabase service key"),
])

# Check critical dependencies
print("\n📦 Critical Dependencies:")
try:
    import flask
    print("✅ Flask installed:", flask.__version__)
except ImportError:
    print("❌ Flask not installed")
    
try:
    import google.generativeai
    print("✅ Google Generative AI installed")
except ImportError:
    print("❌ Google Generative AI not installed")

try:
    import sqlalchemy
    print("✅ SQLAlchemy installed:", sqlalchemy.__version__)
except ImportError:
    print("❌ SQLAlchemy not installed")

# Check database
print("\n🗄️ Database:")
db_exists = check_file("medicare.db", "SQLite database")
if not db_exists:
    print("   ⚠️  Run: python scripts/init_db.py")

# Check frontend build
print("\n🎨 Frontend Build:")
dist_exists = check_file("dist", "Built frontend")
if not dist_exists:
    print("   ⚠️  Run: npm install && npm run build")

# Summary
print("\n" + "="*70)
print("📊 SUMMARY")
print("="*70)

all_ready = files_ok and deploy_ok and env_ok and db_exists

if all_ready:
    print("✅ Your project is ready for deployment!")
    print("\n🚀 Next steps:")
    print("   1. Choose a platform: Vercel, Render, Heroku, or Railway")
    print("   2. Push to GitHub: git add . && git commit -m 'Ready for deployment' && git push")
    print("   3. Follow DEPLOYMENT.md guide for your chosen platform")
    print("   4. Set environment variables in platform dashboard")
    print("   5. Deploy and test!")
else:
    print("⚠️  Some issues found. Please fix them before deployment.")
    print("\n📖 See DEPLOYMENT.md for detailed instructions")

print("="*70 + "\n")

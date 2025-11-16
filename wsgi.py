# WSGI entry point for Vercel and other platforms
from app import app

# This is required for Vercel
application = app

if __name__ == "__main__":
    app.run()


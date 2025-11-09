# WSGI Configuration for PythonAnywhere
# IMPORTANT: Update the path below to match your PythonAnywhere setup

import sys
import os

# UPDATE THIS PATH to match your PythonAnywhere directory structure
# Format: /home/YOUR_USERNAME/YOUR_PROJECT_FOLDER
# Example: /home/aadipandey2121/medicare
project_home = '/home/aadipandey2121/medicare'

# Add project to Python path
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Change to project directory
os.chdir(project_home)

# Import Flask app - this must be named 'application' for PythonAnywhere
try:
    from app import app
    application = app
except Exception as e:
    # If there's an error, create a simple error app
    from flask import Flask
    application = Flask(__name__)
    
    @application.route('/')
    def error():
        return f"Error loading app: {str(e)}", 500

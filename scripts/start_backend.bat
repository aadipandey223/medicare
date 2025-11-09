@echo off
echo.
echo ========================================
echo   Medicare Patient Portal - Backend
echo ========================================
echo.
echo Starting Flask server with authentication...
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file with:
    echo   - SECRET_KEY
    echo   - GOOGLE_CLIENT_ID
    echo   - DATABASE_URL
    echo.
    echo You can copy .env.example and update it.
    echo.
    pause
    exit /b 1
)

REM Run the Flask app
python app_auth.py

pause

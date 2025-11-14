@echo off
echo ========================================
echo Medicare Multi-Window Test Setup
echo ========================================
echo.
echo This script will help you test admin, doctor, and patient simultaneously
echo.
echo Step 1: Make sure both servers are running
echo   - Backend: python app.py (Port 5000)
echo   - Frontend: npm run dev (Port 3000)
echo.
echo Step 2: Open multiple Chrome profiles:
echo.

REM Check if Chrome is installed
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% (
    set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

if exist %CHROME_PATH% (
    echo Opening Chrome windows with different profiles...
    echo.
    
    echo [1/3] Opening PATIENT window (Profile 1)...
    start "" %CHROME_PATH% --profile-directory="Default" --new-window "http://localhost:3000"
    timeout /t 2 /nobreak >nul
    
    echo [2/3] Opening DOCTOR window (Profile 2)...
    start "" %CHROME_PATH% --profile-directory="Profile 1" --new-window "http://localhost:3000"
    timeout /t 2 /nobreak >nul
    
    echo [3/3] Opening ADMIN window (Profile 3)...
    start "" %CHROME_PATH% --profile-directory="Profile 2" --new-window "http://localhost:3000"
    
    echo.
    echo ========================================
    echo Chrome windows opened successfully!
    echo ========================================
    echo.
    echo Now login in each window:
    echo   Window 1: Login as PATIENT
    echo   Window 2: Login as DOCTOR
    echo   Window 3: Login as ADMIN
    echo.
    echo If profiles don't exist, Chrome will create them automatically.
    echo You can customize profile names in Chrome settings.
    echo.
) else (
    echo Chrome not found! Please open 3 browser windows manually:
    echo   1. Normal window - Login as Patient
    echo   2. Incognito window - Login as Doctor
    echo   3. Different browser - Login as Admin
    echo.
)

echo Press any key to exit...
pause >nul

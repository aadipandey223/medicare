@echo off
echo.
echo ========================================
echo   Medicare Patient Portal - Frontend
echo ========================================
echo.
echo Starting React development server...
echo.

REM Check if .env.local file exists
if not exist .env.local (
    echo WARNING: .env.local file not found!
    echo.
    echo Please create .env.local file with:
    echo   - VITE_GOOGLE_CLIENT_ID
    echo   - VITE_API_URL
    echo.
    echo You can copy .env.example and update it.
    echo.
)

REM Run npm dev
npm run dev

pause

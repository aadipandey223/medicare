@echo off
REM Simple Medicare Database Viewer
REM Just double-click this file or run from command prompt

setlocal enabledelayedexpansion

cd /d "%~dp0"

title Medicare Database Query Tool

:menu
cls
echo.
echo ================================================================
echo             MEDICARE DATABASE - Query Tool
echo ================================================================
echo.
echo Select an option:
echo.
echo   1. Show Database Overview (all tables and record counts)
echo   2. Show All Users
echo   3. Show All Doctors
echo   4. Show All Patients
echo   5. Show All Consultations
echo   6. Show All Messages (Chat History)
echo   7. Show All Documents
echo   8. Show All Notifications
echo   9. Show Doctor Ratings
echo   0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="0" goto exit
if "%choice%"=="1" goto overview
if "%choice%"=="2" goto users
if "%choice%"=="3" goto doctors
if "%choice%"=="4" goto patients
if "%choice%"=="5" goto consultations
if "%choice%"=="6" goto messages
if "%choice%"=="7" goto documents
if "%choice%"=="8" goto notifications
if "%choice%"=="9" goto ratings

echo Invalid choice!
timeout /t 2 >nul
goto menu

:overview
cls
python simple_db.py
pause
goto menu

:users
cls
python simple_db.py users
pause
goto menu

:doctors
cls
python simple_db.py doctors
pause
goto menu

:patients
cls
python simple_db.py patients
pause
goto menu

:consultations
cls
python simple_db.py consultations
pause
goto menu

:messages
cls
python simple_db.py messages
pause
goto menu

:documents
cls
python simple_db.py documents
pause
goto menu

:notifications
cls
python simple_db.py notifications
pause
goto menu

:ratings
cls
python simple_db.py "SELECT r.id, (SELECT name FROM users WHERE id=p.user_id) as patient, (SELECT name FROM users WHERE id=d.user_id) as doctor, r.doctor_rating, r.platform_rating FROM ratings r JOIN patients p ON r.patient_id=p.id JOIN doctors d ON r.doctor_id=d.id"
pause
goto menu

:exit
echo.
echo Thank you for using Medicare Database Query Tool!
echo.
exit /b

# Medicare Multi-Window Test Setup
# PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Medicare Multi-Window Test Setup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you test admin, doctor, and patient simultaneously" -ForegroundColor Yellow
Write-Host ""

# Check if Chrome is running
$chromeRunning = Get-Process chrome -ErrorAction SilentlyContinue
if ($chromeRunning) {
    Write-Host "Chrome is already running." -ForegroundColor Green
} else {
    Write-Host "Chrome is not running. Starting..." -ForegroundColor Yellow
}

# Find Chrome executable
$chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromePath = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($chromePath) {
    Write-Host ""
    Write-Host "Opening Chrome windows with different profiles..." -ForegroundColor Green
    Write-Host ""
    
    Write-Host "[1/3] Opening PATIENT window (Profile: Default)..." -ForegroundColor Cyan
    Start-Process $chromePath -ArgumentList "--profile-directory=Default", "--new-window", "http://localhost:3000"
    Start-Sleep -Seconds 2
    
    Write-Host "[2/3] Opening DOCTOR window (Profile: Profile 1)..." -ForegroundColor Cyan
    Start-Process $chromePath -ArgumentList "--profile-directory=`"Profile 1`"", "--new-window", "http://localhost:3000"
    Start-Sleep -Seconds 2
    
    Write-Host "[3/3] Opening ADMIN window (Profile: Profile 2)..." -ForegroundColor Cyan
    Start-Process $chromePath -ArgumentList "--profile-directory=`"Profile 2`"", "--new-window", "http://localhost:3000"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Chrome windows opened successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now login in each window:" -ForegroundColor Yellow
    Write-Host "  Window 1 (Default): Login as PATIENT" -ForegroundColor White
    Write-Host "  Window 2 (Profile 1): Login as DOCTOR" -ForegroundColor White
    Write-Host "  Window 3 (Profile 2): Login as ADMIN" -ForegroundColor White
    Write-Host ""
    Write-Host "If profiles don't exist, Chrome will create them automatically." -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "Chrome not found! Please install Chrome or use alternative method:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Open 3 browser windows manually:" -ForegroundColor Yellow
    Write-Host "  1. Chrome - Login as Patient" -ForegroundColor White
    Write-Host "  2. Firefox - Login as Doctor" -ForegroundColor White
    Write-Host "  3. Edge - Login as Admin" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Testing Checklist:" -ForegroundColor Cyan
Write-Host "  [ ] Patient can request consultation" -ForegroundColor White
Write-Host "  [ ] Doctor receives and accepts request" -ForegroundColor White
Write-Host "  [ ] Both can chat in consultation" -ForegroundColor White
Write-Host "  [ ] Doctor marks patient as cured" -ForegroundColor White
Write-Host "  [ ] Chat automatically closes" -ForegroundColor White
Write-Host "  [ ] Admin can see all users and activities" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

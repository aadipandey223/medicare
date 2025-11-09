# PowerShell script to start the Flask backend
Write-Host "Starting Medicare Backend Server..." -ForegroundColor Green
Write-Host ""

# Check if database exists, if not reset it
if (Test-Path "medicare.db") {
    Write-Host "[INFO] Database exists" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Database will be created on first run" -ForegroundColor Yellow
}

# Start Flask backend
Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Cyan
python app.py


# PowerShell script to start the React frontend
Write-Host "Starting Medicare Frontend..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[WARNING] node_modules not found. Run 'npm install' first." -ForegroundColor Yellow
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "Starting Vite dev server on http://localhost:3000" -ForegroundColor Cyan
npm run dev


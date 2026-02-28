Write-Host "🚀 Starting Construction AI services in background..."

# Start Backend
Write-Host "Starting Backend API..."
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory ".\backend" -WindowStyle Hidden

# Start Frontend
Write-Host "Starting Frontend Dashboard..."
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory ".\frontend" -WindowStyle Hidden

Write-Host ""
Write-Host "✅ Services are running in the background (Hidden windows)."
Write-Host "You can view the app at: http://localhost:3000"
Write-Host "To stop them, please run: .\stop-bg.ps1"

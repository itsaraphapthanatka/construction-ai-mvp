Write-Host "🛑 Stopping Node.js services..."
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Stopped."

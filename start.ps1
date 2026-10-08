Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Uruchamianie aplikacji Fullstack        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Uruchomienie Backendu (Spring Boot)
Write-Host "[1/2] Uruchamianie Backendu (Spring Boot)..." -ForegroundColor Yellow
# Dopasuj ścieżkę do Twojego folderu z API/backendem (np. apps/backend lub apps/api)
Set-Location -Path "apps/backend" 
Start-Process powershell -ArgumentList "-NoExit", "-Command", "./mvnw.cmd spring-boot:run"
Set-Location -Path "../.."

# Krótka przerwa na inicjalizację backendu
Start-Sleep -Seconds 5

# 2. Uruchomienie Frontend (React / Vite na porcie 5174)
Write-Host "[2/2] Uruchamianie Frontend (React / web-vite)..." -ForegroundColor Yellow
Set-Location -Path "apps/web-vite"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev -- --port 5174"
Set-Location -Path "../.."

Write-Host "==========================================" -ForegroundColor Green
Write-Host "🚀 Wszystkie usługi zostały uruchomione!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
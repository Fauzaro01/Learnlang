<#
.SYNOPSIS
  Script bantuan untuk menjalankan LernLang dengan Docker atau Lokal di Windows.
.EXAMPLE
  .\run.ps1 up
  .\run.ps1 up -ai
  .\run.ps1 down
  .\run.ps1 seed
  .\run.ps1 logs
#>

param(
    [Parameter(Position=0)]
    [ValidateSet("up", "down", "restart", "logs", "seed", "build", "status", "help")]
    [string]$Action = "up",

    [switch]$Ai
)

function Ensure-Env {
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "File .env otomatis dibuat dari .env.example." -ForegroundColor Green
        }
    }
}

switch ($Action) {
    "up" {
        Ensure-Env
        if ($Ai) {
            Write-Host "Menjalankan LernLang + MySQL + Ollama (AI)..." -ForegroundColor Cyan
            docker compose --profile ai up -d --build
        } else {
            Write-Host "Menjalankan LernLang + MySQL..." -ForegroundColor Cyan
            docker compose up -d --build
        }
        Write-Host "Aplikasi siap di http://localhost:3000" -ForegroundColor Green
        Write-Host "Untuk melihat log: .\run.ps1 logs" -ForegroundColor Yellow
    }
    "down" {
        Write-Host "Menghentikan semua container..." -ForegroundColor Yellow
        docker compose --profile ai down
    }
    "restart" {
        Write-Host "Merestart container..." -ForegroundColor Yellow
        docker compose restart
    }
    "logs" {
        docker compose logs -f
    }
    "build" {
        docker compose build --no-cache
    }
    "seed" {
        Write-Host "Menjalankan ulang database seed..." -ForegroundColor Cyan
        docker compose exec app npm run db:seed
    }
    "status" {
        docker compose ps
    }
    "help" {
        Write-Host "Penggunaan: .\run.ps1 [action] [-Ai]" -ForegroundColor Cyan
        Write-Host "Action yang tersedia:"
        Write-Host "  up       : Menyalakan container (tambahkan -Ai untuk mengaktifkan Ollama)"
        Write-Host "  down     : Menghentikan container"
        Write-Host "  restart  : Merestart service"
        Write-Host "  logs     : Melihat live logs"
        Write-Host "  seed     : Menjalankan database seed ulang"
        Write-Host "  build    : Rebuild image docker"
        Write-Host "  status   : Cek status container"
    }
}

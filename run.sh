#!/usr/bin/env bash
set -e

ACTION="${1:-up}"
AI_FLAG=false

for arg in "$@"; do
  if [ "$arg" = "--ai" ] || [ "$arg" = "-ai" ]; then
    AI_FLAG=true
  fi
done

ensure_env() {
  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo "File .env otomatis dibuat dari .env.example."
  fi
}

case "$ACTION" in
  up)
    ensure_env
    if [ "$AI_FLAG" = true ]; then
      echo "Menjalankan LernLang + MySQL + Ollama (AI)..."
      docker compose --profile ai up -d --build
    else
      echo "Menjalankan LernLang + MySQL..."
      docker compose up -d --build
    fi
    echo "Aplikasi siap di http://localhost:3000"
    echo "Untuk melihat log: ./run.sh logs"
    ;;
  down)
    echo "Menghentikan semua container..."
    docker compose --profile ai down
    ;;
  restart)
    echo "Merestart container..."
    docker compose restart
    ;;
  logs)
    docker compose logs -f
    ;;
  build)
    docker compose build --no-cache
    ;;
  seed)
    echo "Menjalankan ulang database seed..."
    docker compose exec app npm run db:seed
    ;;
  status)
    docker compose ps
    ;;
  help|*)
    echo "Penggunaan: ./run.sh [up|down|restart|logs|seed|build|status|help] [--ai]"
    echo "Contoh:"
    echo "  ./run.sh up         # Menyalakan App + MySQL"
    echo "  ./run.sh up --ai    # Menyalakan App + MySQL + Ollama"
    echo "  ./run.sh down       # Mematikan service"
    echo "  ./run.sh logs       # Melihat log output"
    ;;
esac

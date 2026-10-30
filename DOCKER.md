# 🐳 Panduan Docker LernLang

Menjalankan LernLang kini sangat mudah dengan Docker Compose. Tidak perlu instalasi manual MySQL atau konfigurasi manual runtime di host.

---

## ⚡ Cara Cepat (1 Langkah)

### Di Windows (PowerShell):
```powershell
.\run.ps1 up
```
Jika ingin menyertakan container Ollama (AI):
```powershell
.\run.ps1 up -Ai
```

### Di Linux / macOS / Git Bash:
```bash
chmod +x run.sh
./run.sh up
```
Atau dengan AI:
```bash
./run.sh up --ai
```

Aplikasi langsung dapat diakses di: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Login Default (Setelah Auto-Seed)

Saat container pertama kali dijalankan, migrasi Prisma dan data awal (seed) akan otomatis diisi:

- **Admin**: `admin@learnlang.com` / `admin123`
- **User**: `budi@example.com` / `password123`

---

## 🛠 Perintah Penting

| Kebutuhan | PowerShell (`run.ps1`) | Bash (`run.sh`) | Native Docker Compose |
|---|---|---|---|
| Jalankan Aplikasi | `.\run.ps1 up` | `./run.sh up` | `docker compose up -d` |
| Jalankan + AI (Ollama) | `.\run.ps1 up -Ai` | `./run.sh up --ai` | `docker compose --profile ai up -d` |
| Matikan Container | `.\run.ps1 down` | `./run.sh down` | `docker compose --profile ai down` |
| Lihat Live Log | `.\run.ps1 logs` | `./run.sh logs` | `docker compose logs -f` |
| Re-seed Database | `.\run.ps1 seed` | `./run.sh seed` | `docker compose exec app npm run db:seed` |
| Cek Status | `.\run.ps1 status` | `./run.sh status` | `docker compose ps` |

---

## 🤖 Menyiapkan Model AI (Jika Menggunakan Ollama)

Jika menjalankan profile AI, download model yang diinginkan (default: `qwen2.5:1.5b` atau `gemma2:2b`):

```bash
docker exec -it learnlang_ollama ollama pull qwen2.5:1.5b
```

---

## ⚙️ Konfigurasi Environment

File `.env` otomatis disalin dari `.env.example` saat script pertama kali dijalankan. Anda dapat menyesuaikan port, kredensial MySQL, atau secret NextAuth pada file `.env`.

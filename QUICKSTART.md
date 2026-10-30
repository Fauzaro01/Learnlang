# 🚀 Quick Start Guide - LernLang

Panduan cepat untuk langsung menggunakan aplikasi LernLang.

## ⚡ Super Quick Start (5 Menit)

### Step 1: Jalankan 9Router (atau Ollama)

```bash
# Pastikan 9Router berjalan pada port default:
# http://localhost:20128
```

*(Jika menggunakan Ollama secara lokal, set `AI_PROVIDER=ollama` di `.env`)*

### Step 2: Konfigurasi Environment (.env)

```bash
cp .env.example .env
# Isi NINEROUTER_BASE_URL (default http://localhost:20128/v1) dan NINEROUTER_API_KEY jika diperlukan
```

### Step 3: Install Dependencies (30 detik)

```bash
npm install
```

### Step 4: Jalankan Aplikasi (10 detik)

```bash
npm run dev
```

### Step 5: Buka Browser

Akses: http://localhost:3000

## ✅ Checklist Sebelum Mulai

- [ ] Node.js terinstall (`node --version` untuk cek)
- [ ] 9Router (atau Ollama) berjalan di background
- [ ] Environment variable `NINEROUTER_BASE_URL` atau `OLLAMA_BASE_URL` terkonfigurasi
- [ ] Dependencies npm terinstall (`npm install`)

## 🎯 Cara Pakai Aplikasi

1. **Generate Kalimat**
   - Pilih tingkat kesulitan
   - Klik "Mulai Belajar"

2. **Terjemahkan**
   - Baca kalimat bahasa Inggris
   - Tulis terjemahan dalam bahasa Indonesia

3. **Evaluasi**
   - Klik "Evaluasi Terjemahan"
   - Lihat skor dan feedback

4. **Lihat Riwayat**
   - Klik "Riwayat Belajar" di header
   - Review latihan sebelumnya

## 🐛 Troubleshooting Cepat

### Error: "Gagal terhubung ke 9Router"

```bash
# Pastikan 9Router berjalan di port 20128:
# Buka http://localhost:20128 di browser
```

### Error: "Model tidak ditemukan di 9Router"

- Periksa format model pada `.env` (misal `NINEROUTER_MODEL=openai/gpt-4o-mini` atau combo yang telah dibuat di 9Router).
- Pastikan provider atau API key untuk model tersebut sudah dikonfigurasi di dashboard 9Router.

### Port 3000 sudah digunakan

```bash
# Gunakan port lain
npm run dev -- -p 3001
```

## 📝 Tips & Tricks

1. **Test 9Router Gateway**:
   Buka http://localhost:20128 - dashboard 9Router dapat diakses untuk memantau request dan token usage.

2. **Multi-tab**:
   Buka aplikasi di beberapa tab untuk latihan lebih banyak.

## 📚 Resource Tambahan

- [README.md](./README.md) - Dokumentasi lengkap
- [9Router GitHub](https://github.com/decolua/9router) - Dokumentasi resmi 9Router

## 🎨 Fitur UI

- ✅ Warna hijau lembut yang menenangkan
- ✅ Responsive design (mobile-friendly)
- ✅ Animasi smooth
- ✅ Feedback visual yang jelas
- ✅ Dark mode ready (bisa ditambahkan)

## 💡 Ide Latihan

1. **Daily Practice**: Latihan 10 kalimat setiap hari
2. **Progressive Difficulty**: Mulai easy → medium → hard
3. **Review Mistakes**: Cek riwayat untuk pola kesalahan
4. **Speed Challenge**: Coba berapa kalimat dalam 10 menit

## 🏆 Target Skor

- **Beginner**: Rata-rata 60+
- **Intermediate**: Rata-rata 75+
- **Advanced**: Rata-rata 85+
- **Expert**: Rata-rata 95+

---

**Selamat Belajar! 🎓**

Jika ada pertanyaan atau issue, check README.md atau buat issue di GitHub.

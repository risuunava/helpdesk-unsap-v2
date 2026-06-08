# Smart Campus Helpdesk UNSAP (v2.0)

Platform pelaporan keluhan mahasiswa Universitas Sebelas April yang terintegrasi dengan Machine Learning untuk klasifikasi otomatis dan FAQ suggestion.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions, Realtime)
- **ML Service:** Python, FastAPI, Scikit-learn, NLTK
- **Monitoring:** Recharts (Analytics Dashboard)
- **Deployment:** Vercel (Frontend), Railway (ML Service)

## Fitur Utama

- 🚀 **Klasifikasi Tiket Otomatis:** Menggunakan ML untuk menentukan prioritas laporan.
- 💡 **FAQ Suggestion:** Saran jawaban otomatis saat mahasiswa mengetik laporan.
- 💬 **Live Chat Realtime:** Komunikasi langsung antara mahasiswa dan admin.
- 📊 **Analytics Dashboard:** Visualisasi data performa layanan (SLA, volume tiket, sentimen).
- 🔒 **Privacy Focused:** Opsi pelaporan anonim untuk isu sensitif.
- 🔔 **Notifikasi Realtime:** Update status laporan secara instan.

## Setup Lokal

### 1. Prasyarat
- Node.js >= 18
- Python >= 3.11
- Supabase CLI

### 2. Instalasi Dependensi
```bash
npm install
cd ml-service && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### 3. Konfigurasi Environment
Salin `.env.local.example` ke `.env.local` dan isi dengan credential Supabase & ML Service Anda.

### 4. Menjalankan Development Server
```bash
npm run dev
# Di terminal lain (ml-service):
uvicorn main:app --reload --port 5000
```

## Struktur Proyek
- `app/`: Next.js pages & API routes
- `components/`: Reusable UI components
- `lib/`: Shared utilities & validations
- `hooks/`: Custom React hooks
- `ml-service/`: Python ML service & datasets
- `supabase/`: Migrations & Edge Functions

## Lisensi
MIT

---
*Dibuat untuk Universitas Sebelas April (UNSAP)*

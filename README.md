# Smart Campus Helpdesk UNSAP (v2.0)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Python](https://img.shields.io/badge/ML--Service-Python-blue?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Platform pusat bantuan (helpdesk) Universitas Sebelas April yang modern, cepat, dan cerdas. Dibangun untuk memfasilitasi komunikasi antara mahasiswa dan unit kerja di lingkungan kampus dengan integrasi **Machine Learning** untuk otomatisasi dan efisiensi.

## Gambaran Umum

Smart Campus Helpdesk bukan sekadar aplikasi ticketing biasa. Sistem ini dirancang untuk mengurangi beban administratif melalui klasifikasi otomatis dan memberikan solusi cepat bagi mahasiswa melalui saran FAQ yang cerdas sebelum mereka mengirimkan laporan.

## Fitur Utama

### Bagi Mahasiswa
- **Smart Ticket Submission:** Form pelaporan yang user-friendly dengan deteksi kategori otomatis.
- **FAQ Instant Suggestion:** Sistem akan menyarankan jawaban FAQ yang relevan secara real-time saat mahasiswa mengetik deskripsi masalah.
- **Anonymous Reporting:** Fitur pelaporan anonim untuk isu sensitif dengan kode akses khusus.
- **Live Tracking:** Pantau status laporan (Open, In Progress, Resolved, Closed) secara real-time.
- **Interactive Chat:** Berkomunikasi langsung dengan admin yang menangani tiket.
- **Pusat Notifikasi:** Pemberitahuan instan via aplikasi setiap ada update pada laporan.

### Bagi Admin & Unit Kerja
- **Auto-Categorization & Priority:** Tiket diklasifikasikan secara otomatis (Low, Normal, Urgent) menggunakan ML.
- **Sentiment Analysis:** Deteksi tingkat kepuasan atau urgensi dari bahasa yang digunakan mahasiswa.
- **Analytics Dashboard:** Visualisasi data komprehensif (volume tiket, SLA compliance, kategori terpopuler).
- **SLA Monitoring:** Notifikasi otomatis jika tiket mendekati batas waktu penanganan (SLA).
- **ML Retraining Interface:** Kemampuan untuk melatih ulang model ML berdasarkan data tiket terbaru langsung dari dashboard.

## Tech Stack

### Frontend & Dashboard
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State Management:** TanStack Query & Zustand
- **Animation:** Framer Motion

### Backend (Supabase Ecosystem)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (Role-based)
- **Realtime:** Postgres Changes for Chat & Notifications
- **Storage:** Supabase Storage for attachments
- **Edge Functions:** Serverless logic for complex tasks

### Machine Learning Service
- **Framework:** FastAPI (Python 3.11+)
- **NLP Library:** NLTK, Scikit-learn (SVM/Random Forest)
- **Algorithms:** TF-IDF Vectorization, Cosine Similarity for FAQ suggestions
- **Infrastructure:** Railway / Docker

## Arsitektur Sistem

```text
[ Mahasiswa / Admin ] <---> [ Next.js Frontend (Vercel) ]
                                      |
                                      |--- API Requests ---> [ Supabase (DB, Auth, Realtime) ]
                                      |
                                      |--- Inference/Training ---> [ Python ML Service ]
```

## Struktur Folder

```text
├── app/                  # Next.js Pages & API Routes (App Router)
│   ├── (auth)/           # Halaman Login & Registrasi
│   ├── (dashboard)/      # Layout & Halaman Admin/Mahasiswa
│   └── api/              # Backend Proxy & Endpoints
├── components/           # Komponen UI Reusable
│   ├── chat/             # Komponen Realtime Chat
│   ├── dashboard/        # Widget Grafik & Analytics
│   └── ui/               # Base UI (Shadcn)
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities, Validasi (Zod), & Supabase Client
├── ml-service/           # Python FastAPI Service
│   ├── datasets/         # Data training & FAQ JSON
│   ├── models/           # File model ML terkompresi
│   └── utils/            # Preprocessing teks & logic inference
├── supabase/             # Migrasi DB, Triggers, & RLS Policies
└── types/                # Definisi Type TypeScript & Database
```

## Instalasi & Setup Lokal

### 1. Prasyarat
- Node.js 18+ & npm
- Python 3.11+
- Akun Supabase (atau self-hosted)

### 2. Setup Frontend
```bash
# Clone repository
git clone https://github.com/username/unsap-helpdesk.git
cd unsap-helpdesk

# Install dependensi
npm install

# Setup Environment
cp .env.local.example .env.local
# Isi dengan SUPABASE_URL, SUPABASE_ANON_KEY, ML_SERVICE_URL, dll.

# Jalankan development server
npm run dev
```

### 3. Setup ML Service
```bash
cd ml-service

# Buat virtual environment
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

# Install dependensi
pip install -r requirements.txt

# Jalankan service
uvicorn main:app --reload --port 5000
```

### 4. Setup Database
Jalankan migrasi yang ada di folder `supabase/migrations/` ke instance Supabase Anda untuk membuat tabel, triggers, dan kebijakan keamanan (RLS).

## Detail Machine Learning

### Klasifikasi Prioritas
Model dilatih menggunakan data historis laporan untuk membedakan antara laporan teknis biasa dan kondisi darurat. Dilengkapi dengan *keyword override* untuk menjamin isu krusial (seperti pelecehan atau bahaya fisik) selalu mendapatkan status **Urgent**.

### FAQ Engine
Menggunakan **Cosine Similarity** untuk menghitung jarak antara vektor teks input mahasiswa dengan dataset FAQ. Jika tingkat kemiripan di atas ambang batas (0.15), sistem akan menampilkan saran secara instan di form input.

## Keamanan & Privasi
- **Row Level Security (RLS):** Memastikan user hanya bisa melihat data yang menjadi hak aksesnya.
- **Anonymization:** Data sensitif pada laporan anonim dienkripsi atau dipisahkan dari profil utama untuk melindungi pelapor.
- **API Key Protection:** Komunikasi antara Next.js dan ML Service dilindungi dengan API Key yang aman.

## Lisensi
Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.

---
**Smart Campus Helpdesk UNSAP** - *Digitalizing Campus Services with Intelligence.*
*© 2026 Universitas Sebelas April (UNSAP)*

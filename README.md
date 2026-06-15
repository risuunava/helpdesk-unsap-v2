# Smart Campus Helpdesk UNSAP (v2.0)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Python](https://img.shields.io/badge/ML--Service-Python-blue?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Platform pusat bantuan (helpdesk) Universitas Sebelas April yang modern, cepat, dan cerdas. Dibangun untuk memfasilitasi komunikasi antara mahasiswa dan unit kerja di lingkungan kampus dengan integrasi **Machine Learning** untuk otomatisasi dan efisiensi.

## Gambaran Umum

Smart Campus Helpdesk bukan sekadar aplikasi ticketing biasa. Sistem ini dirancang untuk mengurangi beban administratif melalui klasifikasi prioritas otomatis dan memberikan solusi cepat bagi mahasiswa melalui saran FAQ yang cerdas sebelum mereka mengirimkan laporan.

## Fitur Utama

### Bagi Mahasiswa
- **Smart Ticket Submission:** Form pelaporan yang user-friendly dengan deteksi kategori otomatis.
- **FAQ Instant Suggestion:** Sistem menyarankan jawaban FAQ yang relevan secara real-time saat mahasiswa mengetik deskripsi masalah (TF-IDF + Cosine Similarity).
- **Anonymous Reporting:** Fitur pelaporan anonim untuk isu sensitif dengan kode akses khusus (`Anonim_#XXXX`).
- **Live Tracking:** Pantau status laporan (Open, In Progress, Resolved, Closed) secara real-time.
- **Interactive Chat:** Berkomunikasi langsung dengan admin yang menangani tiket via Supabase Realtime.
- **Pusat Notifikasi:** Pemberitahuan instan via aplikasi setiap ada update pada laporan.
- **File Upload:** Lampirkan file (JPG, PNG, PDF, maks 2MB) ke tiket via Supabase Storage.
- **Rate Limiting:** Pembatasan 3 tiket per hari per user untuk mencegah spam.

### Bagi Admin & Unit Kerja
- **Auto-Prioritization:** Tiket diklasifikasikan secara otomatis (Low, Normal, Urgent) menggunakan ML (Logistic Regression).
- **Keyword Auto-Escalation:** Keyword sensitif (pelecehan, KRS, kebakaran, dll.) langsung menaikkan prioritas ke Urgent sebagai fallback jika ML tidak tersedia.
- **Analytics Dashboard:** Visualisasi data komprehensif — KPI cards, SLA compliance, distribusi kategori, trend tiket mingguan, dan sentiment analysis.
- **SLA Monitoring:** Indikator visual (hijau/kuning/merah) dan notifikasi otomatis jika tiket mendekati batas waktu penanganan.
- **ML Management:** Halaman khusus Master Admin untuk melihat data uncertain, koreksi label ML, dan trigger retraining model langsung dari dashboard.
- **Notifications Realtime:** Notifikasi instan tiket baru masuk via Supabase Realtime.
- **Export Data:** Export data tiket ke CSV/XLSX/PDF.

## Tech Stack

### Frontend & Dashboard
| Komponen | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.7 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Shadcn/UI + Radix UI | Latest |
| State & Data Fetching | TanStack Query + Zustand | 5.x / 5.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Table | TanStack Table | 8.x |
| Animation | Framer Motion | 12.x |
| Charts | Recharts | 3.x |
| Icons | Lucide React, Tabler Icons, Phosphor Icons | Latest |
| Command Palette | kbar + cmdk | Latest |
| Theme | next-themes (multi-theme support) | 0.4.x |
| Toast | Sonner | 2.x |
| Loader | nextjs-toploader | 3.x |
| File Upload | react-dropzone + react-easy-crop | Latest |
| Export | jsPDF + jspdf-autotable + XLSX | Latest |

### Backend (Supabase Ecosystem)
| Komponen | Teknologi |
|---|---|
| Database | PostgreSQL with Row Level Security (RLS) & ENUM types |
| Authentication | Supabase Auth (email/password, role-based) |
| Realtime | Supabase Realtime (Postgres Changes) untuk Chat & Notifikasi |
| Storage | Supabase Storage (bucket: `avatars`, `attachments`) |
| Edge Functions | `process-ticket-ml` — Deno runtime, dipanggil via DB Webhook |
| Analytics | PostgreSQL RPC Functions (`get_kpi_summary`, `get_weekly_trend`, `get_sla_compliance`, dll.) |

### Machine Learning Service
| Komponen | Teknologi | Versi |
|---|---|---|
| Framework | FastAPI | 0.110.0 |
| Runtime | Python | 3.11+ |
| ML Library | scikit-learn (Logistic Regression) | 1.4.1 |
| NLP Bahasa Indonesia | Sastrawi (Stemmer) | 1.0.1 |
| Text Processing | NLTK + TF-IDF Vectorizer | 3.8.1 |
| FAQ Engine | TF-IDF + Cosine Similarity | — |
| Sentiment Analysis | Keyword-based scoring | — |
| Data Processing | Pandas | 2.2.1 |
| Serialisasi | joblib | 1.3.2 |
| Server | uvicorn | 0.29.0 |
| Deploy | Railway.app (Nixpacks) | — |

## Arsitektur Sistem

```text
┌─────────────────────────────────────────────────┐
│                  Browser / Client                │
│           Next.js 16 App Router (React 19)       │
│        Tailwind CSS v4 · Shadcn/UI · TypeScript  │
└──────────────┬──────────────────┬────────────────┘
               │                  │
               │ SDK direct        │ API Route fetch
               ▼                  ▼
┌──────────────────────┐  ┌───────────────────────┐
│      Supabase        │  │   Next.js API Routes  │
│                      │  │   /app/api/**          │
│  • PostgreSQL (DB)   │  │   (serverless, Vercel) │
│  • Auth (JWT/RLS)    │  └──────────┬────────────┘
│  • Realtime (WS)     │             │ REST call
│  • Storage (files)   │             ▼
│  • Edge Functions    │  ┌───────────────────────┐
│    (process-ticket)  │  │   ML Service           │
└──────────────────────┘  │   FastAPI · Python     │
                          │   Railway.app          │
                          │                        │
                          │  • /classify            │
                          │  • /faq-suggest         │
                          │  • /sentiment           │
                          │  • /retrain             │
                          └────────────────────────┘
```

## Struktur Folder

```text
unsap-helpdeskv2/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group: Autentikasi
│   │   ├── layout.tsx                # Layout halaman auth
│   │   ├── login/page.tsx            # Halaman login
│   │   └── register/page.tsx         # Halaman registrasi
│   ├── (dashboard)/                  # Route group: Dashboard
│   │   ├── layout.tsx                # Layout dashboard (sidebar, header)
│   │   ├── admin/
│   │   │   ├── page.tsx              # Dashboard admin (list semua tiket)
│   │   │   ├── tiket/page.tsx        # Tabel tiket admin + filter
│   │   │   ├── tiket/[id]/page.tsx   # Detail tiket admin + split-view chat
│   │   │   ├── analytics/page.tsx    # KPI, SLA, trend, sentiment chart
│   │   │   └── ml/page.tsx           # ML management (master admin)
│   │   ├── mahasiswa/
│   │   │   ├── page.tsx              # Dashboard mahasiswa (tiket sendiri)
│   │   │   ├── submit/page.tsx       # Form submit tiket + FAQ suggestion
│   │   │   └── tiket/[id]/page.tsx   # Detail tiket + live chat
│   │   ├── notifications/            # Pusat notifikasi
│   │   ├── profile/page.tsx          # Edit profil + avatar crop
│   │   └── settings/page.tsx         # Pengaturan (tema, preferensi)
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   ├── callback/route.ts     # Supabase Auth OAuth callback
│   │   │   └── logout/route.ts       # Logout handler
│   │   ├── tickets/
│   │   │   ├── route.ts              # GET (list) + POST (create)
│   │   │   └── [id]/route.ts         # GET + PATCH + DELETE per tiket
│   │   ├── chat/route.ts             # POST kirim pesan chat
│   │   ├── analytics/route.ts        # GET KPI, SLA, distribusi data
│   │   ├── notifications/route.ts    # GET/PATCH notifikasi user
│   │   ├── ml/suggest/route.ts       # POST → forward ke ML /faq-suggest
│   │   └── admin/ml/                 # Endpoint ML khusus admin
│   │       ├── label/route.ts        # POST koreksi label ML
│   │       ├── retrain/route.ts      # POST trigger retraining
│   │       ├── stats/route.ts        # GET statistik model
│   │       └── uncertain/route.ts    # GET data prediksi uncertain
│   ├── themes/                       # Theme CSS files (10 tema)
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── theme.css                     # Theme variables
│
├── components/                       # Komponen UI Reusable
│   ├── ui/                           # 67 Base UI components (Shadcn/UI)
│   │   ├── PriorityBadge.tsx         # Badge prioritas (low/normal/urgent)
│   │   ├── StatusBadge.tsx           # Badge status tiket
│   │   ├── SlaIndicator.tsx          # Indikator SLA (hijau/kuning/merah)
│   │   ├── EmptyState.tsx            # State kosong
│   │   ├── ErrorBoundary.tsx         # Error boundary handler
│   │   ├── LoadingSkeleton.tsx       # Skeleton loading
│   │   ├── kanban.tsx                # Kanban board
│   │   ├── sidebar.tsx               # Sidebar system
│   │   ├── notification-card.tsx     # Card notifikasi
│   │   └── ... (button, card, dialog, form, table, dll.)
│   ├── ticket/
│   │   ├── FaqSuggestion.tsx         # Saran FAQ real-time
│   │   └── TicketActions.tsx         # Aksi tiket (update status, assign)
│   ├── chat/
│   │   ├── ChatRoom.tsx              # Live chat Supabase Realtime
│   │   └── ChatMessage.tsx           # Bubble pesan chat
│   ├── dashboard/
│   │   ├── KpiCard.tsx               # Card KPI (total, open, resolved, dll.)
│   │   ├── SlaChart.tsx              # Chart SLA compliance
│   │   ├── SentimentChart.tsx        # Chart sentiment analysis
│   │   ├── CategoryChart.tsx         # Chart distribusi kategori
│   │   └── TrendChart.tsx            # Chart trend tiket mingguan
│   ├── layout/
│   │   ├── Sidebar.tsx               # Sidebar navigasi
│   │   ├── Header.tsx                # Header dashboard
│   │   ├── BottomNav.tsx             # Navigasi bawah (mobile)
│   │   ├── NotificationBell.tsx      # Bell notifikasi realtime
│   │   ├── CommandMenu.tsx           # Command palette (⌘K)
│   │   ├── SearchInput.tsx           # Input pencarian
│   │   ├── PageContainer.tsx         # Container halaman
│   │   ├── DashboardLayoutClient.tsx # Client-side layout
│   │   ├── app-sidebar.tsx           # App sidebar system
│   │   ├── user-nav.tsx              # Dropdown navigasi user
│   │   ├── providers.tsx             # Context providers
│   │   └── query-provider.tsx        # TanStack Query provider
│   ├── forms/                        # Form system (TanStack Form)
│   │   ├── demo-form.tsx
│   │   └── fields/                   # Reusable form fields
│   │       ├── text-field.tsx
│   │       ├── textarea-field.tsx
│   │       ├── select-field.tsx
│   │       ├── checkbox-field.tsx
│   │       ├── switch-field.tsx
│   │       ├── radio-group-field.tsx
│   │       ├── slider-field.tsx
│   │       └── file-upload-field.tsx
│   ├── themes/                       # Theme system
│   │   ├── theme-provider.tsx
│   │   ├── theme-selector.tsx
│   │   ├── mode-toggle.tsx
│   │   ├── active-theme.tsx
│   │   ├── font.config.ts
│   │   └── theme.config.ts
│   ├── kbar/                         # Command palette (kbar)
│   ├── modal/                        # Modal system (alert, image cropper)
│   ├── file-uploader.tsx             # File upload component
│   └── icons.tsx                     # Icon definitions
│
├── hooks/                            # Custom React Hooks (18 hooks)
│   ├── useTickets.ts                 # Data fetching tiket mahasiswa
│   ├── useAdminTickets.ts            # Data fetching tiket admin + filter
│   ├── useTicketForm.ts              # Logic form submit tiket
│   ├── useChat.ts                    # Realtime chat subscription
│   ├── useNotifications.ts           # Notifikasi realtime subscription
│   ├── useAuth.ts                    # Auth state hook
│   ├── useProfile.ts                 # Profil user hook
│   ├── use-nav.ts                    # Navigasi sidebar
│   ├── use-breadcrumbs.tsx           # Breadcrumb generator
│   ├── use-toast.ts                  # Toast notifications
│   ├── use-debounce.tsx              # Debounce value
│   ├── use-debounced-callback.ts     # Debounced callback
│   ├── use-mobile.ts                 # Mobile detection
│   ├── use-media-query.ts            # Media query hook
│   ├── use-stepper.tsx               # Multi-step form
│   ├── use-callback-ref.tsx          # Callback ref
│   └── use-controllable-state.tsx    # Controllable state
│
├── lib/                              # Utilities & Libraries
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client (singleton)
│   │   └── server.ts                 # Server component Supabase client
│   ├── validations/
│   │   ├── ticket.schema.ts          # Zod schema tiket
│   │   └── auth.schema.ts            # Zod schema auth
│   ├── ml.ts                         # Helper fetch ke ML Service
│   ├── anonymize.ts                  # Generate kode anonim
│   ├── escalation.ts                 # Keyword auto-escalation list
│   ├── auth.ts                       # Auth utilities
│   ├── rateLimit.ts                  # Rate limiting logic
│   ├── export.ts                     # Export ke CSV/XLSX/PDF
│   ├── format.ts                     # Format utilities
│   ├── api-client.ts                 # API client helper
│   ├── query-client.ts              # TanStack Query client config
│   ├── nav-config.ts                 # Konfigurasi navigasi
│   ├── searchparams.ts               # URL search params utilities
│   ├── compose-refs.ts               # Ref composition utility
│   └── utils.ts                      # General utilities (cn, dll.)
│
├── types/                            # TypeScript Type Definitions
│   ├── database.ts                   # Generated Supabase DB types (ENUM)
│   └── index.ts                      # NavItem, NavGroup, PermissionCheck
│
├── config/
│   └── nav-config.ts                 # Konfigurasi navigasi utama
│
├── constants/                        # App constants (kosong)
│
├── styles/                           # Global Styles
│   ├── globals.css
│   ├── theme.css
│   └── themes/                       # 10 preset tema CSS
│       ├── astro-vista.css
│       ├── claude.css
│       ├── light-green.css
│       ├── mono.css
│       ├── neobrutualism.css
│       ├── notebook.css
│       ├── supabase.css
│       ├── vercel.css
│       ├── whatsapp.css
│       └── zen.css
│
├── supabase/                         # Supabase Configuration
│   ├── config.toml                   # Supabase local dev config
│   ├── functions/
│   │   └── process-ticket-ml/
│   │       └── index.ts              # Edge Function: ML classify + notif
│   └── migrations/                   # 18 migration files
│       ├── 20260604000001_init_schema.sql
│       ├── 20260604000002_triggers.sql
│       ├── 20260604000003_rls_policies.sql
│       ├── 20260604000004_realtime_seed.sql
│       ├── 20260604000005_seed_accounts.sql
│       ├── 20260604000006_update_trigger_nim.sql
│       ├── 20260605000007_rpc_functions.sql
│       ├── 20260605000008_fix_rls_policies.sql
│       ├── 20260605000009_fix_recursion.sql
│       ├── 20260605000010_analytics_functions.sql
│       ├── 20260605000015_create_faqs.sql
│       ├── 20260606000016_fix_ticket_number_seq.sql
│       ├── 20260607000017_indexes.sql
│       ├── 20260614000018_storage_policies.sql
│       ├── 20260614045549_fix_avatar_rls.sql
│       ├── 20260614070304_convert_role_to_enum.sql
│       ├── 20260614141500_fix_enum_recursion.sql
│       └── 20260614142200_fix_trigger_enum_cast.sql
│
├── ml-service/                       # Python ML Service (Railway)
│   ├── main.py                       # FastAPI server (endpoints)
│   ├── train.py                      # Training pipeline (Logistic Regression)
│   ├── start.py                      # Railway startup script (sync + train + serve)
│   ├── sync_faqs.py                  # Sync FAQ dari Supabase ke JSON
│   ├── requirements.txt              # Python dependencies
│   ├── Procfile                      # Railway process file
│   ├── railway.json                  # Railway deploy config (Nixpacks)
│   ├── datasets/
│   │   ├── dataset.csv               # Data training (700+ rows)
│   │   └── faqs.json                 # FAQ data (synced dari Supabase)
│   ├── models/
│   │   ├── model_*.pkl               # Trained model file
│   │   └── vectorizer.pkl            # TF-IDF vectorizer
│   └── utils/
│       ├── preprocessor.py           # Stemmer Sastrawi, stopwords, tokenizer
│       └── model_loader.py           # Load/reload model tanpa restart
│
├── proxy.ts                          # Next.js middleware (auth guard + routing)
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Node.js dependencies
├── postcss.config.mjs                # PostCSS configuration
├── eslint.config.mjs                 # ESLint configuration
├── components.json                   # Shadcn/UI configuration
├── .env.local.example                # Template environment variables
├── DESIGN.md                         # Design system documentation
├── PLAN.md                           # Development plan
├── PRD.md                            # Product Requirements Document
└── LICENSE                           # MIT License
```

## Instalasi & Setup Lokal

### 1. Prasyarat
- Node.js 18+ & npm
- Python 3.11+
- Akun Supabase (atau self-hosted via `supabase start`)

### 2. Setup Frontend
```bash
# Clone repository
git clone https://github.com/risuunava/helpdesk-unsap-v2.git
cd helpdesk-unsap-v2

# Install dependensi
npm install

# Setup Environment
cp .env.local.example .env.local
# Isi semua variabel:
#   NEXT_PUBLIC_SUPABASE_URL=
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=
#   SUPABASE_SERVICE_ROLE_KEY=
#   ML_SERVICE_URL=
#   ML_SERVICE_API_KEY=

# Jalankan development server
npm run dev
# → http://localhost:3000
```

### 3. Setup ML Service
```bash
cd ml-service

# Buat virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependensi
pip install -r requirements.txt

# Training model pertama kali
python train.py

# Jalankan service
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

### 4. Setup Database
```bash
# Opsi 1: Jalankan Supabase local
supabase start
supabase db push

# Opsi 2: Deploy ke Supabase hosted
supabase link --project-ref <your-project-ref>
supabase db push

# Deploy Edge Function
supabase functions deploy process-ticket-ml
```

## Detail Machine Learning

### Klasifikasi Prioritas
Model dilatih menggunakan **Logistic Regression** dengan **TF-IDF Vectorizer** (max_features=5000, ngram_range=(1,2)). Dataset terdiri dari 700+ sampel teks laporan dalam Bahasa Indonesia. Preprocessing menggunakan **Sastrawi** (stemmer Bahasa Indonesia) dan **NLTK** (stopword removal).

Pipeline training:
1. Load data dari Supabase (`ml_training_data`) atau fallback ke `dataset.csv`
2. Preprocessing: cleaning → stemming → stopword removal
3. Split 80/20 untuk evaluasi → train → evaluate
4. Retrain ulang dengan seluruh data untuk model final
5. Simpan `model_{timestamp}.pkl` + `vectorizer.pkl`

### Keyword Auto-Escalation (Fallback)
Jika ML model tidak tersedia, sistem menggunakan **rule-based fallback** dengan keyword yang langsung menaikkan prioritas ke **Urgent**: `KRS`, `UKT`, `pelecehan`, `kekerasan`, `kebakaran`, `darurat`, `drop out`, dll.

### FAQ Engine
Menggunakan **TF-IDF + Cosine Similarity** untuk menghitung kemiripan antara teks input mahasiswa dengan dataset FAQ (synced dari Supabase). Jika skor kemiripan > 0.15, saran FAQ ditampilkan secara instan.

### Sentiment Analysis
Analisis sentimen keyword-based (positive/negative/neutral) dengan skor 0-1. Digunakan untuk Campus Mood Analytics pada dashboard Master Admin.

## Skema Database

7 tabel utama dengan PostgreSQL ENUM types:

| Tabel | Deskripsi |
|---|---|
| `profiles` | Profil user (extends `auth.users`) — role ENUM: `mahasiswa`, `admin`, `master_admin` |
| `tickets` | Tiket laporan — category, status, priority sebagai ENUM |
| `messages` | Pesan chat per tiket (realtime) |
| `faqs` | Data FAQ (synced ke ML Service) |
| `ml_training_data` | Data koreksi label untuk active learning |
| `ticket_rate_limits` | Rate limiting (3 tiket/hari/user) |
| `notifications` | Notifikasi per user |

### Triggers & Functions
- `generate_ticket_number()` — Auto-generate format `TKT-2026-XXXX`
- `set_sla_deadline()` — Auto-set SLA: Urgent=4jam, Normal=24jam, Low=72jam
- `update_updated_at()` — Auto-update timestamp
- `handle_new_user()` — Auto-create profile saat register
- `get_kpi_summary()` — RPC: KPI dashboard
- `get_weekly_trend()` — RPC: Trend tiket 8 minggu
- `get_tickets_by_category()` — RPC: Distribusi kategori
- `get_tickets_by_priority()` — RPC: Distribusi prioritas
- `get_sla_compliance()` — RPC: Persentase SLA compliance

## Keamanan & Privasi
- **Row Level Security (RLS):** Semua 7 tabel dilindungi RLS. Mahasiswa hanya akses tiket sendiri, admin akses semua.
- **ENUM Type Safety:** Role, status, priority, dan category menggunakan PostgreSQL ENUM untuk validasi di level database.
- **Anonymization:** Tiket anonim menggunakan kode deterministik `Anonim_#XXXX`. Identitas asli hanya bisa dilihat Master Admin.
- **API Key Protection:** Komunikasi ke ML Service dilindungi header `X-API-Key`.
- **Input Validation:** Validasi 2 lapis — Zod schema di client (React Hook Form) dan server (API Routes).
- **File Upload Guard:** Mime type + ekstensi + ukuran (maks 2MB) divalidasi sebelum upload ke Supabase Storage.
- **Storage Policies:** Bucket `avatars` dan `attachments` dengan RLS policy per-user.

## ML Service Endpoints

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| GET | `/` | Service info | Publik |
| GET | `/health` | Health check | Publik |
| POST | `/classify` | Klasifikasi prioritas tiket | `X-API-Key` |
| POST | `/faq-suggest` | Saran FAQ berdasarkan teks | `X-API-Key` |
| POST | `/sentiment` | Analisis sentimen teks | `X-API-Key` |
| POST | `/retrain` | Trigger retraining (background) | `X-API-Key` |

## Deployment

| Service | Platform | Tier |
|---|---|---|
| Frontend + API Routes | Vercel | Free (Hobby) |
| Database + Auth + Realtime + Storage | Supabase | Free |
| Edge Functions | Supabase | Free (500K invokasi/bulan) |
| ML Service | Railway | Starter ($5/bulan) |

## Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.

---
**Smart Campus Helpdesk UNSAP** — *Digitalizing Campus Services with Intelligence.*
*© 2026 Muhammad Lazuardi Al Farisi — Universitas Sebelas April (UNSAP)*

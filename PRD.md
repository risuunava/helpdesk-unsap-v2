# PRD — Smart Campus Helpdesk UNSAP (Rebuild)

**Dokumen:** Product Requirements Document  
**Versi:** 2.1  
**Status:** Implemented  
**Tanggal:** Juni 2026  
**Penulis:** Muhammad Lazuardi Al Farisi  

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Motivasi Rebuild](#2-latar-belakang--motivasi-rebuild)
3. [Tujuan & Sasaran](#3-tujuan--sasaran)
4. [Arsitektur Sistem Baru](#4-arsitektur-sistem-baru)
5. [Tech Stack](#5-tech-stack)
6. [Struktur Repositori](#6-struktur-repositori)
7. [Skema Database](#7-skema-database)
8. [Fitur & Kebutuhan Fungsional](#8-fitur--kebutuhan-fungsional)
9. [Kebutuhan Non-Fungsional](#9-kebutuhan-non-fungsional)
10. [Desain & UX](#10-desain--ux)
11. [Autentikasi & Otorisasi](#11-autentikasi--otorisasi)
12. [ML Service](#12-ml-service)
13. [Realtime & WebSocket](#13-realtime--websocket)
14. [Keamanan](#14-keamanan)
15. [Deployment & Infrastruktur](#15-deployment--infrastruktur)
16. [Rencana Migrasi Data](#16-rencana-migrasi-data)
17. [Acceptance Criteria](#17-acceptance-criteria)
18. [Roadmap & Milestone](#18-roadmap--milestone)
19. [Risiko & Mitigasi](#19-risiko--mitigasi)
20. [Glosarium](#20-glosarium)

---

## 1. Ringkasan Eksekutif

Smart Campus Helpdesk UNSAP adalah platform pelaporan dan penyelesaian keluhan mahasiswa berbasis web untuk Universitas Sebelas April (Sumedang). Sistem ini mengintegrasikan NLP (Natural Language Processing) Bahasa Indonesia untuk klasifikasi prioritas tiket otomatis dan deteksi sentimen kampus.

Dokumen ini mendefinisikan kebutuhan lengkap untuk **rebuild total** dari arsitektur lama (Laravel + Next.js + FastAPI + Supabase) ke arsitektur baru yang lebih ringkas: **Next.js (Vercel) + Supabase + FastAPI (Railway)** — mengeliminasi Laravel sepenuhnya dan menyederhanakan operasional dari 4 layer menjadi 2 service utama.

---

## 2. Latar Belakang & Motivasi Rebuild

### 2.1 Masalah Arsitektur Lama

| Masalah | Dampak |
|---|---|
| 3 runtime berbeda (Node.js, PHP, Python) | Setup lokal kompleks, Docker wajib untuk dev |
| Laravel hanya sebagai *middleman* proxy | Latensi tambahan tanpa nilai fungsional |
| Laravel Reverb self-hosted WebSocket | Infrastruktur ekstra, tidak managed |
| Queue Worker (`php artisan queue:work`) | Harus dijalankan manual, tidak auto-restart di cloud gratis |
| Laravel Sanctum sebagai auth layer | Duplikasi dengan Supabase Auth yang sudah ada |
| Deploy membutuhkan 3 platform terpisah | Biaya dan kompleksitas operasional tinggi |

### 2.2 Keputusan Arsitektur

**Dihapus:** Laravel 12 (backend, Sanctum, Reverb, Queue Worker, Controllers)  
**Dipertahankan & Ditingkatkan:** Next.js, FastAPI ML Service, Supabase PostgreSQL  
**Ditambahkan:** Supabase Auth, Supabase Realtime, Supabase Edge Functions, Supabase Storage  

### 2.3 Fitur yang Dipertahankan

Semua fitur dari versi 1 dipertahankan:
- Smart FAQ Suggestion (TF-IDF + Cosine Similarity)
- Klasifikasi prioritas otomatis (Logistic Regression + rule-based fallback)
- Fail-safe & auto-escalation keyword
- AI Active Learning (human-in-the-loop retraining)
- Live Chat Room real-time
- Pelaporan anonim dengan sistem kode unik
- Dashboard KPI & Campus Mood Analytics
- SLA Monitoring
- Rate limiting & file upload guard

---

## 3. Tujuan & Sasaran

### 3.1 Tujuan Bisnis

- Menyederhanakan pengelolaan insiden dan keluhan mahasiswa UNSAP
- Meningkatkan response time admin terhadap keluhan mahasiswa
- Menyediakan data sentimen kampus untuk pengambilan keputusan institusional
- Menjamin akses anonim yang aman bagi pelapor

### 3.2 Sasaran Teknis

- Mengurangi jumlah service dari 4 menjadi 2 (Next.js + ML Service)
- Waktu setup lokal < 10 menit (tanpa Docker)
- Cold start deployment < 5 menit via GitHub push
- 99.5% uptime untuk layer frontend dan database
- API response time rata-rata < 300ms untuk operasi CRUD biasa

### 3.3 Pengguna Target

| Role | Deskripsi | Akses |
|---|---|---|
| Mahasiswa | Pelapor keluhan, bisa anonim | Submit tiket, pantau status, live chat |
| Admin Departemen | Pengelola tiket per unit | Respon tiket, update status, chat |
| Master Admin | Administrator sistem penuh | Semua akses + analytics + ML retraining + identitas anonim |

---

## 4. Arsitektur Sistem Baru

### 4.1 Diagram Arsitektur

```
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
│    (background jobs) │  │   ML Service           │
└──────────────────────┘  │   FastAPI · Python     │
                          │   Railway.app          │
                          │                        │
                          │  • /classify            │
                          │  • /faq-suggest         │
                          │  • /sentiment           │
                          │  • /retrain             │
                          └────────────────────────┘
```

### 4.2 Data Flow: Submit Tiket

```
1. Mahasiswa isi form tiket di browser
2. Debounce 500ms → fetch /api/ml/suggest → forward ke ML Service /faq-suggest
3. Saran FAQ muncul real-time di UI (FaqSuggestion.tsx)
4. Submit → POST /api/tickets → validasi Zod + rate limit → insert ke Supabase DB
5. DB trigger auto-generate ticket_number (TKT-2026-XXXX) + set SLA deadline
6. DB Webhook memanggil Supabase Edge Function `process-ticket-ml`
7. Edge Function POST ke Railway ML Service /classify (timeout 5 detik)
8. ML Service return { priority, confidence, model_version }
9. Edge Function UPDATE tiket dengan priority hasil ML
10. Edge Function INSERT notifikasi ke semua admin
11. Supabase Realtime broadcast → notifikasi muncul di dashboard admin (NotificationBell.tsx)
```

### 4.3 Data Flow: Live Chat

```
1. Admin/Mahasiswa buka detail tiket → subscribe ke channel `ticket:{id}` via Supabase Realtime
2. User kirim pesan → POST /api/chat → insert ke tabel `messages`
3. Supabase Realtime broadcast ke semua subscriber channel tersebut
4. Pesan muncul instan di kedua sisi (ChatRoom.tsx + ChatMessage.tsx) tanpa polling
```

### 4.4 Data Flow: ML Retraining

```
1. Master Admin lihat data uncertain di /admin/ml (GET /api/admin/ml/uncertain)
2. Master Admin koreksi label → POST /api/admin/ml/label → insert ke tabel `ml_training_data`
3. Master Admin klik "Retrain Model" → POST /api/admin/ml/retrain → forward ke Railway /retrain
4. Railway ML Service lakukan retraining dengan dataset terbaru sebagai background task
5. Model baru dimuat ke memori FastAPI tanpa restart server (reload_model)
6. Response status dikembalikan ke dashboard
```

---

## 5. Tech Stack

### 5.1 Frontend & Backend API

| Komponen | Teknologi | Versi | Alasan |
|---|---|---|---|
| Framework | Next.js | 16.2.7 | App Router, API Routes, SSR/SSG |
| Bahasa | TypeScript | 5.x | Type safety end-to-end |
| Styling | Tailwind CSS | 4.x | Utility-first, multi-theme support |
| UI Components | Shadcn/UI + Radix UI | Latest | Accessible, customizable (67 komponen) |
| Ikon | Lucide React + Tabler Icons + Phosphor Icons | Latest | Konsisten dan beragam |
| Form | React Hook Form + Zod | 7.x / 4.x | Validasi schema-based |
| TanStack Form | @tanstack/react-form | 1.x | Form fields reusable |
| State & Fetching | TanStack Query | 5.x | Server state + caching |
| Table | TanStack Table | 8.x | Sortable, filterable data table |
| Charts | Recharts | 3.x | KPI, SLA, trend, sentiment charts |
| Animation | Framer Motion | 12.x | Micro-interactions & page transitions |
| Realtime client | @supabase/ssr + @supabase/supabase-js | 0.10.x / 2.x | Built-in Realtime subscription |
| Command Palette | kbar + cmdk | Latest | ⌘K command palette |
| Theme | next-themes | 0.4.x | 10 tema + dark/light mode |
| Toast | Sonner | 2.x | Toast notifications |
| Export | jsPDF + jspdf-autotable + XLSX | Latest | Export CSV/XLSX/PDF |
| File Upload | react-dropzone + react-easy-crop | Latest | Drag-drop + avatar cropping |
| Drawer | vaul | 1.x | Mobile-friendly drawer |
| Drag & Drop | @dnd-kit | 6.x | Kanban board support |
| Deploy | Vercel | — | Zero-config, edge network |

### 5.2 Database & Platform

| Komponen | Teknologi | Alasan |
|---|---|---|
| Database | Supabase PostgreSQL | Relasional, RLS, ENUM types, managed |
| Auth | Supabase Auth | JWT, role-based, RLS terintegrasi |
| Realtime | Supabase Realtime | Managed WebSocket via Postgres Changes |
| File Storage | Supabase Storage | 2 bucket (avatars, attachments), CDN |
| Background Jobs | Supabase Edge Functions (Deno) | Serverless, dipanggil via DB Webhook |
| Analytics | PostgreSQL RPC Functions | 5 fungsi analitik server-side |

### 5.3 ML Service

| Komponen | Teknologi | Versi | Alasan |
|---|---|---|---|
| Framework | FastAPI | 0.110.0 | Async, high-performance, type hints |
| Runtime | Python | 3.11+ | Kompatibel dengan semua library ML |
| ML Library | scikit-learn | 1.4.1 | Logistic Regression classifier |
| NLP Bahasa Indo | Sastrawi | 1.0.1 | Stemmer Bahasa Indonesia |
| Text Processing | NLTK + scikit-learn | 3.8.1 | TF-IDF Vectorization, Cosine Similarity |
| Data Processing | Pandas | 2.2.1 | DataFrame untuk training data |
| Serialisasi | joblib | 1.3.2 | Simpan/load model .pkl |
| Supabase Client | supabase-py | 2.4.1 | Fetch training data & sync FAQ |
| Schema | Pydantic | 2.6.4 | Request/response validation |
| Server | uvicorn | 0.29.0 | ASGI server untuk FastAPI |
| Deploy | Railway.app (Nixpacks) | — | Git deploy, health check, auto-restart |

---

## 6. Struktur Repositori

### 6.1 Monorepo (satu repo, dua service)

```
unsap-helpdeskv2/
│
├── .github/workflows/                # CI/CD (Vercel + Railway)
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group: Autentikasi
│   │   ├── layout.tsx                # Layout halaman auth
│   │   ├── login/page.tsx            # Halaman login
│   │   └── register/page.tsx         # Halaman registrasi
│   ├── (dashboard)/                  # Route group: Dashboard
│   │   ├── layout.tsx                # Layout dashboard
│   │   ├── admin/
│   │   │   ├── page.tsx              # Dashboard admin (list semua tiket)
│   │   │   ├── tiket/page.tsx        # Tabel tiket admin
│   │   │   ├── tiket/[id]/page.tsx   # Detail tiket + split-view chat
│   │   │   ├── analytics/page.tsx    # KPI, SLA, trend, sentiment chart
│   │   │   └── ml/page.tsx           # ML management (master admin only)
│   │   ├── mahasiswa/
│   │   │   ├── page.tsx              # Dashboard mahasiswa (tiket sendiri)
│   │   │   ├── submit/page.tsx       # Form submit tiket + FAQ suggestion
│   │   │   └── tiket/[id]/page.tsx   # Detail tiket + live chat
│   │   ├── notifications/            # Pusat notifikasi
│   │   │   ├── page.tsx              # Server component
│   │   │   └── client.tsx            # Client component (realtime)
│   │   ├── profile/page.tsx          # Edit profil + avatar crop
│   │   └── settings/page.tsx         # Pengaturan (tema, preferensi)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts     # Supabase Auth callback
│   │   │   └── logout/route.ts       # Logout handler
│   │   ├── tickets/
│   │   │   ├── route.ts              # GET (list) + POST (create)
│   │   │   └── [id]/route.ts         # GET + PATCH + DELETE
│   │   ├── chat/route.ts             # POST kirim pesan
│   │   ├── analytics/route.ts        # GET KPI, SLA, distribusi
│   │   ├── notifications/route.ts    # GET/PATCH notifikasi
│   │   ├── ml/suggest/route.ts       # POST → ML /faq-suggest
│   │   └── admin/ml/
│   │       ├── label/route.ts        # POST koreksi label
│   │       ├── retrain/route.ts      # POST trigger retrain
│   │       ├── stats/route.ts        # GET model stats
│   │       └── uncertain/route.ts    # GET data uncertain
│   ├── themes/                       # 10 tema CSS
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css
│   └── theme.css
│
├── components/                       # Komponen UI Reusable
│   ├── ui/                           # 67 base components (Shadcn/UI)
│   ├── ticket/                       # FaqSuggestion, TicketActions
│   ├── chat/                         # ChatRoom, ChatMessage
│   ├── dashboard/                    # KpiCard, SlaChart, SentimentChart, CategoryChart, TrendChart
│   ├── layout/                       # Sidebar, Header, BottomNav, NotificationBell, CommandMenu, dll.
│   ├── forms/                        # Form system + 9 field components
│   ├── themes/                       # Theme provider, selector, mode toggle
│   ├── kbar/                         # Command palette
│   ├── modal/                        # Alert modal, image cropper modal
│   └── file-uploader.tsx
│
├── hooks/                            # 18 Custom React Hooks
│   ├── useTickets.ts                 # Data tiket mahasiswa
│   ├── useAdminTickets.ts            # Data tiket admin + filter
│   ├── useTicketForm.ts              # Logic form submit
│   ├── useChat.ts                    # Realtime chat subscription
│   ├── useNotifications.ts           # Notifikasi realtime
│   ├── useAuth.ts                    # Auth state
│   ├── useProfile.ts                 # Profil user
│   └── ...                           # use-nav, use-toast, use-debounce, dll.
│
├── lib/                              # Utilities & Libraries
│   ├── supabase/                     # Client (browser) + Server Supabase
│   ├── validations/                  # Zod schemas (ticket, auth)
│   ├── ml.ts                         # Helper fetch ML Service
│   ├── anonymize.ts                  # Generate kode anonim
│   ├── escalation.ts                 # Keyword auto-escalation
│   ├── auth.ts                       # Auth utilities
│   ├── rateLimit.ts                  # Rate limiting logic
│   ├── export.ts                     # Export CSV/XLSX/PDF
│   └── ...                           # format, api-client, query-client, utils
│
├── types/
│   ├── database.ts                   # Supabase generated types (ENUM)
│   └── index.ts                      # NavItem, NavGroup types
│
├── config/nav-config.ts              # Konfigurasi navigasi
│
├── styles/
│   ├── globals.css
│   ├── theme.css
│   └── themes/                       # 10 tema CSS preset
│
├── supabase/
│   ├── config.toml
│   ├── functions/process-ticket-ml/  # Edge Function (Deno)
│   └── migrations/                   # 18 migration files
│
├── ml-service/                       # Python ML Service (Railway)
│   ├── main.py                       # FastAPI (5 endpoints)
│   ├── train.py                      # Logistic Regression pipeline
│   ├── start.py                      # Railway startup (sync + train + serve)
│   ├── sync_faqs.py                  # Sync FAQ dari Supabase
│   ├── requirements.txt              # 9 Python dependencies
│   ├── Procfile + railway.json       # Railway config
│   ├── datasets/                     # dataset.csv + faqs.json
│   ├── models/                       # .pkl files
│   └── utils/                        # preprocessor + model_loader
│
├── proxy.ts                          # Next.js middleware (auth guard)
├── next.config.ts
├── package.json                      # ~80 npm dependencies
├── components.json                   # Shadcn/UI config
└── .env.local.example
```

---

## 7. Skema Database

### 7.1 ENUM Types

```sql
-- Custom ENUM types (migration: 20260614070304)
CREATE TYPE user_role AS ENUM ('mahasiswa', 'admin', 'master_admin');
CREATE TYPE ticket_category AS ENUM ('akademik', 'keuangan', 'fasilitas', 'keamanan', 'lainnya');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'urgent');
```

### 7.2 Tabel Utama

```sql
-- USERS (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nim           TEXT UNIQUE,                    -- NULL untuk admin
  full_name     TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'mahasiswa',
  department    TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- TICKETS
CREATE TABLE public.tickets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number        TEXT UNIQUE NOT NULL,          -- Format: TKT-2026-XXXX
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  category             ticket_category NOT NULL,
  status               ticket_status NOT NULL DEFAULT 'open',
  priority             ticket_priority NOT NULL DEFAULT 'normal',
  is_anonymous         BOOLEAN DEFAULT FALSE,
  anonymous_code       TEXT,                          -- Anonim_#XXXX
  reporter_id          UUID REFERENCES public.profiles(id),
  assigned_to          UUID REFERENCES public.profiles(id),
  department           TEXT,
  attachment_url       TEXT,                          -- Supabase Storage URL
  ml_confidence        FLOAT,
  ml_model_version     TEXT,
  priority_overridden  BOOLEAN DEFAULT FALSE,
  sla_deadline         TIMESTAMPTZ,
  resolved_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES (Live Chat)
CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id),
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ
CREATE TABLE public.faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    VARCHAR(50),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ML TRAINING DATA (Active Learning)
CREATE TABLE public.ml_training_data (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         UUID REFERENCES public.tickets(id),
  text_input        TEXT NOT NULL,               -- Gabungan title + description
  ml_prediction     TEXT NOT NULL,               -- Prediksi awal ML
  corrected_label   TEXT NOT NULL,               -- Koreksi dari Master Admin
  corrected_by      UUID REFERENCES public.profiles(id),
  model_version     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET RATE LIMIT
CREATE TABLE public.ticket_rate_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  count       INTEGER DEFAULT 1,
  UNIQUE(user_id, date)
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  type        TEXT NOT NULL,                     -- new_ticket | ticket_update | new_message | sla_warning
  title       TEXT NOT NULL,
  body        TEXT,
  ticket_id   UUID REFERENCES public.tickets(id),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 Database Triggers & Functions

```sql
-- Auto-generate ticket number
CREATE TRIGGER set_ticket_number
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();
-- Format: TKT-{YEAR}-{SEQ_PADDED_4_DIGITS}

-- Auto-set SLA deadline berdasarkan priority
CREATE TRIGGER set_ticket_sla
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION set_sla_deadline();
-- urgent=4 jam, normal=24 jam, low=72 jam

-- Auto-update updated_at timestamp
CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.tickets ...
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles ...

-- Auto-create profile saat user register
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- Reads raw_user_meta_data: full_name, role, nim
```

### 7.4 Analytics RPC Functions

```sql
-- 5 server-side analytics functions (migration: 20260605000010)
get_kpi_summary()        -- Total, open, in_progress, resolved, overdue, avg_resolve_hours
get_weekly_trend()       -- Tiket per minggu (last 8 weeks)
get_tickets_by_category() -- Distribusi per kategori
get_tickets_by_priority() -- Distribusi per prioritas
get_sla_compliance()     -- Persentase SLA compliance (within_sla / total_resolved)
```

### 7.5 Row Level Security (RLS)

```sql
-- RLS diaktifkan pada SEMUA 7 tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_rate_limits ENABLE ROW LEVEL SECURITY;

-- Key policies:
-- TICKETS: Mahasiswa lihat tiket sendiri; admin/master_admin lihat semua
-- MESSAGES: Hanya peserta tiket (reporter + assigned + admin)
-- NOTIFICATIONS: Hanya user sendiri
-- FAQS: Public read (is_active=true); manage oleh admin/master_admin
-- ML_TRAINING_DATA: Hanya master_admin
-- RATE_LIMITS: Hanya user sendiri
-- PROFILES: User lihat sendiri; admin lihat semua
```

### 7.6 Realtime Setup

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### 7.7 Storage Buckets & Policies

```sql
-- 2 Storage Buckets (migration: 20260614000018)
-- 1. 'avatars' — Public read, authenticated upload/update/delete (format: {userId}-{random}.{ext})
-- 2. 'attachments' — Public read, authenticated upload, owner/admin delete
```

---

## 8. Fitur & Kebutuhan Fungsional

### 8.1 Autentikasi & Manajemen Akun

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-AUTH-01 | Login dengan email & password | Via Supabase Auth | ✅ |
| F-AUTH-02 | Register mahasiswa | Input NIM, nama, email, password | ✅ |
| F-AUTH-03 | Session persistence | JWT token, auto-refresh via `proxy.ts` middleware | ✅ |
| F-AUTH-04 | Middleware route guard | Redirect ke login jika belum auth (`proxy.ts`) | ✅ |
| F-AUTH-05 | Profil user | Edit nama, avatar dengan image cropper modal | ✅ |
| F-AUTH-06 | Role-based redirect | Mahasiswa → /mahasiswa, Admin → /admin | ✅ |
| F-AUTH-07 | Logout | Via `/api/auth/logout` route | ✅ |
| F-AUTH-08 | Auto-create profile | Trigger DB `handle_new_user` saat register | ✅ |

### 8.2 Manajemen Tiket (Mahasiswa)

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-TKT-01 | Submit tiket | Form: judul, kategori, deskripsi, departemen, lampiran, pilihan anonim | ✅ |
| F-TKT-02 | Saran FAQ real-time | Debounce → call ML /faq-suggest saat user mengetik (`FaqSuggestion.tsx`) | ✅ |
| F-TKT-03 | Pelaporan anonim | Jika dicentang, identitas digantikan kode unik `Anonim_#XXXX` | ✅ |
| F-TKT-04 | Upload lampiran | Maks 2MB, ekstensi: jpg, jpeg, png, pdf → Supabase Storage | ✅ |
| F-TKT-05 | List tiket sendiri | Tabel dengan status, prioritas, tanggal (`useTickets.ts`) | ✅ |
| F-TKT-06 | Detail tiket | Lihat info lengkap + status progress + live chat | ✅ |
| F-TKT-07 | Rate limiting | Maks 3 tiket per hari per user (`rateLimit.ts`) | ✅ |

### 8.3 Manajemen Tiket (Admin)

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-ADM-01 | Dashboard semua tiket | Tabel dengan filter status, prioritas, kategori, tanggal (`useAdminTickets.ts`) | ✅ |
| F-ADM-02 | Assign tiket | Assign ke admin lain atau diri sendiri (`TicketActions.tsx`) | ✅ |
| F-ADM-03 | Update status | Open → In Progress → Resolved → Closed | ✅ |
| F-ADM-04 | Update prioritas | Override prioritas ML secara manual | ✅ |
| F-ADM-05 | SLA indicator | Badge hijau/kuning/merah (`SlaIndicator.tsx`) | ✅ |
| F-ADM-06 | Filter & search | Filter per kategori, departemen, tanggal, status | ✅ |
| F-ADM-07 | Notifikasi realtime | Notif tiket baru via `NotificationBell.tsx` + `useNotifications.ts` | ✅ |
| F-ADM-08 | Export data | Export ke CSV/XLSX/PDF (`export.ts`) | ✅ |

### 8.4 Live Chat

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-CHAT-01 | Chat room per tiket | Satu room per tiket (`ChatRoom.tsx`) | ✅ |
| F-CHAT-02 | Realtime messaging | Pesan muncul instan via Supabase Realtime (`useChat.ts`) | ✅ |
| F-CHAT-03 | Split-view admin | Panel kiri: detail tiket, panel kanan: chat | ✅ |
| F-CHAT-04 | Timestamp pesan | Tampilkan waktu setiap pesan (`ChatMessage.tsx`) | ✅ |
| F-CHAT-05 | Anonimitas di chat | Nama mahasiswa anonim disembunyikan dari admin biasa | ✅ |

### 8.5 ML & Klasifikasi

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-ML-01 | Klasifikasi prioritas otomatis | Via Edge Function `process-ticket-ml` (async) | ✅ |
| F-ML-02 | Logistic Regression classifier | TF-IDF + Logistic Regression (class_weight='balanced') | ✅ |
| F-ML-03 | Auto-escalation keyword (fallback) | Override ke Urgent jika ML tidak tersedia + ada kata kunci sensitif | ✅ |
| F-ML-04 | Fail-safe fallback | Jika ML timeout (5s) / error, tiket tetap Normal + notif tetap terkirim | ✅ |
| F-ML-05 | FAQ suggestion | TF-IDF + Cosine Similarity, threshold > 0.15, top K results | ✅ |
| F-ML-06 | Sentiment analysis | Keyword-based positive/negative/neutral scoring | ✅ |
| F-ML-07 | Data uncertain | GET /api/admin/ml/uncertain — tiket dengan confidence rendah | ✅ |
| F-ML-08 | Koreksi label | POST /api/admin/ml/label — Master Admin koreksi prediksi | ✅ |
| F-ML-09 | Trigger retraining | POST /api/admin/ml/retrain → Railway /retrain (background task) | ✅ |
| F-ML-10 | Model stats | GET /api/admin/ml/stats — statistik model aktif | ✅ |
| F-ML-11 | Auto-train on startup | `start.py` — train otomatis jika belum ada model | ✅ |
| F-ML-12 | FAQ sync dari Supabase | `sync_faqs.py` — sync FAQ tabel ke faqs.json | ✅ |

### 8.6 Analytics & Laporan

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-ANL-01 | KPI Cards | Total tiket, open, in_progress, resolved, overdue, avg resolve hours (`KpiCard.tsx`) | ✅ |
| F-ANL-02 | SLA Compliance chart | % tiket diselesaikan dalam SLA (`SlaChart.tsx`) | ✅ |
| F-ANL-03 | Tiket per kategori | Pie/bar chart distribusi kategori (`CategoryChart.tsx`) | ✅ |
| F-ANL-04 | Trend tiket | Line chart tiket masuk per minggu (8 minggu) (`TrendChart.tsx`) | ✅ |
| F-ANL-05 | Sentiment Analytics | Agregat sentimen per bulan (`SentimentChart.tsx`) | ✅ |
| F-ANL-06 | Export data | Export tabel tiket ke CSV/XLSX/PDF | ✅ |

### 8.7 Notifikasi

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-NOT-01 | Pusat notifikasi | Halaman dedicated `/notifications` | ✅ |
| F-NOT-02 | Bell realtime | NotificationBell di header dengan badge count | ✅ |
| F-NOT-03 | Mark as read | Tandai notifikasi sudah dibaca | ✅ |
| F-NOT-04 | Auto-notif tiket baru | Edge Function insert notifikasi ke semua admin | ✅ |

### 8.8 Settings & Personalisasi

| ID | Fitur | Deskripsi | Status |
|---|---|---|---|
| F-SET-01 | Multi-theme | 10 tema CSS (astro-vista, claude, supabase, vercel, dll.) | ✅ |
| F-SET-02 | Dark/Light mode | Toggle via next-themes | ✅ |
| F-SET-03 | Settings page | Halaman pengaturan preferensi | ✅ |
| F-SET-04 | Command palette | ⌘K shortcut untuk navigasi cepat | ✅ |

---

## 9. Kebutuhan Non-Fungsional

### 9.1 Performa

- **Page load (LCP):** < 2.5 detik untuk halaman dashboard
- **API response time:** < 300ms untuk operasi CRUD (P95)
- **ML classification time:** < 5 detik per tiket (background via Edge Function, tidak blokir UX)
- **FAQ suggestion latency:** < 800ms dari debounce trigger
- **Realtime message delivery:** < 500ms dari send ke receive

### 9.2 Skalabilitas

- Arsitektur serverless (Vercel + Supabase Edge Functions) auto-scale sesuai demand
- ML Service di Railway bisa di-scale manual jika traffic meningkat
- Database PostgreSQL di Supabase dengan connection pooling via PgBouncer

### 9.3 Ketersediaan

- Frontend (Vercel): 99.99% uptime SLA (managed)
- Database (Supabase): 99.9% uptime SLA (managed)
- ML Service (Railway): Best-effort; ada fallback (Normal priority + notif tetap terkirim jika ML down)

### 9.4 Keamanan

- Semua komunikasi via HTTPS/WSS
- Auth token dikelola via `@supabase/ssr` (cookie-based)
- Input sanitization di server (API Routes) dan client (Zod schema)
- File upload validation: mime type + ukuran + ekstensi
- Rate limiting: maks 3 tiket/hari/user (DB-level)
- RLS Supabase pada semua 7 tabel sebagai lapisan keamanan database
- ENUM types untuk validasi di level database
- API Key ML Service via header `X-API-Key`

### 9.5 Aksesibilitas

- Shadcn/UI berbasis Radix UI (accessible by default)
- Keyboard navigation untuk semua form interaktif
- ARIA labels dan semantic HTML

### 9.6 Kompatibilitas Browser

- Chrome 100+, Firefox 100+, Safari 16+, Edge 100+
- Mobile: iOS Safari 16+, Chrome Android 100+
- Responsive design: mobile-first + BottomNav untuk mobile

---

## 10. Desain & UX

### 10.1 Design System

**Multi-theme support** dengan 10 preset tema CSS:
- astro-vista, claude, light-green, mono, neobrutualism, notebook, supabase, vercel, whatsapp, zen

Seluruh detail implementasi mengacu pada pedoman dalam `DESIGN.md`.

**Tipografi:** Configurable via `font.config.ts`
**Theming:** `next-themes` dengan dark/light mode toggle

### 10.2 Halaman Utama

| Path | Nama | Deskripsi |
|---|---|---|
| `/` | Landing Page | Hero + fitur utama + CTA login |
| `/login` | Login | Form email + password |
| `/register` | Register | Form data mahasiswa (NIM, nama, email, password) |
| `/mahasiswa` | Dashboard Mahasiswa | List tiket sendiri + tombol submit |
| `/mahasiswa/submit` | Submit Tiket | Form lengkap + FAQ suggestion |
| `/mahasiswa/tiket/[id]` | Detail Tiket | Status tiket + chat room |
| `/admin` | Dashboard Admin | Semua tiket + filter + KPI summary |
| `/admin/tiket` | Tabel Tiket Admin | Filter, search, SLA indicator |
| `/admin/tiket/[id]` | Detail Tiket Admin | Split-view: detail + chat |
| `/admin/analytics` | Analytics | Chart KPI, SLA, trend, sentiment, kategori |
| `/admin/ml` | ML Management | Uncertain data + koreksi label + retrain (master admin) |
| `/notifications` | Pusat Notifikasi | List notifikasi + mark as read |
| `/profile` | Edit Profil | Nama, avatar crop & upload |
| `/settings` | Pengaturan | Tema, preferensi |

### 10.3 Komponen Kunci

**TicketActions.tsx (Admin)**
- Update status: Open → In Progress → Resolved → Closed
- Update priority: Low / Normal / Urgent
- Assign ke admin lain

**FaqSuggestion.tsx**
- Muncul sebagai floating card saat ada FAQ relevan (score > 0.15)
- Data dari ML Service /faq-suggest

**ChatRoom.tsx + ChatMessage.tsx**
- Bubble chat dengan timestamp
- Input field sticky di bawah
- Auto-scroll ke pesan terbaru
- Realtime via Supabase Postgres Changes

**PriorityBadge.tsx**
- `low` → Outline style, abu-abu
- `normal` → Blue style
- `urgent` → Red style + emphasis

**SlaIndicator.tsx**
- Hijau: > 50% waktu SLA tersisa
- Kuning: 10-50% waktu SLA tersisa
- Merah: < 10% tersisa atau sudah lewat

**NotificationBell.tsx**
- Dropdown bell di header
- Badge count unread
- Realtime subscription

---

## 11. Autentikasi & Otorisasi

### 11.1 Flow Autentikasi

```
Register:
User isi form → Supabase signUp({ email, password, options: { data: { full_name, nim, role } } })
→ DB trigger handle_new_user() auto-create profile → Redirect sesuai role

Login:
User isi form → Supabase signInWithPassword() →
Session JWT disimpan (cookie-based via @supabase/ssr) →
proxy.ts middleware baca session → Redirect ke /mahasiswa atau /admin

Logout:
POST /api/auth/logout → Supabase signOut() → Redirect ke /login
```

### 11.2 Middleware Next.js (proxy.ts)

```typescript
// proxy.ts
// Proteksi: /mahasiswa/*, /admin/* → redirect ke /login jika !user
// Auto-redirect: /login, /register → redirect ke dashboard jika sudah login
// Role-based: mahasiswa → /mahasiswa, admin/master_admin → /admin
// Session refresh: supabase.auth.getUser() dipanggil setiap request
```

### 11.3 Matriks Permission

| Aksi | Mahasiswa | Admin | Master Admin |
|---|---|---|---|
| Submit tiket | ✓ | ✗ | ✗ |
| Lihat tiket sendiri | ✓ | ✓ | ✓ |
| Lihat semua tiket | ✗ | ✓ | ✓ |
| Update status tiket | ✗ | ✓ | ✓ |
| Lihat identitas anonim | ✗ | ✗ | ✓ |
| Lihat analytics | ✗ | ✓ | ✓ |
| Lihat sentiment chart | ✗ | ✗ | ✓ |
| Koreksi label ML | ✗ | ✗ | ✓ |
| Trigger retrain | ✗ | ✗ | ✓ |
| Manage FAQ | ✗ | ✓ | ✓ |
| Edit profil sendiri | ✓ | ✓ | ✓ |

### 11.4 Logika Anonimitas

```typescript
// lib/anonymize.ts
// Deterministik: hash userId → kode 4 karakter hex → Anonim_#8A2C
// Di API Route GET /api/tickets/[id]:
// - Jika is_anonymous=true DAN role requester BUKAN master_admin:
//   → Kembalikan anonymous_code alih-alih reporter_id + nama asli
// - Jika role = master_admin:
//   → Kembalikan semua data termasuk identitas asli
```

---

## 12. ML Service

### 12.1 Endpoint API

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| GET | `/` | Service info + endpoint list | Publik |
| GET | `/health` | Health check | Publik |
| POST | `/classify` | Klasifikasi prioritas tiket | `X-API-Key` |
| POST | `/faq-suggest` | Saran FAQ berdasarkan teks | `X-API-Key` |
| POST | `/sentiment` | Analisis sentimen teks | `X-API-Key` |
| POST | `/retrain` | Trigger retraining (background task) | `X-API-Key` |

### 12.2 Request/Response Schema

**POST /classify**
```json
// Request
{ "text": "Saya belum menerima KRS untuk semester ini padahal sudah bayar UKT" }

// Response (ML model active)
{
  "priority": "urgent",
  "confidence": 0.93,
  "model_version": "model_20260611_190002",
  "overridden_by_keyword": false,
  "keyword_matched": null
}

// Response (rule-based fallback — ML not loaded)
{
  "priority": "urgent",
  "confidence": 1.0,
  "model_version": "rule_based_fallback",
  "overridden_by_keyword": true,
  "keyword_matched": "krs"
}
```

**POST /faq-suggest**
```json
// Request
{ "text": "Bagaimana cara mengurus cuti akademik?", "top_k": 3 }

// Response
{
  "suggestions": [
    {
      "faq_id": "uuid",
      "question": "Bagaimana prosedur pengajuan cuti akademik?",
      "answer": "...",
      "score": 0.87
    }
  ]
}
```

**POST /sentiment**
```json
// Request
{ "text": "Pelayanan sangat lambat dan tidak membantu" }

// Response
{ "score": 0.167, "label": "negative" }
```

**POST /retrain**
```json
// Response
{ "message": "Retraining started in background" }
```

### 12.3 ML Architecture

**Primary: Logistic Regression** (scikit-learn)
- Vectorizer: TF-IDF (max_features=5000, ngram_range=(1,2))
- Model: LogisticRegression (max_iter=1000, class_weight='balanced')
- Training split: 80/20 (stratified)
- Final model: retrained on 100% data for deployment

**Fallback: Rule-Based Keyword Matching** (hanya aktif jika model tidak ter-load)
```python
URGENT_KEYWORDS = [
  "krs", "ukt", "uang kuliah", "spp", "beasiswa",
  "kebakaran", "kecelakaan", "darurat",
  "pelecehan", "kekerasan", "bullying", "pencurian", "kehilangan",
  "do", "drop out", "tidak lulus", "wisuda", "ijazah",
  "sakit parah", "keracunan", "pingsan"
]
```

**FAQ Engine:** TF-IDF + Cosine Similarity
- FAQ data synced dari Supabase tabel `faqs` → `faqs.json` (via `sync_faqs.py`)
- Similarity threshold: 0.15
- Corpus: question + answer combined

**Sentiment Analysis:** Keyword-based scoring
- Positive words: terima kasih, bagus, puas, cepat, profesional, dll.
- Negative words: buruk, lambat, kecewa, sulit, lama, dll.
- Score: positive_count / total_count → label (positive > 0.6, negative < 0.4, else neutral)

### 12.4 Preprocessing Pipeline (utils/preprocessor.py)

1. Lowercase
2. Remove special characters
3. Stopword removal (NLTK Indonesian)
4. Stemming (Sastrawi — Bahasa Indonesia stemmer)

### 12.5 Supabase Edge Function: process-ticket-ml

```typescript
// supabase/functions/process-ticket-ml/index.ts
// Dipanggil via DB Webhook setelah INSERT ke tabel tickets
// Flow:
// 1. Parse payload.record (ticket data)
// 2. POST ke ML Service /classify dengan title + description
// 3. Timeout: 5 detik (AbortController)
// 4. UPDATE tiket dengan priority, ml_confidence, ml_model_version, priority_overridden
// 5. INSERT notifikasi ke semua admin & master_admin
// 6. Fallback: jika ML error/timeout → notif tetap terkirim (tanpa ML update)
```

### 12.6 Startup Flow (Railway)

```
1. sync_faqs.py → Fetch FAQs dari Supabase → Save ke faqs.json
2. train.py → Load data (Supabase / CSV) → Train → Save model .pkl
3. main.py → FastAPI server start → Preload model + FAQ index (background thread)
```

---

## 13. Realtime & WebSocket

### 13.1 Channel Design (Supabase Realtime)

| Channel | Event | Subscribe | Hook |
|---|---|---|---|
| `ticket:{ticketId}` | INSERT on messages | Mahasiswa + Admin | `useChat.ts` |
| `tickets:admin` | INSERT/UPDATE on tickets | Semua admin | `useAdminTickets.ts` |
| `notifications:{userId}` | INSERT on notifications | Semua user | `useNotifications.ts` |

### 13.2 Implementasi Client

```typescript
// hooks/useChat.ts
const channel = supabase
  .channel(`ticket:${ticketId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `ticket_id=eq.${ticketId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new as Message]);
  })
  .subscribe();
```

### 13.3 Fallback

Jika Supabase Realtime tidak tersambung (jaringan buruk):
- Tampilkan indikator "Reconnecting..." di UI
- Auto-reconnect dengan exponential backoff
- Data tetap bisa diakses via polling manual (tombol "Refresh")

---

## 14. Keamanan

### 14.1 Input Validation

Semua input divalidasi dua lapisan:
1. **Client-side:** Zod schema di `react-hook-form` (`lib/validations/`)
2. **Server-side:** Zod schema di setiap API Route sebelum operasi DB

### 14.2 File Upload Guard

```typescript
// Validasi di client (react-dropzone) dan server sebelum upload ke Supabase Storage
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// File disimpan di Supabase Storage:
// - Avatars: avatars/{userId}-{random}.{ext}
// - Attachments: attachments/{ticketId}/{fileName}
```

### 14.3 Rate Limiting

```typescript
// lib/rateLimit.ts
// Business logic: maks 3 tiket/hari/user
// Dicek via tabel ticket_rate_limits sebelum INSERT
```

### 14.4 API Key ML Service

ML Service membutuhkan header `X-API-Key` untuk semua endpoint (kecuali `/` dan `/health`). API Key disimpan sebagai environment variable di Railway dan Supabase Edge Functions. Tidak pernah di-expose ke client.

### 14.5 Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server-only
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ML_SERVICE_URL=https://xxx.railway.app
ML_SERVICE_API_KEY=sk-...

# Supabase Edge Functions (set via Supabase CLI)
ML_SERVICE_URL=https://xxx.railway.app
ML_API_KEY=sk-...

# Railway ML Service
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ML_API_KEY=sk-...
```

---

## 15. Deployment & Infrastruktur

### 15.1 Platform & Biaya

| Service | Platform | Tier | Estimasi Biaya |
|---|---|---|---|
| Frontend + API Routes | Vercel | Free (Hobby) | Gratis |
| Database + Auth + Realtime + Storage | Supabase | Free | Gratis |
| Edge Functions | Supabase | Free (500K invokasi/bulan) | Gratis |
| ML Service | Railway | Starter ($5 kredit/bulan) | ~$5/bulan |

**Total estimasi: ~$5/bulan** (vs sebelumnya yang membutuhkan VPS/Docker)

### 15.2 Deployment Pipeline

**Next.js (Vercel):**
```
Push ke branch main → Vercel auto-detect → Build → Deploy otomatis
Preview deployment untuk setiap PR
```

**ML Service (Railway):**
```
Push ke branch main → Railway detect Nixpacks →
Build image → Deploy → Health check /health → Auto-expose HTTPS URL
railway.json: restartPolicyType=ON_FAILURE, maxRetries=10
```

**Supabase Migrations:**
```
Jalankan lokal: supabase db push
Atau via CI: supabase db push --linked (setelah supabase link)
```

**Supabase Edge Functions:**
```
Deploy: supabase functions deploy process-ticket-ml
```

### 15.3 Setup Lokal (Tanpa Docker)

```bash
# 1. Clone repo
git clone https://github.com/risuunava/helpdesk-unsap-v2.git
cd helpdesk-unsap-v2

# 2. Install Next.js dependencies
npm install

# 3. Copy env dan isi dengan kredensial Supabase
cp .env.local.example .env.local

# 4. Jalankan Supabase local (opsional, bisa pakai hosted)
supabase start

# 5. Jalankan migrasi DB (18 migration files)
supabase db push

# 6. Deploy Edge Function ke lokal
supabase functions serve process-ticket-ml

# 7. Setup ML Service
cd ml-service
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train.py          # Training model pertama kali
uvicorn main:app --reload --port 8000

# 8. Jalankan Next.js
cd ..
npm run dev
# → http://localhost:3000
```

### 15.4 Environment Variables CI/CD

Semua environment variable diset via:
- **Vercel:** Dashboard > Settings > Environment Variables
- **Railway:** Dashboard > Variables
- **Supabase:** `supabase secrets set KEY=VALUE`

---

## 16. Rencana Migrasi Data

### 16.1 Scope Migrasi

Data yang perlu dimigrasikan dari sistem v1:
- `users` → `profiles`
- `tickets` → `tickets` (mapping field)
- `chat_messages` → `messages`
- `faqs` → `faqs`
- `ml_training_data` → `ml_training_data`

File lampiran di storage lama → Supabase Storage (bucket: attachments)

### 16.2 Validasi Pasca-Migrasi

- [ ] Jumlah row di setiap tabel sama dengan source
- [ ] Semua relasi foreign key valid
- [ ] File lampiran accessible via Supabase Storage URL
- [ ] Model ML tetap akurat dengan dataset yang sudah dimigrasikan
- [ ] Spot-check 10 tiket secara manual

---

## 17. Acceptance Criteria

### 17.1 Authentication

- [x] Mahasiswa bisa register dengan NIM + email + password
- [x] Login berhasil dan redirect ke halaman yang benar sesuai role
- [x] Halaman `/admin/*` tidak bisa diakses tanpa login admin
- [x] Halaman `/mahasiswa/*` tidak bisa diakses tanpa login mahasiswa
- [x] Session tidak hilang setelah refresh halaman
- [x] Auto-create profile via DB trigger saat register

### 17.2 Tiket

- [x] Mahasiswa bisa submit tiket dengan dan tanpa lampiran
- [x] Tiket anonim menampilkan kode `Anonim_#XXXX` bukan nama asli untuk admin biasa
- [x] Master Admin bisa melihat identitas asli tiket anonim
- [x] Submit ke-4 di hari yang sama ditolak dengan pesan error yang jelas
- [x] File > 2MB atau ekstensi tidak valid ditolak di client dan server
- [x] Tiket nomor auto-generate dalam format `TKT-2026-XXXX`
- [x] SLA deadline auto-set berdasarkan priority

### 17.3 ML & Klasifikasi

- [x] Prioritas tiket ter-update otomatis setelah submit (via Edge Function)
- [x] Jika ML Service down, tiket tetap masuk dengan prioritas Normal (tidak error)
- [x] FAQ Suggestion muncul setelah berhenti mengetik
- [x] Master Admin bisa koreksi label dan trigger retrain dari dashboard
- [x] Model auto-train saat startup jika belum ada model file
- [x] FAQ auto-sync dari Supabase saat startup

### 17.4 Realtime

- [x] Pesan chat muncul di kedua sisi tanpa refresh halaman
- [x] Admin mendapat notifikasi tiket baru tanpa refresh
- [x] Reconnect otomatis jika koneksi WebSocket putus

### 17.5 Analytics

- [x] Dashboard admin menampilkan KPI cards yang akurat
- [x] Tiket yang melewati SLA ditandai di tabel (SlaIndicator)
- [x] Chart sentiment, trend, kategori, SLA compliance tersedia
- [x] Analytics menggunakan server-side RPC functions

### 17.6 UX

- [x] 10 tema CSS tersedia dan bisa di-switch
- [x] Dark/light mode toggle berfungsi
- [x] Command palette (⌘K) untuk navigasi cepat
- [x] Responsive design dengan BottomNav untuk mobile
- [x] Profile page dengan avatar image cropper

---

## 18. Roadmap & Milestone

### Phase 1 — Foundation ✅

- [x] Setup Supabase project (skema DB, RLS, Realtime)
- [x] Inisialisasi Next.js 16 dengan TypeScript + Tailwind v4 + Shadcn/UI
- [x] Implementasi Supabase Auth (register, login, middleware/proxy)
- [x] Setup Railway untuk ML Service + deploy
- [x] Halaman landing page
- [x] Halaman login & register

### Phase 2 — Core Features ✅

- [x] Dashboard mahasiswa + list tiket
- [x] Form submit tiket + upload lampiran ke Supabase Storage
- [x] Logika anonimitas + rate limiting
- [x] Dashboard admin + tabel tiket dengan filter
- [x] Update status & prioritas tiket
- [x] Assign tiket

### Phase 3 — ML Integration ✅

- [x] FAQ Suggestion (debounce + call ML /faq-suggest)
- [x] Supabase Edge Function `process-ticket-ml`
- [x] Auto-escalation keyword detection (rule-based fallback)
- [x] Fail-safe fallback (priority Normal jika ML timeout)
- [x] Dashboard ML management untuk Master Admin
- [x] Koreksi label + uncertain data view + retrain trigger

### Phase 4 — Realtime & Chat ✅

- [x] Live Chat Room dengan Supabase Realtime
- [x] Split-view admin (detail + chat)
- [x] Sistem notifikasi realtime (NotificationBell + pusat notifikasi)
- [x] Anonimitas di chat

### Phase 5 — Analytics & Polish ✅

- [x] KPI cards + SLA monitoring (PostgreSQL RPC functions)
- [x] Chart distribusi kategori, trend tiket, SLA compliance
- [x] Campus Sentiment Analytics
- [x] Export data (CSV/XLSX/PDF)
- [x] Responsive design + BottomNav mobile
- [x] Multi-theme (10 tema) + dark/light mode
- [x] Command palette (⌘K)
- [x] Profile page + avatar image cropper
- [x] Settings page

### Phase 6 — Hardening & Launch

- [ ] Unit tests untuk API Routes
- [ ] E2E test untuk flow kritis
- [ ] Migrasi data dari sistem v1
- [ ] User acceptance testing dengan mahasiswa & admin UNSAP
- [ ] Deploy ke production + monitoring setup

---

## 19. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| ML Service auto-sleep di Railway (cold start ~30 detik) | Tinggi | Sedang | Fail-safe fallback Normal priority; notif tetap terkirim |
| Supabase Edge Function timeout (maks 150 detik) | Rendah | Rendah | ML call timeout diset 5 detik; fallback notif |
| Supabase free tier limit (500MB DB) | Sedang | Sedang | Paginate data, archive tiket lama |
| Model ML tidak akurat untuk Bahasa Indonesia lokal | Sedang | Tinggi | Expand dataset; Active Learning dari koreksi admin |
| Supabase Realtime connection limit (200 free) | Rendah | Sedang | Unsubscribe saat navigasi ke halaman lain |
| Data kebocoran identitas anonim | Rendah | Sangat Tinggi | RLS + server-side masking; master_admin only |

---

## 20. Glosarium

| Term | Definisi |
|---|---|
| TF-IDF | Term Frequency-Inverse Document Frequency, teknik representasi teks untuk menghitung bobot kata |
| Cosine Similarity | Metrik kemiripan dua vektor (0–1), digunakan untuk FAQ matching |
| Logistic Regression | Algoritma ML untuk klasifikasi, digunakan sebagai primary classifier |
| SLA | Service Level Agreement, batas waktu penyelesaian tiket berdasarkan prioritas |
| RLS | Row Level Security, fitur PostgreSQL/Supabase untuk membatasi akses data per baris |
| ENUM | PostgreSQL data type untuk nilai terbatas (role, status, priority, category) |
| Edge Function | Fungsi serverless yang berjalan dekat dengan database (Deno runtime) di Supabase |
| Active Learning | Proses memperbaiki model ML dengan data koreksi dari manusia (admin) |
| Auto-escalation | Mekanisme fallback menaikkan prioritas tiket ke Urgent berdasarkan kata kunci (hanya aktif jika ML tidak tersedia) |
| Fail-safe | Mekanisme fallback agar sistem tetap berjalan meskipun ML Service gagal |
| Realtime Channel | Koneksi WebSocket Supabase untuk menerima update data secara instan |
| anonymous_code | Kode unik deterministik (`Anonim_#XXXX`) yang menggantikan identitas mahasiswa anonim |
| Sastrawi | Library stemmer untuk Bahasa Indonesia |
| Nixpacks | Build system Railway untuk auto-detect dan build aplikasi |

---

*Dokumen ini merupakan living document. Revisi dilakukan sesuai perkembangan proyek.*  
*Versi terakhir: 2.1 — Juni 2026*

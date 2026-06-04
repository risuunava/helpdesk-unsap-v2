# PRD — Smart Campus Helpdesk UNSAP (Rebuild)

**Dokumen:** Product Requirements Document  
**Versi:** 2.0  
**Status:** Draft  
**Tanggal:** Juni 2026  
**Penulis:** Tim Pengembang UNSAP  

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
- Klasifikasi prioritas otomatis (NLP multi-model)
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
│            Next.js 14 App Router (React)         │
│         Tailwind CSS · shadcn/ui · TypeScript    │
└──────────────┬──────────────────┬────────────────┘
               │                  │
               │ SDK direct        │ API Route fetch
               ▼                  ▼
┌──────────────────────┐  ┌───────────────────────┐
│      Supabase        │  │   Next.js API Routes  │
│                      │  │   /app/api/**         │
│  • PostgreSQL (DB)   │  │   (serverless, Vercel)│
│  • Auth (JWT/RLS)    │  └──────────┬────────────┘
│  • Realtime (WS)     │             │ REST call
│  • Storage (files)   │             ▼
│  • Edge Functions    │  ┌───────────────────────┐
│    (background jobs) │  │   ML Service          │
└──────────────────────┘  │   FastAPI · Python    │
                          │   Railway.app         │
                          │                       │
                          │  • /classify          │
                          │  • /faq-suggest       │
                          │  • /sentiment         │
                          │  • /retrain           │
                          └───────────────────────┘
```

### 4.2 Data Flow: Submit Tiket

```
1. Mahasiswa isi form tiket di browser
2. Debounce 500ms → fetch /api/faq-suggest → forward ke ML Service /faq-suggest
3. Saran FAQ muncul real-time di UI
4. Submit → POST /api/tickets → validasi input → insert ke Supabase DB
5. DB trigger memanggil Supabase Edge Function `process-ticket-ml`
6. Edge Function POST ke Railway ML Service /classify
7. ML Service return { priority, confidence }
8. Edge Function UPDATE tiket dengan priority hasil ML
9. Supabase Realtime broadcast ke channel admin → notifikasi muncul di dashboard admin
```

### 4.3 Data Flow: Live Chat

```
1. Admin buka detail tiket → subscribe ke channel `ticket:{id}` via Supabase Realtime
2. Mahasiswa kirim pesan → POST /api/chat → insert ke tabel `messages`
3. Supabase Realtime broadcast ke semua subscriber channel tersebut
4. Pesan muncul instan di kedua sisi (admin & mahasiswa) tanpa polling
```

### 4.4 Data Flow: ML Retraining

```
1. Master Admin koreksi prediksi ML di dashboard
2. Koreksi → POST /api/ml/feedback → insert ke tabel `ml_training_data`
3. Master Admin klik "Retrain Model" → POST /api/ml/retrain → forward ke Railway /retrain
4. Railway ML Service lakukan retraining dengan dataset terbaru (termasuk data koreksi)
5. Model baru dimuat ke memori FastAPI tanpa restart server
6. Response { accuracy, f1_score, model_version } dikembalikan ke dashboard
```

---

## 5. Tech Stack

### 5.1 Frontend & Backend API

| Komponen | Teknologi | Versi | Alasan |
|---|---|---|---|
| Framework | Next.js | 14.x | App Router, API Routes, SSR/SSG |
| Bahasa | TypeScript | 5.x | Type safety end-to-end |
| Styling | Tailwind CSS | 3.x | Utility-first, tema dark mode |
| UI Components | shadcn/ui | Latest | Accessible, customizable |
| Ikon | lucide-react | Latest | Konsisten dengan v1 |
| Form | react-hook-form + zod | Latest | Validasi schema-based |
| State | Zustand | 4.x | Lightweight, tanpa boilerplate |
| Realtime client | @supabase/supabase-js | 2.x | Built-in Realtime subscription |
| HTTP client | Native fetch (Next.js) | — | Tidak perlu Axios |
| Deploy | Vercel | — | Zero-config, edge network |

### 5.2 Database & Platform

| Komponen | Teknologi | Alasan |
|---|---|---|
| Database | Supabase PostgreSQL | Relasional, RLS, managed |
| Auth | Supabase Auth | JWT, OAuth, magic link, RLS terintegrasi |
| Realtime | Supabase Realtime | Gantikan Laravel Reverb, managed WebSocket |
| File Storage | Supabase Storage | Gantikan storage Laravel, CDN built-in |
| Background Jobs | Supabase Edge Functions | Gantikan Queue Worker, serverless Deno |

### 5.3 ML Service

| Komponen | Teknologi | Versi | Alasan |
|---|---|---|---|
| Framework | FastAPI | 0.111.x | Async, high-performance, type hints |
| Runtime | Python | 3.11 | Kompatibel dengan semua library ML |
| ML Library | scikit-learn | 1.4.x | Multi-model classifier |
| NLP Bahasa Indo | PySastrawi | Latest | Stemmer Bahasa Indonesia |
| Text Processing | NLTK + scikit-learn | Latest | TF-IDF, Cosine Similarity |
| Serialisasi | joblib | 1.4.x | Simpan/load model .pkl |
| Server | uvicorn | 0.29.x | ASGI server untuk FastAPI |
| Deploy | Railway.app | — | Git deploy, auto-sleep, managed |

---

## 6. Struktur Repositori

### 6.1 Monorepo (satu repo, dua service)

```
/smart-campus-helpdesk-unsap/
│
├── .github/
│   └── workflows/
│       ├── deploy-nextjs.yml       # CI/CD ke Vercel (auto on push main)
│       └── deploy-ml.yml           # CI/CD ke Railway (auto on push main)
│
├── app/                            # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── mahasiswa/
│   │   │   ├── page.tsx            # Dashboard mahasiswa (list tiket sendiri)
│   │   │   ├── submit/
│   │   │   │   └── page.tsx        # Form submit tiket baru
│   │   │   └── tiket/[id]/
│   │   │       └── page.tsx        # Detail tiket + live chat
│   │   └── admin/
│   │       ├── page.tsx            # Dashboard admin (all tiket)
│   │       ├── tiket/[id]/
│   │       │   └── page.tsx        # Split-view: detail + chat
│   │       ├── analytics/
│   │       │   └── page.tsx        # KPI, SLA, sentiment chart
│   │       └── ml/
│   │           └── page.tsx        # ML training data + retrain (master admin)
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts   # Supabase Auth OAuth callback
│   │   ├── tickets/
│   │   │   ├── route.ts            # GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts        # GET + PATCH + DELETE
│   │   ├── chat/
│   │   │   └── route.ts            # POST kirim pesan
│   │   ├── faq/
│   │   │   └── route.ts            # GET semua FAQ
│   │   ├── ml/
│   │   │   ├── suggest/route.ts    # POST → forward ke ML /faq-suggest
│   │   │   ├── feedback/route.ts   # POST simpan koreksi ke DB
│   │   │   └── retrain/route.ts    # POST → forward ke ML /retrain (master admin)
│   │   └── analytics/
│   │       └── route.ts            # GET KPI, SLA, sentiment aggregate
│   └── page.tsx                    # Landing page
│
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── ticket/
│   │   ├── TicketForm.tsx
│   │   ├── TicketCard.tsx
│   │   ├── TicketTable.tsx
│   │   └── FaqSuggestion.tsx       # Komponen saran FAQ real-time
│   ├── chat/
│   │   ├── ChatRoom.tsx            # Live chat dengan Supabase Realtime
│   │   └── ChatMessage.tsx
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   ├── SlaChart.tsx
│   │   ├── SentimentChart.tsx
│   │   └── PriorityBadge.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Navbar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client (singleton)
│   │   ├── server.ts               # Server component Supabase client
│   │   └── middleware.ts           # Auth middleware helper
│   ├── ml.ts                       # Helper fetch ke Railway ML service
│   ├── anonymize.ts                # Logika generate kode anonim
│   ├── escalation.ts               # Keyword auto-escalation list
│   └── validations/
│       ├── ticket.schema.ts        # Zod schema untuk tiket
│       └── auth.schema.ts          # Zod schema untuk form auth
│
├── hooks/
│   ├── useTickets.ts               # Data fetching + subscription tiket
│   ├── useChat.ts                  # Realtime chat subscription
│   └── useAnalytics.ts             # Data analytics dengan caching
│
├── types/
│   ├── database.ts                 # Generated types dari Supabase CLI
│   ├── ticket.ts
│   ├── user.ts
│   └── ml.ts
│
├── supabase/
│   ├── functions/
│   │   └── process-ticket-ml/
│   │       └── index.ts            # Edge Function: call ML setelah insert tiket
│   ├── migrations/
│   │   ├── 00001_init_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   ├── 00003_realtime_setup.sql
│   │   └── 00004_seed_data.sql
│   └── config.toml                 # Supabase local dev config
│
├── ml-service/                     # Python ML Service (deploy ke Railway)
│   ├── datasets/
│   │   └── dataset.csv
│   ├── models/                     # .pkl files (gitignored, di-generate saat train)
│   ├── utils/
│   │   ├── preprocessor.py         # Stemmer, stopwords, tokenizer
│   │   └── model_loader.py         # Load/reload model tanpa restart
│   ├── main.py                     # FastAPI server
│   ├── train.py                    # Training pipeline
│   ├── requirements.txt
│   ├── Procfile                    # Railway: web: uvicorn main:app --host 0.0.0.0 --port $PORT
│   └── railway.json                # Railway config
│
├── public/
│   └── assets/
│
├── middleware.ts                   # Next.js middleware (auth guard)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

---

## 7. Skema Database

### 7.1 Tabel Utama

```sql
-- USERS (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nim           TEXT UNIQUE,                    -- NULL untuk admin
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('mahasiswa', 'admin', 'master_admin')),
  department    TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- TICKETS
CREATE TABLE public.tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number   TEXT UNIQUE NOT NULL,          -- Format: TKT-2026-XXXX
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,                 -- akademik | keuangan | fasilitas | keamanan | lainnya
  status          TEXT NOT NULL DEFAULT 'open'   -- open | in_progress | resolved | closed
                  CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority        TEXT NOT NULL DEFAULT 'normal' -- low | normal | urgent
                  CHECK (priority IN ('low', 'normal', 'urgent')),
  is_anonymous    BOOLEAN DEFAULT FALSE,
  anonymous_code  TEXT,                          -- mis: Anonim_#8A2C (dibuat di app)
  reporter_id     UUID REFERENCES public.profiles(id),
  assigned_to     UUID REFERENCES public.profiles(id),
  department      TEXT,                          -- departemen yang dituju
  attachment_url  TEXT,                          -- Supabase Storage URL
  ml_confidence   FLOAT,                         -- Confidence score dari ML
  ml_model_version TEXT,                         -- Versi model yang digunakan
  priority_overridden BOOLEAN DEFAULT FALSE,     -- true jika auto-escalation keyword
  sla_deadline    TIMESTAMPTZ,                   -- Dihitung saat insert berdasarkan priority
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
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
  category    TEXT,
  view_count  INTEGER DEFAULT 0,
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
  type        TEXT NOT NULL,                     -- ticket_update | new_message | sla_warning
  title       TEXT NOT NULL,
  body        TEXT,
  ticket_id   UUID REFERENCES public.tickets(id),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 Database Trigger untuk SLA & Ticket Number

```sql
-- Auto-generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  seq_num   INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num FROM public.tickets
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.ticket_number := 'TKT-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Auto-set SLA deadline berdasarkan priority
CREATE OR REPLACE FUNCTION set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.priority
    WHEN 'urgent' THEN NEW.sla_deadline := NOW() + INTERVAL '4 hours';
    WHEN 'normal' THEN NEW.sla_deadline := NOW() + INTERVAL '24 hours';
    WHEN 'low'    THEN NEW.sla_deadline := NOW() + INTERVAL '72 hours';
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_sla
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION set_sla_deadline();
```

### 7.3 Row Level Security (RLS)

```sql
-- Aktifkan RLS untuk semua tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_training_data ENABLE ROW LEVEL SECURITY;

-- TICKETS: Mahasiswa hanya bisa lihat tiket sendiri
CREATE POLICY "mahasiswa_own_tickets" ON public.tickets
  FOR SELECT USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- TICKETS: Mahasiswa bisa insert (rate limit dihandle di aplikasi)
CREATE POLICY "mahasiswa_insert_ticket" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- TICKETS: Admin bisa update status & priority
CREATE POLICY "admin_update_ticket" ON public.tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- MESSAGES: Hanya peserta tiket yang bisa lihat pesan
CREATE POLICY "ticket_participants_messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (
        t.reporter_id = auth.uid()
        OR t.assigned_to = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
      )
    )
  );

-- PROFILES: User hanya bisa lihat profil sendiri, admin bisa lihat semua
-- CATATAN: Admin biasa TIDAK BISA lihat reporter_id jika is_anonymous = true
-- Ini dihandle di level aplikasi (Next.js API Route) bukan RLS murni
-- agar Master Admin tetap bisa akses untuk keperluan audit
```

### 7.4 Realtime Setup

```sql
-- Aktifkan Realtime untuk tabel yang diperlukan
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## 8. Fitur & Kebutuhan Fungsional

### 8.1 Autentikasi & Manajemen Akun

| ID | Fitur | Deskripsi | Priority |
|---|---|---|---|
| F-AUTH-01 | Login dengan email & password | Via Supabase Auth | P0 |
| F-AUTH-02 | Register mahasiswa | Input NIM, nama, email, password | P0 |
| F-AUTH-03 | Session persistence | JWT token, auto-refresh | P0 |
| F-AUTH-04 | Middleware route guard | Redirect ke login jika belum auth | P0 |
| F-AUTH-05 | Profil user | Edit nama, avatar (upload ke Supabase Storage) | P1 |
| F-AUTH-06 | Role-based redirect | Mahasiswa → /mahasiswa, Admin → /admin | P0 |

### 8.2 Manajemen Tiket (Mahasiswa)

| ID | Fitur | Deskripsi | Priority |
|---|---|---|---|
| F-TKT-01 | Submit tiket | Form: judul, kategori, deskripsi, lampiran, pilihan anonim | P0 |
| F-TKT-02 | Saran FAQ real-time | Debounce 500ms, call ML /faq-suggest saat user mengetik | P0 |
| F-TKT-03 | Pelaporan anonim | Jika dicentang, identitas digantikan kode unik `Anonim_#XXXX` | P0 |
| F-TKT-04 | Upload lampiran | Maks 2MB, ekstensi: jpg, jpeg, png, pdf | P0 |
| F-TKT-05 | List tiket sendiri | Tabel dengan status, prioritas, tanggal | P0 |
| F-TKT-06 | Detail tiket | Lihat info lengkap + status progress | P0 |
| F-TKT-07 | Rate limiting | Maks 3 tiket per hari per user | P0 |

### 8.3 Manajemen Tiket (Admin)

| ID | Fitur | Deskripsi | Priority |
|---|---|---|---|
| F-ADM-01 | Dashboard semua tiket | Tabel dengan filter status, prioritas, kategori, tanggal | P0 |
| F-ADM-02 | Assign tiket | Assign ke admin lain atau diri sendiri | P1 |
| F-ADM-03 | Update status | Open → In Progress → Resolved → Closed | P0 |
| F-ADM-04 | Update prioritas | Override prioritas ML secara manual | P1 |
| F-ADM-05 | SLA indicator | Badge merah jika tiket mendekati/melewati SLA | P0 |
| F-ADM-06 | Filter & search | Filter per kategori, departemen, tanggal, status | P1 |
| F-ADM-07 | Notifikasi realtime | Notif tiket baru, update status | P0 |

### 8.4 Live Chat

| ID | Fitur | Deskripsi | Priority |
|---|---|---|---|
| F-CHAT-01 | Chat room per tiket | Satu room per tiket | P0 |
| F-CHAT-02 | Realtime messaging | Pesan muncul instan via Supabase Realtime | P0 |
| F-CHAT-03 | Split-view admin | Panel kiri: detail tiket, panel kanan: chat | P0 |
| F-CHAT-04 | Timestamp pesan | Tampilkan waktu setiap pesan | P0 |
| F-CHAT-05 | Anonimitas di chat | Nama mahasiswa anonim disembunyikan dari admin biasa | P0 |
| F-CHAT-06 | Read receipt | Tandai pesan sudah dibaca | P2 |

### 8.5 ML & Klasifikasi

| ID | Fitur | Deskripsi | Priority |
|---|---|---|---|
| F-ML-01 | Klasifikasi prioritas otomatis | Jalankan setelah tiket disubmit (async via Edge Function) | P0 |
| F-ML-02 | Multi-model comparison | NB, LR, SVM, Random Forest — pilih model dengan F1 tertinggi | P1 |
| F-ML-03 | Auto-escalation keyword | Override ke Urgent jika ada kata kunci sensitif | P0 |
| F-ML-04 | Fail-safe fallback | Jika ML timeout/error, tiket default ke prioritas Normal | P0 |
| F-ML-05 | FAQ suggestion | TF-IDF + Cosine Similarity, suggest saat mahasiswa mengetik | P0 |
| F-ML-06 | Koreksi prediksi | Master Admin bisa koreksi label ML | P1 |
| F-ML-07 | Trigger retraining | Master Admin bisa trigger retrain model dari dashboard | P1 |
| F-ML-08 | Model metrics display | Tampilkan accuracy, F1-score model aktif | P2 |

### 8.6 Analytics & Laporan

| ID | Fitur | Deskripsi | Priority |
|---|---|---|---|
| F-ANL-01 | KPI Cards | Total tiket, open, resolved, overdue | P0 |
| F-ANL-02 | SLA Compliance chart | % tiket diselesaikan dalam SLA, per bulan | P1 |
| F-ANL-03 | Tiket per kategori | Pie/bar chart distribusi kategori | P1 |
| F-ANL-04 | Trend tiket | Line chart tiket masuk per minggu/bulan | P1 |
| F-ANL-05 | Campus Sentiment Analytics | Agregat sentimen per bulan (master admin only) | P1 |
| F-ANL-06 | Export data | Export tabel tiket ke CSV | P2 |

---

## 9. Kebutuhan Non-Fungsional

### 9.1 Performa

- **Page load (LCP):** < 2.5 detik untuk halaman dashboard
- **API response time:** < 300ms untuk operasi CRUD (P95)
- **ML classification time:** < 3 detik per tiket (background, tidak blokir UX)
- **FAQ suggestion latency:** < 800ms dari debounce trigger
- **Realtime message delivery:** < 500ms dari send ke receive

### 9.2 Skalabilitas

- Arsitektur serverless (Vercel + Supabase Edge Functions) auto-scale sesuai demand
- ML Service di Railway bisa di-scale manual jika traffic meningkat
- Database PostgreSQL di Supabase dengan connection pooling via PgBouncer

### 9.3 Ketersediaan

- Frontend (Vercel): 99.99% uptime SLA (managed)
- Database (Supabase): 99.9% uptime SLA (managed)
- ML Service (Railway): Best-effort; ada fallback (Normal priority jika ML down)

### 9.4 Keamanan

- Semua komunikasi via HTTPS/WSS
- Auth token disimpan di httpOnly cookie (bukan localStorage)
- Input sanitization di server (API Routes) dan client (Zod schema)
- File upload validation: mime type + ukuran + ekstensi
- Rate limiting di API Routes: 2 req/menit untuk submit tiket per IP
- RLS Supabase sebagai lapisan keamanan database

### 9.5 Aksesibilitas

- WCAG 2.1 Level AA compliance untuk komponen UI utama
- Keyboard navigation untuk semua form interaktif
- Screen reader friendly (ARIA labels, semantic HTML)
- Dark mode sebagai mode default (Spotify-inspired theme dari v1)

### 9.6 Kompatibilitas Browser

- Chrome 100+, Firefox 100+, Safari 16+, Edge 100+
- Mobile: iOS Safari 16+, Chrome Android 100+
- Responsive design: mobile-first, breakpoint 375px / 768px / 1280px

---

## 10. Desain & UX

### 10.1 Design System (Cendekia — Institutional Clarity)

**Tema:** Light Immersive (Warm Off-White & Deep Navy), mengutamakan *Institutional Clarity* sesuai file `DESIGN.md`.

| Token | Nilai |
|---|---|
| Background Primary | `#F7F6F3` (Warm Off-white) |
| Surface Container | `#EEEBE7` |
| Surface Card | `#FFFFFF` |
| Primary (Navy) | `#1A3A5C` |
| Accent Green | `#22C55E` |
| Text Primary | `#111110` |
| Text Secondary | `#5A5855` |
| Border | `#D6D3CF` |
| Danger / Urgent | `#EF4444` |
| Warning | `#F59E0B` |

**Tipografi:** `Inter` untuk UI umum, `JetBrains Mono` untuk data teknis (nomor tiket, token anonim, skor ML).  
**Karakteristik Visual:** Menggunakan efek *Daytime Glass* (frosted glass transparan dengan blur 16-24px), border radius 24px untuk card, dan micro-interaction dengan glow-effect.  
**Animasi:** Functional motion, 120-200ms ease.  
**Catatan Penting:** Seluruh detail implementasi komponen mengacu penuh pada pedoman dalam `DESIGN.md`.

### 10.2 Halaman Utama

| Path | Nama | Deskripsi |
|---|---|---|
| `/` | Landing Page | Hero + fitur utama + CTA login |
| `/login` | Login | Form email + password |
| `/register` | Register | Form data mahasiswa |
| `/mahasiswa` | Dashboard Mahasiswa | List tiket sendiri + tombol submit |
| `/mahasiswa/submit` | Submit Tiket | Form lengkap + FAQ suggestion |
| `/mahasiswa/tiket/[id]` | Detail Tiket | Status tiket + chat room |
| `/admin` | Dashboard Admin | Semua tiket + filter + KPI summary |
| `/admin/tiket/[id]` | Detail Tiket Admin | Split-view: detail + chat |
| `/admin/analytics` | Analytics | Chart KPI, SLA, sentimen |
| `/admin/ml` | ML Management | Training data + retrain (master admin) |

### 10.3 Komponen Kunci

**TicketForm**
- Field: Judul (text), Kategori (select), Departemen Tujuan (select), Deskripsi (textarea), Lampiran (file), Anonim (toggle)
- FAQ Suggestion muncul sebagai floating card di bawah field deskripsi saat ada hasil relevan
- Submit button disabled selama loading + cooldown 2 detik pasca-submit

**ChatRoom**
- Bubble chat dengan timestamp
- Input field sticky di bawah
- Auto-scroll ke pesan terbaru
- Indicator "sedang mengetik..." (opsional, P2)

**PriorityBadge**
- `low` → Outline dot, abu-abu
- `normal` → Biru aksen
- `urgent` → Dot merah berkedip (glow shadow) + teks merah
- Jika `priority_overridden = true` → tambahkan ikon peringatan ⚠️

**SLA Indicator**
- Hijau: > 50% waktu SLA tersisa
- Kuning: 10-50% waktu SLA tersisa
- Merah: < 10% tersisa atau sudah lewat (animasi sla-pulse)

---

## 11. Autentikasi & Otorisasi

### 11.1 Flow Autentikasi

```
Register:
User isi form → POST /api/auth/register →
Supabase createUser() → Insert ke public.profiles →
Redirect ke dashboard sesuai role

Login:
User isi form → Supabase signInWithPassword() →
Session JWT disimpan → Middleware baca session →
Redirect ke /mahasiswa atau /admin

Logout:
Supabase signOut() → Clear session → Redirect ke /login
```

### 11.2 Middleware Next.js

```typescript
// middleware.ts
// Proteksi semua route /mahasiswa/* dan /admin/*
// Redirect ke /login jika tidak ada session
// Redirect ke halaman sesuai role jika sudah login
```

### 11.3 Matriks Permission

| Aksi | Mahasiswa | Admin | Master Admin |
|---|---|---|---|
| Submit tiket | ✓ | ✗ | ✗ |
| Lihat tiket sendiri | ✓ | ✓ | ✓ |
| Lihat semua tiket | ✗ | ✓ | ✓ |
| Update status tiket | ✗ | ✓ | ✓ |
| Lihat identitas anonim | ✗ | ✗ | ✓ |
| Lihat analytics | ✗ | Terbatas | Penuh |
| Koreksi label ML | ✗ | ✗ | ✓ |
| Trigger retrain | ✗ | ✗ | ✓ |
| Manage FAQ | ✗ | ✗ | ✓ |

### 11.4 Logika Anonimitas

```typescript
// lib/anonymize.ts
export function generateAnonymousCode(userId: string): string {
  // Deterministik: hash userId → kode 4 karakter hex
  // Mis: Anonim_#8A2C
  const hash = simpleHash(userId).toString(16).toUpperCase().slice(0, 4);
  return `Anonim_#${hash}`;
}

// Di API Route GET /api/tickets/[id]:
// Jika is_anonymous = true DAN role requester BUKAN master_admin:
//   - Kembalikan anonymous_code alih-alih reporter_id + nama asli
// Jika role = master_admin:
//   - Kembalikan semua data termasuk identitas asli
```

---

## 12. ML Service

### 12.1 Endpoint API

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| GET | `/health` | Health check | Publik |
| POST | `/classify` | Klasifikasi prioritas tiket | Internal (API Key) |
| POST | `/faq-suggest` | Saran FAQ berdasarkan teks | Internal (API Key) |
| POST | `/sentiment` | Analisis sentimen teks | Internal (API Key) |
| GET | `/model-info` | Info model aktif (versi, metrics) | Internal |
| POST | `/retrain` | Trigger retraining dengan data baru | Internal (API Key) |

### 12.2 Request/Response Schema

**POST /classify**
```json
// Request
{ "text": "Saya belum menerima KRS untuk semester ini padahal sudah bayar UKT" }

// Response
{
  "priority": "urgent",
  "confidence": 0.93,
  "model": "random_forest_v2",
  "overridden_by_keyword": true,
  "keyword_matched": "KRS"
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
      "similarity_score": 0.87
    }
  ]
}
```

**POST /retrain**
```json
// Request
{
  "training_data": [
    { "text": "...", "label": "urgent" },
    { "text": "...", "label": "normal" }
  ]
}

// Response
{
  "status": "success",
  "model_version": "random_forest_v3",
  "metrics": {
    "accuracy": 0.91,
    "f1_score": 0.89,
    "best_model": "random_forest"
  }
}
```

### 12.3 Keyword Auto-Escalation

Daftar keyword yang memicu override prioritas ke **Urgent** secara otomatis:

```python
URGENT_KEYWORDS = [
  # Keuangan kritis
  "KRS", "UKT", "uang kuliah", "SPP", "beasiswa",
  # Kedaruratan
  "kebakaran", "kecelakaan", "darurat",
  # Kekerasan & pelanggaran
  "pelecehan", "kekerasan", "bullying", "pencurian", "kehilangan",
  # Akademik kritis
  "DO", "drop out", "tidak lulus", "wisuda", "ijazah",
  # Kesehatan
  "sakit parah", "keracunan", "pingsan"
]
```

### 12.4 Supabase Edge Function: process-ticket-ml

```typescript
// supabase/functions/process-ticket-ml/index.ts
// Dipanggil via DB Webhook setelah INSERT ke tabel tickets
// Melakukan:
// 1. Ambil data tiket baru dari payload
// 2. POST ke Railway ML /classify dengan title + description
// 3. UPDATE tiket dengan priority & ml_confidence hasil klasifikasi
// 4. Jika ML error/timeout (> 5 detik) → skip (tiket tetap Normal)
// 5. Insert notifikasi untuk admin departemen terkait
```

---

## 13. Realtime & WebSocket

### 13.1 Channel Design (Supabase Realtime)

| Channel | Event | Subscribe | Deskripsi |
|---|---|---|---|
| `ticket:{ticketId}` | INSERT on messages | Mahasiswa + Admin | Pesan chat baru |
| `tickets:admin` | INSERT/UPDATE on tickets | Semua admin | Tiket baru atau status berubah |
| `notifications:{userId}` | INSERT on notifications | Semua user | Notifikasi personal |

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
1. **Client-side:** Zod schema di `react-hook-form`
2. **Server-side:** Zod schema di setiap API Route sebelum operasi DB

### 14.2 File Upload Guard

```typescript
// Validasi di API Route sebelum upload ke Supabase Storage
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// Validasi: mime type, ekstensi, dan ukuran
// File disimpan dengan nama: {uuid}.{ext} (bukan nama asli user)
// Path: attachments/{ticketId}/{uuid}.{ext}
```

### 14.3 Rate Limiting

```typescript
// Dua level rate limiting:
// 1. Business logic: maks 3 tiket/hari/user (cek di DB table ticket_rate_limits)
// 2. IP-based: 2 request/menit untuk POST /api/tickets (Next.js middleware)
```

### 14.4 API Key ML Service

ML Service membutuhkan header `X-API-Key` untuk semua endpoint (kecuali `/health`). API Key disimpan sebagai environment variable di Railway dan Vercel/Supabase Edge Functions. Tidak pernah di-expose ke client.

### 14.5 Environment Variables

```bash
# .env.local (Next.js — public prefix boleh di-expose ke browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server-only (tidak ada NEXT_PUBLIC prefix)
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Untuk operasi admin di API Routes
ML_SERVICE_URL=https://xxx.railway.app
ML_SERVICE_API_KEY=sk-...

# Supabase Edge Functions (set via Supabase CLI)
ML_SERVICE_URL=https://xxx.railway.app
ML_SERVICE_API_KEY=sk-...
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
Push ke branch main → GitHub Actions → Vercel build → Deploy otomatis
Preview deployment untuk setiap PR
```

**ML Service (Railway):**
```
Push ke branch main (perubahan di /ml-service) → Railway detect Procfile →
Build image → Deploy → Railway auto-expose HTTPS URL
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
git clone https://github.com/risuunava/smart-campus-helpdesk-unsap
cd smart-campus-helpdesk-unsap

# 2. Install Next.js dependencies
npm install

# 3. Copy env dan isi dengan kredensial Supabase
cp .env.local.example .env.local

# 4. Jalankan Supabase local (opsional, bisa pakai hosted)
supabase start

# 5. Jalankan migrasi DB
supabase db push

# 6. Deploy Edge Function ke lokal
supabase functions serve process-ticket-ml

# 7. Setup ML Service
cd ml-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python train.py          # Training model pertama kali
uvicorn main:app --reload --port 5000

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

File lampiran di storage lama → Supabase Storage

### 16.2 Script Migrasi

```bash
# 1. Export dari PostgreSQL lama
pg_dump -h [OLD_HOST] -U postgres -d helpdesk_db \
  --table=users --table=tickets --table=chat_messages \
  --table=faqs --table=ml_training_data \
  -f export.sql

# 2. Transform & import ke Supabase
# Script transformasi Python: ml-service/scripts/migrate.py
# Handles: field name mapping, UUID conversion, role mapping

# 3. Migrasi file lampiran via Supabase Storage API
# Script: scripts/migrate-storage.py
```

### 16.3 Validasi Pasca-Migrasi

- [ ] Jumlah row di setiap tabel sama dengan source
- [ ] Semua relasi foreign key valid
- [ ] File lampiran accessible via Supabase Storage URL
- [ ] Model ML tetap akurat dengan dataset yang sudah dimigrasikan
- [ ] Spot-check 10 tiket secara manual

---

## 17. Acceptance Criteria

### 17.1 Authentication

- [ ] Mahasiswa bisa register dengan NIM + email + password
- [ ] Login berhasil dan redirect ke halaman yang benar sesuai role
- [ ] Halaman `/admin/*` tidak bisa diakses tanpa login admin
- [ ] Halaman `/mahasiswa/*` tidak bisa diakses tanpa login mahasiswa
- [ ] Session tidak hilang setelah refresh halaman

### 17.2 Tiket

- [ ] Mahasiswa bisa submit tiket dengan dan tanpa lampiran
- [ ] Tiket anonim menampilkan kode `Anonim_#XXXX` bukan nama asli untuk admin biasa
- [ ] Master Admin bisa melihat identitas asli tiket anonim
- [ ] Submit ke-4 di hari yang sama ditolak dengan pesan error yang jelas
- [ ] File > 2MB atau ekstensi tidak valid ditolak di client dan server
- [ ] Tiket nomor auto-generate dalam format `TKT-2026-XXXX`

### 17.3 ML & Klasifikasi

- [ ] Prioritas tiket ter-update otomatis dalam 10 detik setelah submit
- [ ] Tiket dengan kata kunci "KRS", "pelecehan", dll. langsung Urgent
- [ ] Jika ML Service down, tiket tetap masuk dengan prioritas Normal (tidak error)
- [ ] FAQ Suggestion muncul dalam < 1 detik setelah berhenti mengetik
- [ ] Master Admin bisa koreksi label dan trigger retrain dari dashboard

### 17.4 Realtime

- [ ] Pesan chat muncul di kedua sisi tanpa refresh halaman
- [ ] Admin mendapat notifikasi tiket baru tanpa refresh
- [ ] Reconnect otomatis jika koneksi WebSocket putus

### 17.5 Analytics

- [ ] Dashboard admin menampilkan KPI cards yang akurat
- [ ] Tiket yang melewati SLA ditandai merah di tabel
- [ ] Chart sentimen kampus hanya visible untuk Master Admin

---

## 18. Roadmap & Milestone

### Phase 1 — Foundation (Minggu 1–2)

- [ ] Setup Supabase project (skema DB, RLS, Realtime)
- [ ] Inisialisasi Next.js 14 dengan TypeScript + Tailwind + shadcn/ui
- [ ] Implementasi Supabase Auth (register, login, middleware)
- [ ] Setup Railway untuk ML Service + deploy versi existing
- [ ] Halaman landing page
- [ ] Halaman login & register

### Phase 2 — Core Features (Minggu 3–4)

- [ ] Dashboard mahasiswa + list tiket
- [ ] Form submit tiket + upload lampiran ke Supabase Storage
- [ ] Logika anonimitas + rate limiting
- [ ] Dashboard admin + tabel tiket dengan filter
- [ ] Update status tiket

### Phase 3 — ML Integration (Minggu 5)

- [ ] FAQ Suggestion (debounce + call ML /faq-suggest)
- [ ] Supabase Edge Function `process-ticket-ml`
- [ ] Auto-escalation keyword detection
- [ ] Fail-safe fallback (priority Normal jika ML timeout)
- [ ] Dashboard ML management untuk Master Admin

### Phase 4 — Realtime & Chat (Minggu 6)

- [ ] Live Chat Room dengan Supabase Realtime
- [ ] Split-view admin (detail + chat)
- [ ] Sistem notifikasi realtime
- [ ] Anonimitas di chat

### Phase 5 — Analytics & Polish (Minggu 7)

- [ ] KPI cards + SLA monitoring
- [ ] Chart distribusi kategori, trend tiket
- [ ] Campus Sentiment Analytics (Master Admin)
- [ ] Optimasi performa (caching, loading states)
- [ ] Responsive design + dark mode fine-tuning

### Phase 6 — Testing & Launch (Minggu 8)

- [ ] Unit tests untuk API Routes (Jest/Vitest)
- [ ] E2E test untuk flow kritis (Playwright)
- [ ] Migrasi data dari sistem v1
- [ ] User acceptance testing dengan mahasiswa & admin UNSAP
- [ ] Deploy ke production + monitoring setup

---

## 19. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| ML Service auto-sleep di Railway (cold start ~30 detik) | Tinggi | Sedang | Fail-safe fallback Normal priority; Cron ping ML setiap 10 menit jika traffic rendah |
| Supabase Edge Function timeout (maks 150 detik) | Rendah | Rendah | ML call timeout diset 5 detik; retry 1x |
| Supabase free tier limit (500MB DB) | Sedang | Sedang | Paginate data, archive tiket lama ke status closed setelah 1 tahun |
| Model ML tidak akurat untuk Bahasa Indonesia lokal | Sedang | Tinggi | Expand dataset dengan data nyata UNSAP; Active Learning dari koreksi admin |
| Supabase Realtime connection limit (200 connections free) | Rendah | Sedang | Implementasi unsubscribe saat navigasi ke halaman lain |
| Data kebocoran identitas anonim | Rendah | Sangat Tinggi | RLS + server-side masking di API Route; audit log akses Master Admin |

---

## 20. Glosarium

| Term | Definisi |
|---|---|
| TF-IDF | Term Frequency-Inverse Document Frequency, teknik representasi teks untuk menghitung kemiripan |
| Cosine Similarity | Metrik kemiripan dua vektor (0–1), digunakan untuk FAQ matching |
| SLA | Service Level Agreement, batas waktu penyelesaian tiket berdasarkan prioritas |
| RLS | Row Level Security, fitur PostgreSQL/Supabase untuk membatasi akses data per baris |
| Edge Function | Fungsi serverless yang berjalan dekat dengan database (Deno runtime) di Supabase |
| Active Learning | Proses memperbaiki model ML dengan data koreksi dari manusia (admin) |
| Auto-escalation | Mekanisme otomatis menaikkan prioritas tiket ke Urgent berdasarkan kata kunci |
| Fail-safe | Mekanisme fallback agar sistem tetap berjalan meskipun komponen lain (ML) gagal |
| Realtime Channel | Koneksi WebSocket Supabase untuk menerima update data secara instan |
| anonymous_code | Kode unik deterministik (`Anonim_#XXXX`) yang menggantikan identitas mahasiswa anonim |

---

*Dokumen ini merupakan living document. Revisi dilakukan sesuai perkembangan proyek.*  
*Versi terakhir: 2.0 — Juni 2026*

# PLAN — Smart Campus Helpdesk UNSAP (Rebuild)

**Dokumen:** Implementation Plan  
**Versi:** 1.0  
**Referensi:** PRD v2.0  
**Total Batch:** 24 batch  
**Estimasi Total:** 8 minggu  

---

## Cara Membaca Dokumen Ini

Setiap batch adalah unit kerja yang **bisa diselesaikan dalam satu sesi** (2–6 jam). Urutan antar batch dalam satu phase harus diikuti. Batch di phase berbeda bisa paralel jika ada dua developer.

**Status task:**
- `[ ]` Belum dikerjakan
- `[x]` Selesai
- `[~]` Sedang dikerjakan
- `[-]` Di-skip / tidak relevan

**Konvensi file path:** Semua path relatif dari root repo kecuali disebutkan lain.

---

## Overview Batch

| Batch | Nama | Phase | Estimasi |
|---|---|---|---|
| B01 | Inisialisasi Repo & Tools | Foundation | 2 jam |
| B02 | Supabase Project Setup | Foundation | 3 jam |
| B03 | Migrasi Skema Database | Foundation | 3 jam |
| B04 | Next.js Project Setup | Foundation | 2 jam |
| B05 | Design System & Layout | Foundation | 4 jam |
| B06 | Supabase Auth — Backend | Auth | 3 jam |
| B07 | Halaman Auth — Frontend | Auth | 4 jam |
| B08 | ML Service Refactor & Deploy | ML | 4 jam |
| B09 | API Routes — Tiket CRUD | Core | 4 jam |
| B10 | Halaman Mahasiswa — Submit Tiket | Core | 5 jam |
| B11 | Halaman Mahasiswa — Dashboard & Detail | Core | 4 jam |
| B12 | API Routes — Admin & Analytics | Core | 4 jam |
| B13 | Halaman Admin — Dashboard & Tabel | Core | 5 jam |
| B14 | Halaman Admin — Detail Tiket | Core | 3 jam |
| B15 | FAQ Suggestion Integration | ML | 3 jam |
| B16 | Supabase Edge Function: process-ticket-ml | ML | 4 jam |
| B17 | Auto-escalation & Fail-safe | ML | 2 jam |
| B18 | Live Chat — Backend & Realtime | Realtime | 4 jam |
| B19 | Live Chat — Frontend | Realtime | 4 jam |
| B20 | Notifikasi Realtime | Realtime | 3 jam |
| B21 | Analytics & Charts | Analytics | 5 jam |
| B22 | ML Active Learning Dashboard | ML | 4 jam |
| B23 | Polish, Optimasi & Keamanan | Polish | 5 jam |
| B24 | Testing, Migrasi Data & Deploy | Launch | 6 jam |

---

## PHASE 1 — FOUNDATION

> Tujuan: Semua infrastruktur dasar siap. Developer bisa clone repo dan langsung running secara lokal.

---

### B01 — Inisialisasi Repo & Tools

**Estimasi:** 2 jam  
**Prasyarat:** Tidak ada  
**Output:** Repo bersih siap development

#### Setup Repo

- [ ] Buat repository baru di GitHub: `smart-campus-helpdesk-unsap` (atau rename yang lama)
- [ ] Init struktur monorepo:
  ```bash
  mkdir -p app/api components lib hooks types supabase/functions supabase/migrations ml-service public/assets .github/workflows
  ```
- [ ] Buat `.gitignore` yang cover Node.js, Python, dan env files:
  ```
  node_modules/
  .next/
  .env.local
  ml-service/venv/
  ml-service/models/*.pkl
  ml-service/__pycache__/
  supabase/.branches/
  supabase/.temp/
  ```
- [ ] Buat `.env.local.example` dengan semua key yang dibutuhkan (tanpa value):
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ML_SERVICE_URL=
  ML_SERVICE_API_KEY=
  ```

#### Install Tools Global

- [ ] Pastikan Node.js >= 18 terinstall: `node -v`
- [ ] Pastikan Python >= 3.11 terinstall: `python --version`
- [ ] Install Supabase CLI:
  ```bash
  npm install -g supabase
  supabase --version   # pastikan >= 1.150.0
  ```
- [ ] Install Railway CLI (opsional, bisa via dashboard):
  ```bash
  npm install -g @railway/cli
  railway --version
  ```

#### GitHub Actions — Skeleton

- [ ] Buat `.github/workflows/deploy-nextjs.yml` (skeleton, belum aktif):
  ```yaml
  name: Deploy Next.js to Vercel
  on:
    push:
      branches: [main]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        # TODO: tambah Vercel deploy step di B24
  ```
- [ ] Buat `.github/workflows/deploy-ml.yml` (skeleton):
  ```yaml
  name: Deploy ML Service to Railway
  on:
    push:
      branches: [main]
      paths: ['ml-service/**']
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        # TODO: tambah Railway deploy step di B24
  ```

#### Buat README.md sementara

- [ ] Tulis README singkat berisi: nama proyek, tech stack, link ke PRD.md dan PLAN.md, cara setup lokal (akan diupdate di B24)

---

### B02 — Supabase Project Setup

**Estimasi:** 3 jam  
**Prasyarat:** B01 selesai, punya akun Supabase  
**Output:** Supabase project aktif, Supabase CLI terhubung, local dev siap

#### Buat Supabase Project

- [ ] Login ke [supabase.com](https://supabase.com) → New Project
- [ ] Nama project: `smart-campus-helpdesk`
- [ ] Region: Singapore (terdekat ke Indonesia)
- [ ] Catat semua credential ke `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

#### Link CLI ke Project

- [ ] Jalankan dari root repo:
  ```bash
  supabase login
  supabase link --project-ref [PROJECT_REF]
  ```
- [ ] Test koneksi:
  ```bash
  supabase status
  ```

#### Konfigurasi Supabase Auth

- [ ] Di Supabase Dashboard → Authentication → Settings:
  - Disable "Confirm email" untuk dev (enable kembali di production)
  - Set Site URL: `http://localhost:3000`
  - Set Redirect URLs: `http://localhost:3000/auth/callback`
- [ ] Catat: konfigurasi ini akan diupdate ke production URL di B24

#### Konfigurasi Supabase Storage

- [ ] Di Dashboard → Storage → New Bucket:
  - Nama: `attachments`
  - Public: **No** (private, akses via signed URL)
- [ ] Set file size limit: 2MB
- [ ] Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`

#### Inisialisasi Supabase Lokal

- [ ] Buat `supabase/config.toml` (auto-generate via):
  ```bash
  supabase init
  ```
- [ ] Verifikasi `supabase/config.toml` sudah ada dengan project_id yang benar

---

### B03 — Migrasi Skema Database

**Estimasi:** 3 jam  
**Prasyarat:** B02 selesai  
**Output:** Semua tabel, RLS, trigger, dan Realtime aktif di Supabase

#### Migration File: Init Schema

- [ ] Buat `supabase/migrations/00001_init_schema.sql`:
  ```sql
  -- Tabel profiles (extend auth.users)
  CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nim           TEXT UNIQUE,
    full_name     TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'mahasiswa'
                  CHECK (role IN ('mahasiswa', 'admin', 'master_admin')),
    department    TEXT,
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tabel tickets
  CREATE TABLE public.tickets (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number        TEXT UNIQUE NOT NULL,
    title                TEXT NOT NULL,
    description          TEXT NOT NULL,
    category             TEXT NOT NULL
                         CHECK (category IN ('akademik','keuangan','fasilitas','keamanan','lainnya')),
    status               TEXT NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','in_progress','resolved','closed')),
    priority             TEXT NOT NULL DEFAULT 'normal'
                         CHECK (priority IN ('low','normal','urgent')),
    is_anonymous         BOOLEAN DEFAULT FALSE,
    anonymous_code       TEXT,
    reporter_id          UUID REFERENCES public.profiles(id),
    assigned_to          UUID REFERENCES public.profiles(id),
    department           TEXT,
    attachment_url       TEXT,
    ml_confidence        FLOAT,
    ml_model_version     TEXT,
    priority_overridden  BOOLEAN DEFAULT FALSE,
    sla_deadline         TIMESTAMPTZ,
    resolved_at          TIMESTAMPTZ,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tabel messages
  CREATE TABLE public.messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES public.profiles(id),
    content     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tabel faqs
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

  -- Tabel ml_training_data
  CREATE TABLE public.ml_training_data (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id        UUID REFERENCES public.tickets(id),
    text_input       TEXT NOT NULL,
    ml_prediction    TEXT NOT NULL,
    corrected_label  TEXT NOT NULL,
    corrected_by     UUID REFERENCES public.profiles(id),
    model_version    TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tabel ticket_rate_limits
  CREATE TABLE public.ticket_rate_limits (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL REFERENCES public.profiles(id),
    date      DATE NOT NULL DEFAULT CURRENT_DATE,
    count     INTEGER DEFAULT 1,
    UNIQUE(user_id, date)
  );

  -- Tabel notifications
  CREATE TABLE public.notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id),
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT,
    ticket_id   UUID REFERENCES public.tickets(id),
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
  ```

#### Migration File: Triggers

- [ ] Buat `supabase/migrations/00002_triggers.sql`:
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

  -- Auto-set SLA deadline
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

  -- Auto-update updated_at
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  -- Auto-create profile saat user register
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'mahasiswa')
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  ```

#### Migration File: RLS Policies

- [ ] Buat `supabase/migrations/00003_rls_policies.sql`:
  ```sql
  -- Enable RLS
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.ml_training_data ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.ticket_rate_limits ENABLE ROW LEVEL SECURITY;

  -- PROFILES
  CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()
              AND role IN ('admin','master_admin')));
  CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

  -- TICKETS: select
  CREATE POLICY "tickets_select" ON public.tickets FOR SELECT USING (
    auth.uid() = reporter_id
    OR auth.uid() = assigned_to
    OR EXISTS (SELECT 1 FROM public.profiles
               WHERE id = auth.uid() AND role IN ('admin','master_admin'))
  );
  -- TICKETS: insert (mahasiswa saja)
  CREATE POLICY "tickets_insert" ON public.tickets FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);
  -- TICKETS: update (admin & master_admin)
  CREATE POLICY "tickets_update" ON public.tickets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin','master_admin'))
  );

  -- MESSAGES
  CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (
        t.reporter_id = auth.uid()
        OR t.assigned_to = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles
                   WHERE id = auth.uid() AND role IN ('admin','master_admin'))
      )
    )
  );
  CREATE POLICY "messages_insert" ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

  -- NOTIFICATIONS
  CREATE POLICY "notifications_own" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

  -- FAQS (public read)
  CREATE POLICY "faqs_select_all" ON public.faqs FOR SELECT USING (is_active = true);
  CREATE POLICY "faqs_manage" ON public.faqs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'master_admin')
  );

  -- ML TRAINING DATA (master admin only)
  CREATE POLICY "ml_data_master" ON public.ml_training_data FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'master_admin')
  );

  -- RATE LIMITS (own only)
  CREATE POLICY "rate_limit_own" ON public.ticket_rate_limits
    FOR ALL USING (auth.uid() = user_id);
  ```

#### Migration File: Realtime & Seed

- [ ] Buat `supabase/migrations/00004_realtime_seed.sql`:
  ```sql
  -- Enable Realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

  -- Seed FAQ awal
  INSERT INTO public.faqs (question, answer, category) VALUES
  ('Bagaimana cara mengajukan cuti akademik?',
   'Cuti akademik dapat diajukan melalui SIAKAD paling lambat 2 minggu sebelum semester dimulai dengan menyertakan surat permohonan dan KTM.',
   'akademik'),
  ('Kapan batas pembayaran UKT semester ini?',
   'Batas pembayaran UKT dapat dilihat di portal mahasiswa UNSAP pada menu Keuangan > Tagihan.',
   'keuangan'),
  ('Bagaimana prosedur peminjaman ruang kelas?',
   'Peminjaman ruang kelas diajukan ke Bagian Sarana dan Prasarana minimal 3 hari sebelum penggunaan dengan mengisi formulir yang tersedia di Tata Usaha.',
   'fasilitas'),
  ('Bagaimana cara mendapatkan surat keterangan aktif kuliah?',
   'Surat keterangan aktif kuliah dapat diurus di Bagian Akademik dengan membawa KTM dan KRS semester berjalan.',
   'akademik'),
  ('Apa yang harus dilakukan jika ada masalah dengan akun SIAKAD?',
   'Hubungi helpdesk IT UNSAP melalui sistem ini dengan melampirkan screenshot masalah dan NIM Anda.',
   'lainnya');
  ```

#### Push Migration ke Supabase

- [ ] Jalankan:
  ```bash
  supabase db push
  ```
- [ ] Verifikasi di Dashboard → Table Editor bahwa semua tabel sudah ada
- [ ] Verifikasi di Dashboard → Authentication → Policies bahwa RLS aktif
- [ ] Test trigger: insert dummy user via Dashboard, cek apakah profile ter-create otomatis

#### Generate TypeScript Types

- [ ] Generate types dari schema:
  ```bash
  supabase gen types typescript --linked > types/database.ts
  ```
- [ ] Commit file `types/database.ts` ke repo

---

### B04 — Next.js Project Setup

**Estimasi:** 2 jam  
**Prasyarat:** B01 selesai, Node.js >= 18  
**Output:** Next.js 14 berjalan di localhost:3000

#### Init Next.js

- [ ] Dari root repo:
  ```bash
  npx create-next-app@latest . \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --src-dir \        # TIDAK, kita tidak pakai src/ sesuai struktur PRD
    --import-alias "@/*"
  ```
  > Catatan: pilih **No** untuk `src/` directory agar sesuai struktur PRD (app/ di root)

- [ ] Verifikasi struktur: `app/`, `components/`, `public/` ada di root

#### Install Dependencies Core

- [ ] Install Supabase client:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```
- [ ] Install UI dependencies:
  ```bash
  npm install lucide-react react-hook-form @hookform/resolvers zod zustand
  ```
- [ ] Install shadcn/ui:
  ```bash
  npx shadcn@latest init
  # Pilih: Default style, Zinc color, CSS variables: yes
  ```
- [ ] Install komponen shadcn yang dibutuhkan:
  ```bash
  npx shadcn@latest add button input label textarea select badge
  npx shadcn@latest add card dialog dropdown-menu table tabs toast
  npx shadcn@latest add avatar separator skeleton progress
  ```
- [ ] Install chart library:
  ```bash
  npm install recharts
  ```

#### Konfigurasi Tailwind

- [ ] Update `tailwind.config.ts` — ikuti panduan DESIGN.md (Light Theme, Emerald Accents):
  - Setup CSS variables untuk palette Light Emerald di `globals.css`
  - Setup custom font `Playfair Display` dan `Inter`
  - Setup utility radius dan spacing

#### Konfigurasi `next.config.ts`

- [ ] Tambah konfigurasi image domains Supabase:
  ```typescript
  const nextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '*.supabase.co' }
      ]
    }
  }
  ```

#### Setup path alias

- [ ] Verifikasi `tsconfig.json` sudah ada:
  ```json
  { "compilerOptions": { "paths": { "@/*": ["./*"] } } }
  ```

#### Test Run

- [ ] Jalankan `npm run dev` → buka `http://localhost:3000`
- [ ] Tidak ada error di console
- [ ] Commit: `chore: setup Next.js 14 with shadcn/ui and Supabase client`

---

### B05 — Design System & Layout

**Estimasi:** 4 jam  
**Prasyarat:** B04 selesai  
**Output:** Global layout, tema dark mode, komponen layout reusable

#### Global CSS (Light Emerald Theme)

- [ ] Update `app/globals.css` sesuai `DESIGN.md`:
  - Setup CSS variables untuk palette Light Theme (Warm white, Emerald glows)
  - Buat utility class untuk `shadow-capsule` dan efek brutalist glow
  - Set default body background dan text color
  - Tambah styling scrollbar minimalis

- [ ] Update `app/layout.tsx` — set font menggunakan Playfair Display dan Inter.

#### Buat Supabase Client Utils

- [ ] Buat `lib/supabase/client.ts`:
  ```typescript
  import { createBrowserClient } from '@supabase/ssr'
  import type { Database } from '@/types/database'

  export function createClient() {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  ```

- [ ] Buat `lib/supabase/server.ts`:
  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { cookies } from 'next/headers'
  import type { Database } from '@/types/database'

  export async function createClient() {
    const cookieStore = await cookies()
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() },
                   setAll(cs) { cs.forEach(({ name, value, options }) =>
                     cookieStore.set(name, value, options)) } } }
    )
  }
  ```

#### Komponen Layout: Sidebar

- [ ] Buat `components/layout/Sidebar.tsx`:
  - Menggunakan Cendekia style: `bg-surface-container-low`
  - Nav item aktif highlighted dengan warna `primary` (Navy)
  - Avatar + nama user + badge role di bottom

#### Komponen Layout: Navbar (Mobile)

- [ ] Buat `components/layout/Navbar.tsx`:
  - Menggunakan class `.glass-nav` (glassmorphism)

#### App Layout untuk Dashboard

- [ ] Buat `app/(dashboard)/layout.tsx`:
  - Sidebar di kiri, main content `bg-background` dan `text-on-surface`

#### Komponen UI Reusable (Cendekia Style)

- [ ] Buat `components/ui/PriorityBadge.tsx`:
  - Gunakan style dot warna (merah/biru/outline) dengan pill shape
- [ ] Buat `components/ui/StatusBadge.tsx`:
  - Gunakan style pill dengan warna glass/tonal background
- [ ] Buat `components/ui/SlaIndicator.tsx`:
  - Gunakan indikator dot hijau/kuning/merah dengan animasi `sla-pulse` jika overdue

#### Halaman Landing Page

- [ ] Update `app/page.tsx`:
  - Redesign dengan warm off-white background, teks warna navy, dan feature card berdesain glow.

---

## PHASE 2 — AUTENTIKASI

---

### B06 — Supabase Auth — Backend

**Estimasi:** 3 jam  
**Prasyarat:** B03, B04 selesai  
**Output:** Middleware auth aktif, API callback route, helper server-side

#### Middleware Auth

- [X] Buat `middleware.ts` di root:
  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { NextResponse, type NextRequest } from 'next/server'

  export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cs) { cs.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response = NextResponse.next({ request })
          response.cookies.set(name, value, options)
        })}
      }}
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // Proteksi route dashboard
    if (path.startsWith('/mahasiswa') && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (path.startsWith('/admin') && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect jika sudah login tapi buka /login atau /register
    if ((path === '/login' || path === '/register') && user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role
      if (role === 'mahasiswa') return NextResponse.redirect(new URL('/mahasiswa', request.url))
      if (role === 'admin' || role === 'master_admin')
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return response
  }

  export const config = {
    matcher: ['/mahasiswa/:path*', '/admin/:path*', '/login', '/register']
  }
  ```

#### Auth Callback Route

- [X] Buat `app/api/auth/callback/route.ts`:
  - Handle OAuth callback dari Supabase
  - Exchange code untuk session
  - Redirect ke halaman yang sesuai berdasarkan role

#### Helper: Get Current User (Server)

- [X] Buat `lib/auth.ts`:
  ```typescript
  import { createClient } from '@/lib/supabase/server'
  import { redirect } from 'next/navigation'

  export async function requireAuth() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    return user
  }

  export async function requireRole(allowedRoles: string[]) {
    const user = await requireAuth()
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    if (!profile || !allowedRoles.includes(profile.role)) redirect('/login')
    return { user, profile }
  }

  export async function getCurrentProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    return profile
  }
  ```

#### Validasi Schema Auth

- [X] Buat `lib/validations/auth.schema.ts`:
  ```typescript
  import { z } from 'zod'

  export const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter')
  })

  export const registerSchema = z.object({
    nim: z.string().regex(/^\d{8,12}$/, 'NIM harus 8-12 digit angka'),
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirm_password: z.string()
  }).refine(d => d.password === d.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password']
  })
  ```

---

### B07 — Halaman Auth — Frontend

**Estimasi:** 4 jam  
**Prasyarat:** B05, B06 selesai  
**Output:** Halaman login dan register berfungsi penuh

#### Layout Auth

- [X] Buat `app/(auth)/layout.tsx`:
  - Centered card layout (max-w-md)
  - Background dengan subtle pattern atau solid dark
  - Logo UNSAP di atas card

#### Halaman Login

- [X] Buat `app/(auth)/login/page.tsx`:
  - Form: Email, Password
  - Tombol "Masuk" dengan loading state
  - Link ke halaman register
  - Error message dari Supabase (email/password salah)
  - Gunakan `react-hook-form` + `loginSchema`

- [X] Logic submit:
  ```typescript
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) { setError(error.message); return }
  // Middleware akan handle redirect
  router.refresh()
  ```

#### Halaman Register

- [X] Buat `app/(auth)/register/page.tsx`:
  - Form: NIM, Nama Lengkap, Email, Password, Konfirmasi Password
  - Tombol "Daftar" dengan loading state
  - Link ke halaman login
  - Gunakan `react-hook-form` + `registerSchema`

- [X] Logic submit:
  ```typescript
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name, role: 'mahasiswa' } }
  })
  if (error) { setError(error.message); return }
  // Update NIM di profile
  await supabase.from('profiles').update({ nim }).eq('id', data.user!.id)
  router.push('/mahasiswa')
  ```

#### Update Dashboard Layout — Auth Check

- [X] Update `app/(dashboard)/layout.tsx`:
  - Gunakan `requireAuth()` dari `lib/auth.ts` untuk validasi di server
  - Pass `profile` sebagai prop ke `Sidebar`
  - Tampilkan nama user di sidebar

#### Test Auth Flow

- [X] Register akun mahasiswa baru → cek profil terbuat di DB
- [X] Login → redirect ke `/mahasiswa`
- [X] Akses `/admin` tanpa login → redirect ke `/login`
- [X] Refresh halaman → session tetap ada
- [X] Logout → session hilang, redirect ke `/login`

#### Seeder: Akun Admin & Master Admin

- [X] Buat `supabase/migrations/00005_seed_accounts.sql`:
  > Buat manual via Supabase Dashboard → Authentication → Users untuk akun test:
  - `admin@unsap.ac.id` / `admin123` → update role di profiles menjadi `admin`
  - `masteradmin@unsap.ac.id` / `master123` → update role menjadi `master_admin`
  
  ```sql
  -- Jalankan manual setelah buat user via Dashboard Auth
  UPDATE public.profiles SET role = 'admin', department = 'Akademik'
    WHERE id = '[UUID admin user]';
  UPDATE public.profiles SET role = 'master_admin'
    WHERE id = '[UUID master admin user]';
  ```

---

## PHASE 3 — ML SERVICE

---

### B08 — ML Service Refactor & Deploy

**Estimasi:** 4 jam  
**Prasyarat:** B01 selesai, punya akun Railway  
**Output:** FastAPI ML Service berjalan di Railway dengan API Key, endpoint terstandarisasi

#### Struktur ML Service

- [ ] Pastikan `ml-service/` punya struktur:
  ```
  ml-service/
  ├── datasets/dataset.csv
  ├── models/              # kosong, akan diisi setelah train
  ├── utils/
  │   ├── __init__.py
  │   ├── preprocessor.py
  │   └── model_loader.py
  ├── main.py
  ├── train.py
  ├── requirements.txt
  ├── Procfile
  └── railway.json
  ```

#### Refactor `utils/preprocessor.py`

- [ ] Pastikan preprocessing include:
  - Lowercase
  - Remove punctuation & numbers
  - Tokenisasi
  - Remove stopwords Bahasa Indonesia (NLTK + custom list)
  - Stemming dengan PySastrawi
  - Return clean string

#### Refactor `utils/model_loader.py`

- [ ] Implementasi pattern singleton untuk model:
  ```python
  import joblib, os
  from pathlib import Path

  MODEL_DIR = Path(__file__).parent.parent / "models"
  _model = None
  _vectorizer = None
  _model_version = None

  def load_model():
      global _model, _vectorizer, _model_version
      # Load model .pkl terbaru dari folder models/
      model_files = sorted(MODEL_DIR.glob("model_*.pkl"), reverse=True)
      if not model_files:
          raise FileNotFoundError("No model found. Run train.py first.")
      latest = model_files[0]
      _model_version = latest.stem
      _model = joblib.load(latest)
      _vectorizer = joblib.load(MODEL_DIR / "vectorizer.pkl")

  def get_model():
      if _model is None:
          load_model()
      return _model, _vectorizer, _model_version

  def reload_model():
      """Reload model tanpa restart server — dipanggil setelah retrain."""
      global _model, _vectorizer, _model_version
      _model = _vectorizer = _model_version = None
      load_model()
  ```

#### Refactor `main.py`

- [ ] Implementasi endpoint sesuai PRD:
  ```python
  from fastapi import FastAPI, HTTPException, Security, Depends
  from fastapi.security.api_key import APIKeyHeader
  from pydantic import BaseModel
  from typing import List, Optional
  import os

  app = FastAPI(title="UNSAP ML Service", version="2.0")

  API_KEY = os.environ.get("ML_API_KEY", "dev-key-insecure")
  api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

  def verify_api_key(key: str = Security(api_key_header)):
      if key != API_KEY:
          raise HTTPException(status_code=403, detail="Invalid API Key")
      return key

  # Models Pydantic
  class ClassifyRequest(BaseModel):
      text: str

  class FaqSuggestRequest(BaseModel):
      text: str
      top_k: Optional[int] = 3

  class SentimentRequest(BaseModel):
      text: str

  class TrainingItem(BaseModel):
      text: str
      label: str

  class RetrainRequest(BaseModel):
      training_data: List[TrainingItem]

  @app.get("/health")
  def health():
      return {"status": "ok", "service": "UNSAP ML Service v2"}

  @app.post("/classify", dependencies=[Depends(verify_api_key)])
  def classify(req: ClassifyRequest):
      # Implementasi di B16
      pass

  @app.post("/faq-suggest", dependencies=[Depends(verify_api_key)])
  def faq_suggest(req: FaqSuggestRequest):
      # Implementasi di B15
      pass

  @app.post("/sentiment", dependencies=[Depends(verify_api_key)])
  def sentiment(req: SentimentRequest):
      # Implementasi di B21
      pass

  @app.post("/retrain", dependencies=[Depends(verify_api_key)])
  def retrain(req: RetrainRequest):
      # Implementasi di B22
      pass

  @app.get("/model-info", dependencies=[Depends(verify_api_key)])
  def model_info():
      _, _, version = get_model()
      return {"model_version": version}

  if __name__ == "__main__":
      import uvicorn
      uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), reload=False)
  ```

#### Setup `requirements.txt`

- [ ] Pastikan berisi:
  ```
  fastapi==0.111.0
  uvicorn[standard]==0.29.0
  scikit-learn==1.4.2
  joblib==1.4.2
  pydantic==2.7.1
  PySastrawi==1.2.0
  nltk==3.8.1
  numpy==1.26.4
  scipy==1.13.0
  python-multipart==0.0.9
  ```

#### `Procfile` untuk Railway

- [ ] Buat `ml-service/Procfile`:
  ```
  web: uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

#### `railway.json`

- [ ] Buat `ml-service/railway.json`:
  ```json
  {
    "$schema": "https://railway.app/railway.schema.json",
    "build": { "builder": "NIXPACKS" },
    "deploy": {
      "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
      "healthcheckPath": "/health",
      "healthcheckTimeout": 100,
      "restartPolicyType": "ON_FAILURE"
    }
  }
  ```

#### Train Model Awal

- [ ] Jalankan lokal:
  ```bash
  cd ml-service
  python -m venv venv && source venv/bin/activate
  pip install -r requirements.txt
  python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"
  python train.py
  ```
- [ ] Verifikasi `models/model_*.pkl` dan `models/vectorizer.pkl` ter-generate
- [ ] Tambahkan `ml-service/models/*.pkl` ke `.gitignore`

#### Deploy ke Railway

- [ ] Login Railway: `railway login`
- [ ] Buat project baru: `railway init` (dari dalam `ml-service/`)
- [ ] Set environment variables di Railway Dashboard:
  - `ML_API_KEY` → generate random string (simpan di `.env.local` sebagai `ML_SERVICE_API_KEY`)
- [ ] Deploy: `railway up`
- [ ] Test endpoint: `curl https://[railway-url]/health`
- [ ] Catat Railway URL ke `.env.local` sebagai `ML_SERVICE_URL`

#### Helper ML di Next.js

- [ ] Buat `lib/ml.ts`:
  ```typescript
  const ML_URL = process.env.ML_SERVICE_URL!
  const ML_KEY = process.env.ML_SERVICE_API_KEY!

  const headers = { 'Content-Type': 'application/json', 'X-API-Key': ML_KEY }

  export async function classifyTicket(text: string) {
    try {
      const res = await fetch(`${ML_URL}/classify`, {
        method: 'POST', headers,
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(5000)  // timeout 5 detik
      })
      if (!res.ok) return null
      return await res.json()
    } catch { return null }  // fail-safe: return null jika timeout/error
  }

  export async function suggestFaq(text: string, topK = 3) {
    try {
      const res = await fetch(`${ML_URL}/faq-suggest`, {
        method: 'POST', headers,
        body: JSON.stringify({ text, top_k: topK }),
        signal: AbortSignal.timeout(3000)
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.suggestions ?? []
    } catch { return [] }
  }
  ```

---

## PHASE 4 — CORE FEATURES

---

### B09 — API Routes — Tiket CRUD

**Estimasi:** 4 jam  
**Prasyarat:** B03, B06 selesai  
**Output:** Semua endpoint tiket berfungsi dengan validasi dan RLS

#### Validasi Schema Tiket

- [ ] Buat `lib/validations/ticket.schema.ts`:
  ```typescript
  import { z } from 'zod'

  export const createTicketSchema = z.object({
    title:       z.string().min(10, 'Judul minimal 10 karakter').max(200),
    description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(5000),
    category:    z.enum(['akademik','keuangan','fasilitas','keamanan','lainnya']),
    department:  z.string().min(1, 'Pilih departemen tujuan'),
    is_anonymous:z.boolean().default(false),
  })

  export const updateTicketSchema = z.object({
    status:     z.enum(['open','in_progress','resolved','closed']).optional(),
    priority:   z.enum(['low','normal','urgent']).optional(),
    assigned_to:z.string().uuid().optional(),
  })
  ```

#### Utilitas Anonimitas

- [ ] Buat `lib/anonymize.ts`:
  ```typescript
  export function generateAnonymousCode(userId: string): string {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash |= 0
    }
    return `Anonim_#${Math.abs(hash).toString(16).toUpperCase().slice(0, 4)}`
  }
  ```

#### Utilitas Rate Limit

- [ ] Buat `lib/rateLimit.ts`:
  ```typescript
  import { createClient } from '@/lib/supabase/server'

  export async function checkTicketRateLimit(userId: string): Promise<boolean> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('ticket_rate_limits')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    return !data || data.count < 3
  }

  export async function incrementRateLimit(userId: string) {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    await supabase.from('ticket_rate_limits')
      .upsert({ user_id: userId, date: today, count: 1 },
               { onConflict: 'user_id,date',
                 ignoreDuplicates: false })
      .then(() => supabase.rpc('increment_rate_limit_count',
                               { p_user_id: userId, p_date: today }))
  }
  ```

  > Catatan: buat juga DB function `increment_rate_limit_count` via migration

#### API Route: GET & POST /api/tickets

- [ ] Buat `app/api/tickets/route.ts`:

  **GET** — list tiket (filter berdasarkan role):
  - Mahasiswa: hanya tiket sendiri
  - Admin: semua tiket, support query params: `status`, `priority`, `category`, `department`, `page`, `limit`
  - Jika tiket anonim dan requester bukan master_admin: mask reporter info
  
  **POST** — buat tiket baru:
  - Validasi dengan `createTicketSchema`
  - Cek rate limit (max 3/hari)
  - Handle upload file (jika ada `attachment`) ke Supabase Storage
  - Generate `anonymous_code` jika `is_anonymous = true`
  - Insert ke DB
  - Return tiket yang dibuat (priority masih `normal`, akan di-update oleh Edge Function)

#### API Route: GET, PATCH /api/tickets/[id]

- [ ] Buat `app/api/tickets/[id]/route.ts`:

  **GET** — detail satu tiket:
  - Validasi kepemilikan atau role admin
  - Mask data anonim jika bukan master_admin

  **PATCH** — update tiket (admin only):
  - Validasi dengan `updateTicketSchema`
  - Hanya admin/master_admin yang boleh update
  - Jika status diubah ke `resolved`, set `resolved_at = NOW()`
  - Jika priority di-override, set `priority_overridden = true`

#### API Route: Upload Attachment

- [ ] Upload ke Supabase Storage di dalam POST `/api/tickets`:
  ```typescript
  const file = formData.get('attachment') as File | null
  let attachmentUrl: string | null = null

  if (file) {
    // Validasi
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type))
      return Response.json({ error: 'Tipe file tidak diizinkan' }, { status: 400 })
    if (file.size > 2 * 1024 * 1024)
      return Response.json({ error: 'File maksimal 2MB' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(`${ticketId}/${fileName}`, file)

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(`${ticketId}/${fileName}`)
      attachmentUrl = publicUrl
    }
  }
  ```

---

### B10 — Halaman Mahasiswa — Submit Tiket

**Estimasi:** 5 jam  
**Prasyarat:** B07, B09 selesai  
**Output:** Form submit tiket lengkap dengan upload file dan FAQ suggestion placeholder

#### Custom Hook: useTicketForm

- [ ] Buat `hooks/useTicketForm.ts`:
  - State untuk form data, loading, error, success
  - Fungsi submit yang call POST /api/tickets
  - Handle multipart form (untuk file upload)
  - Rate limit error handling

#### Komponen FaqSuggestion (Placeholder)

- [ ] Buat `components/ticket/FaqSuggestion.tsx`:
  - Terima prop `query: string`
  - Tampilkan skeleton saat loading
  - Tampilkan card saran jika ada hasil (data dummy dulu)
  - Tampilkan "Tidak ada saran" jika kosong
  - Integrasi ML akan dilakukan di B15

#### Halaman Submit Tiket

- [ ] Buat `app/(dashboard)/mahasiswa/submit/page.tsx`:

  **Form fields:**
  - Judul (text input, min 10 char, counter)
  - Kategori (select: Akademik / Keuangan / Fasilitas / Keamanan / Lainnya)
  - Departemen Tujuan (select: Akademik / Keuangan / Kemahasiswaan / IT / Sarana & Prasarana / Lainnya)
  - Deskripsi (textarea, min 20 char, counter)
  - FAQ Suggestion (muncul di bawah deskripsi, auto-trigger saat mengetik)
  - Lampiran (file input: drag & drop area, preview file yang dipilih, tombol hapus)
  - Lapor sebagai Anonim (toggle switch dengan penjelasan singkat)

  **UX details:**
  - Semua field validated on blur + on submit
  - Error message muncul di bawah setiap field
  - Submit button disabled saat loading
  - Progress indicator saat upload file
  - Success state: tampilkan nomor tiket yang dibuat + link ke detail tiket
  - Rate limit exceeded: tampilkan "Anda sudah membuat 3 laporan hari ini"

#### Update Rate Limit — DB Function

- [ ] Tambah ke `supabase/migrations/00006_rpc_functions.sql`:
  ```sql
  CREATE OR REPLACE FUNCTION increment_rate_limit_count(p_user_id UUID, p_date DATE)
  RETURNS void AS $$
  BEGIN
    INSERT INTO public.ticket_rate_limits (user_id, date, count)
    VALUES (p_user_id, p_date, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET count = ticket_rate_limits.count + 1;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```
- [ ] Push migration: `supabase db push`

---

### B11 — Halaman Mahasiswa — Dashboard & Detail

**Estimasi:** 4 jam  
**Prasyarat:** B10 selesai  
**Output:** Mahasiswa bisa lihat list tiket sendiri dan detail lengkap

#### Custom Hook: useTickets

- [ ] Buat `hooks/useTickets.ts`:
  ```typescript
  // Fetch tiket dengan pagination dan filter
  // Subscribe Supabase Realtime untuk update status tiket mahasiswa sendiri
  export function useTickets(filters?: TicketFilters) { ... }
  ```

#### Halaman Dashboard Mahasiswa

- [ ] Buat `app/(dashboard)/mahasiswa/page.tsx`:

  **Layout:**
  - Header: "Laporan Saya" + tombol "Buat Laporan Baru"
  - Stats mini: Total / Open / Resolved (dari data tiket sendiri)
  - Tabel tiket: Nomor, Judul (truncate), Kategori, Status (badge), Prioritas (badge), SLA, Tanggal

  **Tabel behavior:**
  - Klik baris → navigate ke detail tiket
  - Empty state: ilustrasi + "Belum ada laporan. Buat laporan pertama Anda."
  - Loading state: skeleton rows

#### Halaman Detail Tiket Mahasiswa

- [ ] Buat `app/(dashboard)/mahasiswa/tiket/[id]/page.tsx`:

  **Layout dua kolom (desktop):**
  - Kiri (60%): Info detail tiket
    - Nomor tiket, judul, kategori, departemen, tanggal dibuat
    - Status badge + priority badge + SLA indicator
    - Deskripsi lengkap
    - Lampiran (link download jika ada)
    - Timeline status (open → in_progress → resolved)
  - Kanan (40%): Chat room (placeholder dulu, akan diisi di B19)

  **Mobile:** Dua section stacked vertikal (Info → Chat)

---

### B12 — API Routes — Admin & Analytics

**Estimasi:** 4 jam  
**Prasyarat:** B09 selesai  
**Output:** Endpoint admin dan analytics berfungsi

#### API Route: GET /api/analytics

- [ ] Buat `app/api/analytics/route.ts`:

  **Response:**
  ```typescript
  {
    kpi: {
      total: number,
      open: number,
      in_progress: number,
      resolved: number,
      overdue: number,       // tiket yang sudah lewat SLA
      avg_resolve_hours: number
    },
    by_category: { category: string, count: number }[],
    by_priority: { priority: string, count: number }[],
    trend_weekly: { week: string, count: number }[],   // 8 minggu terakhir
    sla_compliance: number,  // persentase tiket selesai dalam SLA
    sentiment_monthly: { month: string, score: number }[]  // master admin only
  }
  ```

  - Gunakan `supabase.rpc()` untuk query agregasi yang kompleks
  - Cache hasil 5 menit (Next.js `revalidate`)

#### DB Functions untuk Analytics

- [ ] Tambah ke `supabase/migrations/00007_analytics_functions.sql`:
  ```sql
  -- KPI summary
  CREATE OR REPLACE FUNCTION get_kpi_summary()
  RETURNS json AS $$
  DECLARE result json;
  BEGIN
    SELECT json_build_object(
      'total',      COUNT(*),
      'open',       COUNT(*) FILTER (WHERE status = 'open'),
      'in_progress',COUNT(*) FILTER (WHERE status = 'in_progress'),
      'resolved',   COUNT(*) FILTER (WHERE status IN ('resolved','closed')),
      'overdue',    COUNT(*) FILTER (WHERE sla_deadline < NOW() AND status NOT IN ('resolved','closed'))
    ) INTO result FROM public.tickets;
    RETURN result;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Trend mingguan 8 minggu terakhir
  CREATE OR REPLACE FUNCTION get_weekly_trend()
  RETURNS json AS $$
  BEGIN
    RETURN (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'DD Mon') as week,
               COUNT(*) as count
        FROM public.tickets
        WHERE created_at >= NOW() - INTERVAL '8 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY DATE_TRUNC('week', created_at)
      ) t
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```
- [ ] Push migration: `supabase db push`

#### API Route: GET /api/chat

- [ ] Buat `app/api/chat/route.ts`:
  - GET: ambil semua pesan untuk ticket_id tertentu (query param)
  - Validasi user punya akses ke tiket tersebut

#### API Route: POST /api/chat

- [ ] POST ke `app/api/chat/route.ts`:
  - Validasi `content` tidak kosong, max 1000 karakter
  - Validasi user punya akses ke tiket
  - Insert ke tabel `messages`
  - Return pesan yang dibuat

---

### B13 — Halaman Admin — Dashboard & Tabel

**Estimasi:** 5 jam  
**Prasyarat:** B12 selesai  
**Output:** Admin bisa lihat dan filter semua tiket

#### KPI Cards Component

- [ ] Buat `components/dashboard/KpiCard.tsx`:
  - Props: `title`, `value`, `subtitle?`, `icon`, `trend?`, `variant: 'default' | 'danger' | 'success'`
  - Ukuran card konsisten, angka besar di tengah

#### Halaman Dashboard Admin

- [ ] Buat `app/(dashboard)/admin/page.tsx`:

  **Section 1 — KPI Cards (4 kolom):**
  - Total Tiket
  - Tiket Aktif (open + in_progress)
  - Terselesaikan Hari Ini
  - Melewati SLA (merah jika > 0)

  **Section 2 — Tabel Tiket:**
  - Kolom: No, Nomor Tiket, Judul, Kategori, Status, Prioritas, SLA, Reporter (anonim jika perlu), Tanggal

  **Filter Bar (di atas tabel):**
  - Search: input teks (filter judul / nomor tiket)
  - Status: dropdown (Semua / Open / In Progress / Resolved / Closed)
  - Prioritas: dropdown (Semua / Low / Normal / Urgent)
  - Kategori: dropdown (Semua / Akademik / ...)
  - Reset filter button

  **Tabel behavior:**
  - Klik baris → navigate ke `/admin/tiket/[id]`
  - Sort by kolom (created_at, priority, status)
  - Pagination (20 per halaman)
  - Row urgent: highlight subtle merah
  - Row overdue SLA: highlight subtle oranye
  - Empty state per filter
  - Skeleton loading

#### State Management Filter

- [ ] Buat `hooks/useAdminTickets.ts`:
  - State: filters, page, sort
  - Fetch dari GET /api/tickets dengan query params
  - Realtime subscription untuk tiket baru

---

### B14 — Halaman Admin — Detail Tiket

**Estimasi:** 3 jam  
**Prasyarat:** B13 selesai  
**Output:** Admin bisa lihat detail tiket dan update status/prioritas

#### Halaman Detail Tiket Admin

- [ ] Buat `app/(dashboard)/admin/tiket/[id]/page.tsx`:

  **Layout split-view (desktop):**
  - Panel Kiri (55%) — Detail Tiket:
    - Header: nomor tiket + status badge + priority badge
    - Info grid: kategori, departemen, tanggal, SLA indicator
    - Identitas reporter (jika anonim: kode anonim, jika master admin: nama asli dalam collapsible)
    - Deskripsi lengkap
    - Lampiran (link / preview)
    - ML info: confidence score, model version, apakah auto-escalated

    - **Action panel:**
      - Dropdown ubah status
      - Dropdown ubah prioritas (dengan warning jika override ML)
      - Dropdown assign ke admin lain
      - Tombol "Koreksi Label ML" (jika master admin) → modal pilih label yang benar

  - Panel Kanan (45%) — Chat Room (placeholder, diisi di B19)

  **Mobile:** Stack vertikal

#### Komponen: Ticket Actions

- [ ] Buat `components/ticket/TicketActions.tsx`:
  - Select status dengan PATCH /api/tickets/[id]
  - Select prioritas
  - Assign dropdown (list admin dari DB)
  - Loading state per action
  - Toast notification sukses/gagal

---

## PHASE 5 — ML INTEGRATION

---

### B15 — FAQ Suggestion Integration

**Estimasi:** 3 jam  
**Prasyarat:** B08, B10 selesai  
**Output:** FAQ suggestion muncul real-time saat mahasiswa mengetik

#### Implementasi `/faq-suggest` di ML Service

- [ ] Update `ml-service/main.py` — implementasi endpoint `/faq-suggest`:
  ```python
  from sklearn.metrics.pairwise import cosine_similarity
  from sklearn.feature_extraction.text import TfidfVectorizer
  import json

  # Load FAQ dari file JSON (akan di-sync dari DB via script)
  def load_faqs():
      faq_path = Path(__file__).parent / "datasets" / "faqs.json"
      if faq_path.exists():
          with open(faq_path) as f:
              return json.load(f)
      return []

  _faqs = None
  _faq_vectorizer = None
  _faq_matrix = None

  def get_faq_index():
      global _faqs, _faq_vectorizer, _faq_matrix
      if _faqs is None:
          _faqs = load_faqs()
          _faq_vectorizer = TfidfVectorizer()
          corpus = [preprocess(f['question'] + ' ' + f['answer']) for f in _faqs]
          _faq_matrix = _faq_vectorizer.fit_transform(corpus)
      return _faqs, _faq_vectorizer, _faq_matrix

  @app.post("/faq-suggest", dependencies=[Depends(verify_api_key)])
  def faq_suggest(req: FaqSuggestRequest):
      faqs, vectorizer, matrix = get_faq_index()
      if not faqs:
          return {"suggestions": []}
      query_vec = vectorizer.transform([preprocess(req.text)])
      scores = cosine_similarity(query_vec, matrix).flatten()
      top_indices = scores.argsort()[::-1][:req.top_k]
      suggestions = []
      for i in top_indices:
          if scores[i] > 0.1:  # threshold minimum similarity
              suggestions.append({
                  "faq_id": faqs[i].get("id"),
                  "question": faqs[i]["question"],
                  "answer": faqs[i]["answer"],
                  "similarity_score": round(float(scores[i]), 3)
              })
      return {"suggestions": suggestions}
  ```

#### Sync FAQ dari DB ke ML Service

- [ ] Buat `app/api/faq/route.ts`:
  - GET: ambil semua FAQ aktif dari DB
  - Return dalam format yang bisa dipakai frontend dan ML

- [ ] Tambah endpoint `GET /faq-data` di ML Service (tanpa API Key, internal):
  - Atau: load FAQ dari Supabase langsung via REST API saat startup ML Service

- [ ] Tambah script `ml-service/sync_faqs.py`:
  - Fetch FAQ dari Supabase via REST API
  - Simpan ke `datasets/faqs.json`
  - Reset FAQ index di memory

#### API Route Proxy FAQ Suggest

- [ ] Buat `app/api/ml/suggest/route.ts`:
  ```typescript
  import { suggestFaq } from '@/lib/ml'
  import { requireAuth } from '@/lib/auth'

  export async function POST(request: Request) {
    await requireAuth()
    const { text } = await request.json()
    if (!text || text.length < 5) return Response.json({ suggestions: [] })
    const suggestions = await suggestFaq(text)
    return Response.json({ suggestions })
  }
  ```

#### Update Komponen FaqSuggestion

- [ ] Update `components/ticket/FaqSuggestion.tsx`:
  - Debounce 500ms dari prop `query`
  - Fetch `POST /api/ml/suggest` dengan query
  - Tampilkan card untuk setiap saran (question + expandable answer)
  - Badge similarity score
  - "Tandai sebagai membantu" button (opsional, P2)
  - Muncul hanya jika `query.length >= 10`

#### Test E2E FAQ Suggestion

- [ ] Buka form submit tiket
- [ ] Ketik tentang "cuti akademik" → pastikan saran FAQ muncul dalam < 1 detik
- [ ] Ketik topik yang tidak ada di FAQ → pastikan "Tidak ada saran relevan" muncul
- [ ] Cek bahwa request dikirim hanya setelah debounce (bukan setiap keystroke)

---

### B16 — Supabase Edge Function: process-ticket-ml

**Estimasi:** 4 jam  
**Prasyarat:** B08, B09 selesai  
**Output:** Tiket otomatis ter-klasifikasi setelah submit (async, tidak blokir UX)

#### Implementasi `/classify` di ML Service

- [ ] Update `ml-service/main.py` — implementasi endpoint `/classify`:
  ```python
  from utils.preprocessor import preprocess
  from utils.model_loader import get_model

  URGENT_KEYWORDS = [
      "krs", "ukt", "uang kuliah", "spp", "beasiswa",
      "kebakaran", "kecelakaan", "darurat",
      "pelecehan", "kekerasan", "bullying", "pencurian", "kehilangan",
      "do", "drop out", "tidak lulus", "wisuda", "ijazah",
      "sakit parah", "keracunan", "pingsan"
  ]

  @app.post("/classify", dependencies=[Depends(verify_api_key)])
  def classify(req: ClassifyRequest):
      model, vectorizer, version = get_model()
      cleaned = preprocess(req.text)

      # Check auto-escalation keywords
      text_lower = req.text.lower()
      matched_keyword = None
      for kw in URGENT_KEYWORDS:
          if kw in text_lower:
              matched_keyword = kw
              break

      if matched_keyword:
          return {
              "priority": "urgent",
              "confidence": 1.0,
              "model": version,
              "overridden_by_keyword": True,
              "keyword_matched": matched_keyword
          }

      # ML classification
      vec = vectorizer.transform([cleaned])
      prediction = model.predict(vec)[0]
      proba = model.predict_proba(vec)[0]
      confidence = float(max(proba))

      return {
          "priority": prediction,
          "confidence": round(confidence, 3),
          "model": version,
          "overridden_by_keyword": False,
          "keyword_matched": None
      }
  ```

#### Buat Supabase Edge Function

- [ ] Buat `supabase/functions/process-ticket-ml/index.ts`:
  ```typescript
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

  const ML_URL = Deno.env.get('ML_SERVICE_URL')!
  const ML_KEY = Deno.env.get('ML_SERVICE_API_KEY')!
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  Deno.serve(async (req) => {
    const payload = await req.json()
    const ticket = payload.record  // dari DB webhook

    if (!ticket?.id) return new Response('No ticket', { status: 400 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const text = `${ticket.title} ${ticket.description}`

    try {
      // Call ML Service dengan timeout 5 detik
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const mlRes = await fetch(`${ML_URL}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': ML_KEY },
        body: JSON.stringify({ text }),
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (!mlRes.ok) throw new Error('ML service error')
      const result = await mlRes.json()

      // Update tiket dengan hasil ML
      await supabase.from('tickets').update({
        priority:             result.priority,
        ml_confidence:        result.confidence,
        ml_model_version:     result.model,
        priority_overridden:  result.overridden_by_keyword,
      }).eq('id', ticket.id)

      // Kirim notifikasi ke semua admin
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'master_admin'])

      if (admins) {
        const notifications = admins.map(a => ({
          user_id:   a.id,
          type:      'new_ticket',
          title:     'Laporan Baru Masuk',
          body:      `${ticket.ticket_number}: ${ticket.title}`,
          ticket_id: ticket.id
        }))
        await supabase.from('notifications').insert(notifications)
      }

    } catch (err) {
      // Fail-safe: log error, tiket tetap dengan priority 'normal'
      console.error('ML classification failed:', err)
      // Tetap kirim notifikasi meski ML gagal
    }

    return new Response('OK', { status: 200 })
  })
  ```

#### Setup DB Webhook

- [ ] Di Supabase Dashboard → Database → Webhooks → Create Webhook:
  - Name: `process-ticket-ml`
  - Table: `tickets`
  - Events: `INSERT`
  - Type: Supabase Edge Functions
  - Function: `process-ticket-ml`

#### Deploy Edge Function

- [ ] Set secrets untuk Edge Function:
  ```bash
  supabase secrets set ML_SERVICE_URL=https://[railway-url]
  supabase secrets set ML_SERVICE_API_KEY=[api-key]
  ```
- [ ] Deploy:
  ```bash
  supabase functions deploy process-ticket-ml
  ```

#### Test End-to-End

- [ ] Submit tiket baru via form mahasiswa
- [ ] Tunggu 3–10 detik
- [ ] Cek di DB: tiket harus sudah punya `priority` yang bukan null dan `ml_confidence` terisi
- [ ] Test dengan kata kunci "KRS" di deskripsi → pastikan `priority = urgent` dan `priority_overridden = true`

---

### B17 — Auto-escalation & Fail-safe

**Estimasi:** 2 jam  
**Prasyarat:** B16 selesai  
**Output:** Auto-escalation keyword di client-side dan fail-safe di Edge Function terverifikasi

#### Client-side Keyword Warning

- [ ] Buat `lib/escalation.ts`:
  ```typescript
  export const URGENT_KEYWORDS = [
    'krs', 'ukt', 'uang kuliah', 'spp', 'beasiswa',
    'kebakaran', 'kecelakaan', 'darurat',
    'pelecehan', 'kekerasan', 'bullying', 'pencurian', 'kehilangan',
    'do ', 'drop out', 'tidak lulus', 'wisuda', 'ijazah',
    'sakit parah', 'keracunan', 'pingsan'
  ]

  export function detectUrgentKeywords(text: string): string[] {
    const lower = text.toLowerCase()
    return URGENT_KEYWORDS.filter(kw => lower.includes(kw))
  }
  ```

- [ ] Update form submit tiket: jika ada keyword urgent terdeteksi di deskripsi, tampilkan banner warning: "⚠ Laporan ini mengandung kata kunci darurat dan akan otomatis mendapat prioritas URGENT."

#### Verifikasi Fail-safe

- [ ] Test: matikan ML Service sementara (railway pause), submit tiket
- [ ] Verifikasi: tiket tetap masuk ke DB dengan `priority = 'normal'` (bukan error)
- [ ] Verifikasi: UI tidak menampilkan error 500
- [ ] Nyalakan kembali ML Service

---

## PHASE 6 — REALTIME & CHAT

---

### B18 — Live Chat — Backend & Realtime

**Estimasi:** 4 jam  
**Prasyarat:** B12 selesai  
**Output:** API chat berfungsi, Supabase Realtime configured

#### Verifikasi Realtime di Supabase

- [ ] Pastikan `messages` table sudah di Supabase Realtime publication (dari B03)
- [ ] Test di Supabase Dashboard → Realtime Inspector bahwa insert ke `messages` ter-broadcast

#### API Route: POST /api/chat

- [ ] Update `app/api/chat/route.ts` — implementasi POST:
  ```typescript
  export async function POST(request: Request) {
    const { user, profile } = await requireRole(['mahasiswa', 'admin', 'master_admin'])
    const { ticket_id, content } = await request.json()

    // Validasi
    if (!content?.trim() || content.length > 1000)
      return Response.json({ error: 'Pesan tidak valid' }, { status: 400 })

    // Cek akses ke tiket
    const supabase = await createClient()
    const { data: ticket } = await supabase
      .from('tickets').select('id, reporter_id, assigned_to').eq('id', ticket_id).single()

    if (!ticket) return Response.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })

    const hasAccess = ticket.reporter_id === user.id ||
                      ticket.assigned_to === user.id ||
                      ['admin', 'master_admin'].includes(profile.role)

    if (!hasAccess) return Response.json({ error: 'Akses ditolak' }, { status: 403 })

    const { data: message, error } = await supabase
      .from('messages')
      .insert({ ticket_id, sender_id: user.id, content: content.trim() })
      .select('*, sender:profiles(id, full_name, role, anonymous_code)')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(message)
  }
  ```

#### Custom Hook: useChat

- [ ] Buat `hooks/useChat.ts`:
  ```typescript
  export function useChat(ticketId: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    const supabase = createClient()

    // Initial fetch
    useEffect(() => {
      supabase.from('messages')
        .select('*, sender:profiles(id, full_name, role)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          setMessages(data ?? [])
          setIsLoading(false)
        })
    }, [ticketId])

    // Realtime subscription
    useEffect(() => {
      const channel = supabase
        .channel(`ticket-chat-${ticketId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'messages',
          filter: `ticket_id=eq.${ticketId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        })
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED')
        })

      return () => { supabase.removeChannel(channel) }
    }, [ticketId])

    const sendMessage = async (content: string) => {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, content })
      })
    }

    return { messages, isLoading, isConnected, sendMessage }
  }
  ```

---

### B19 — Live Chat — Frontend

**Estimasi:** 4 jam  
**Prasyarat:** B18, B11, B14 selesai  
**Output:** Chat room berfungsi real-time di halaman mahasiswa dan admin

#### Komponen ChatMessage

- [ ] Buat `components/chat/ChatMessage.tsx`:
  - Bubble kiri (pesan dari lawan bicara): avatar + nama + konten + timestamp
  - Bubble kanan (pesan sendiri): konten + timestamp
  - Jika pengirim anonim dan viewer bukan master_admin: tampilkan anonymous_code
  - Format timestamp: "14:30" untuk hari ini, "Senin 14:30" untuk hari lain

#### Komponen ChatRoom

- [ ] Buat `components/chat/ChatRoom.tsx`:
  ```
  [Connection status indicator]
  [Daftar pesan — auto-scroll ke bawah]
  ─────────────────────────────────────
  [Input pesan]              [Kirim →]
  ```

  - Terima prop: `ticketId`, `currentUserId`, `currentUserRole`, `isAnonymousTicket`
  - Gunakan `useChat(ticketId)` hook
  - Auto-scroll ke pesan terbaru saat pesan baru masuk
  - Input: textarea (bisa multi-line), Enter untuk kirim (Shift+Enter untuk newline)
  - Tombol kirim disabled jika kosong atau loading
  - Indicator "Terhubung / Menyambungkan..." di atas chat
  - Empty state: "Belum ada pesan. Mulai percakapan."
  - Loading skeleton saat fetch awal

#### Integrasi ke Halaman Detail Tiket Mahasiswa

- [ ] Update `app/(dashboard)/mahasiswa/tiket/[id]/page.tsx`:
  - Ganti placeholder dengan `<ChatRoom ticketId={id} .../>`

#### Integrasi ke Halaman Detail Tiket Admin

- [ ] Update `app/(dashboard)/admin/tiket/[id]/page.tsx`:
  - Panel kanan: `<ChatRoom ticketId={id} .../>`

#### Test Realtime Chat

- [ ] Buka dua browser (satu mahasiswa, satu admin)
- [ ] Kirim pesan dari mahasiswa → pesan muncul di admin tanpa refresh
- [ ] Kirim reply dari admin → pesan muncul di mahasiswa tanpa refresh
- [ ] Putus internet → cek reconnection indicator muncul
- [ ] Sambung kembali internet → cek reconnect otomatis

---

### B20 — Notifikasi Realtime

**Estimasi:** 3 jam  
**Prasyarat:** B18 selesai  
**Output:** Admin mendapat notifikasi tiket baru dan update tanpa refresh

#### Custom Hook: useNotifications

- [ ] Buat `hooks/useNotifications.ts`:
  ```typescript
  export function useNotifications(userId: string) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    // Fetch notifikasi awal (10 terbaru, belum dibaca)
    // Subscribe ke channel notifikasi user ini
    // Fungsi markAsRead(notificationId)
    // Fungsi markAllAsRead()
  }
  ```

#### Komponen NotificationBell

- [ ] Buat `components/layout/NotificationBell.tsx`:
  - Icon bel dengan badge count (merah, max "9+")
  - Klik → dropdown list notifikasi (max 5 terbaru)
  - Setiap item: judul + body + waktu + klik navigate ke tiket
  - "Tandai semua dibaca" di bawah dropdown
  - Realtime update count saat notif baru masuk

#### Integrasi ke Sidebar/Navbar

- [ ] Tambah `<NotificationBell>` ke `Sidebar.tsx` (desktop) dan `Navbar.tsx` (mobile)
- [ ] Pass `userId` dari session

#### Realtime Subscription Notifikasi

- [ ] Subscribe di `useNotifications`:
  ```typescript
  supabase.channel(`notifications-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      setNotifications(prev => [payload.new as Notification, ...prev])
      setUnreadCount(c => c + 1)
    })
    .subscribe()
  ```

#### API Route: Mark Notifications Read

- [ ] Buat `app/api/notifications/route.ts`:
  - PATCH: tandai satu atau semua notifikasi sebagai dibaca

---

## PHASE 7 — ANALYTICS & ML DASHBOARD

---

### B21 — Analytics & Charts

**Estimasi:** 5 jam  
**Prasyarat:** B12, B13 selesai  
**Output:** Dashboard analytics dengan chart interaktif

#### Implementasi `/sentiment` di ML Service

- [ ] Update `ml-service/main.py` — implementasi endpoint `/sentiment`:
  ```python
  # Simple rule-based sentiment untuk MVP
  # (bisa diganti IndoBERT di versi selanjutnya)
  POSITIVE_WORDS = ["terima kasih", "bagus", "baik", "puas", "membantu",
                    "cepat", "profesional", "ramah", "selesai"]
  NEGATIVE_WORDS = ["buruk", "lambat", "tidak", "belum", "kecewa", "parah",
                    "susah", "sulit", "lama", "tidak ada", "tidak bisa"]

  @app.post("/sentiment", dependencies=[Depends(verify_api_key)])
  def sentiment(req: SentimentRequest):
      text_lower = req.text.lower()
      pos = sum(1 for w in POSITIVE_WORDS if w in text_lower)
      neg = sum(1 for w in NEGATIVE_WORDS if w in text_lower)
      total = pos + neg
      if total == 0:
          score = 0.5
          label = "neutral"
      else:
          score = pos / total
          label = "positive" if score > 0.6 else "negative" if score < 0.4 else "neutral"
      return {"score": round(score, 3), "label": label}
  ```

#### Komponen Charts

- [ ] Buat `components/dashboard/SlaChart.tsx`:
  - Bar chart: % kepatuhan SLA per bulan (6 bulan terakhir)
  - Recharts `BarChart`
  - Warna: hijau jika >= 80%, kuning 60–80%, merah < 60%

- [ ] Buat `components/dashboard/CategoryChart.tsx`:
  - Pie chart distribusi tiket per kategori
  - Recharts `PieChart` dengan `Legend`
  - Tooltip menampilkan jumlah dan persentase

- [ ] Buat `components/dashboard/TrendChart.tsx`:
  - Line chart tiket masuk per minggu (8 minggu)
  - Recharts `LineChart` dengan area fill
  - Tooltip detail per data point

- [ ] Buat `components/dashboard/SentimentChart.tsx`:
  - Area chart sentimen kampus per bulan
  - Hanya render jika role = master_admin
  - Warna area: hijau untuk positif, merah untuk negatif

#### Halaman Analytics

- [ ] Buat `app/(dashboard)/admin/analytics/page.tsx`:
  - Require role: admin atau master_admin
  - Fetch data dari GET /api/analytics
  - Layout grid:
    - Row 1: 4 KPI cards
    - Row 2: TrendChart (full width)
    - Row 3: CategoryChart (kiri) + SlaChart (kanan)
    - Row 4: SentimentChart (master admin only, full width)
  - Loading skeleton untuk semua chart
  - Error state jika fetch gagal

#### API Route Analytics — Sentiment

- [ ] Update `app/api/analytics/route.ts` — tambah sentiment aggregation:
  - Ambil semua deskripsi tiket bulan ini
  - Batch call ke ML /sentiment (atau gunakan cached result)
  - Agregasi score per bulan
  - Simpan ke tabel baru `sentiment_cache` (optional, untuk performa)

---

### B22 — ML Active Learning Dashboard

**Estimasi:** 4 jam  
**Prasyarat:** B08, B16 selesai  
**Output:** Master admin bisa koreksi label ML dan trigger retrain

#### Implementasi `/retrain` di ML Service

- [ ] Update `ml-service/train.py` — buat fungsi `retrain_with_new_data(new_data)`:
  ```python
  def retrain_with_new_data(new_data: list[dict]) -> dict:
      """
      new_data: [{"text": "...", "label": "urgent|normal|low"}, ...]
      Gabungkan dengan dataset awal, latih ulang semua model, pilih terbaik.
      """
      # Load dataset original
      df_original = pd.read_csv("datasets/dataset.csv")
      df_new = pd.DataFrame(new_data)
      df_combined = pd.concat([df_original, df_new]).drop_duplicates()

      # Training pipeline (sama seperti train.py awal)
      # ... (Naive Bayes, LR, SVM, Random Forest)
      # Pilih model dengan F1-score tertinggi
      # Simpan model baru dengan timestamp: model_YYYYMMDD_HHMMSS.pkl

      return {"model_version": new_version, "metrics": {...}}
  ```

- [ ] Update `ml-service/main.py` — implementasi endpoint `/retrain`:
  ```python
  from utils.model_loader import reload_model

  @app.post("/retrain", dependencies=[Depends(verify_api_key)])
  def retrain(req: RetrainRequest):
      new_data = [{"text": item.text, "label": item.label}
                  for item in req.training_data]
      result = retrain_with_new_data(new_data)
      reload_model()  # Muat model baru ke memori tanpa restart
      return {"status": "success", **result}
  ```

#### API Routes ML Management

- [ ] Buat `app/api/ml/feedback/route.ts`:
  - POST: terima `{ ticket_id, ml_prediction, corrected_label }`
  - Hanya master_admin yang bisa akses
  - Insert ke tabel `ml_training_data`

- [ ] Buat `app/api/ml/retrain/route.ts`:
  - POST: hanya master_admin
  - Fetch semua data dari `ml_training_data`
  - Forward ke Railway /retrain
  - Return metrics

- [ ] Buat `app/api/ml/model-info/route.ts`:
  - GET: fetch dari Railway /model-info
  - Cache 1 jam

#### Halaman ML Management

- [ ] Buat `app/(dashboard)/admin/ml/page.tsx`:
  - Require role: master_admin (redirect jika bukan)

  **Section 1 — Info Model Aktif:**
  - Card: nama model, versi, accuracy, F1-score, tanggal training terakhir
  - Tombol "Retrain Model" → modal konfirmasi → loading → tampilkan metrics baru

  **Section 2 — Data Training:**
  - Tabel: Teks Input (truncate), Prediksi ML, Label Koreksi, Di-koreksi oleh, Tanggal
  - Total data training
  - Filter: semua / hanya koreksi

  **Section 3 — Koreksi dari Tiket (recent):**
  - Tabel 10 tiket terbaru dengan prioritas ML
  - Per tiket: tombol "Koreksi Label" → dropdown pilih label benar → simpan ke ml_training_data

#### Koreksi Label di Detail Tiket Admin

- [ ] Update `app/(dashboard)/admin/tiket/[id]/page.tsx`:
  - Tampilkan "ML Prediction" card (jika ada `ml_confidence`)
  - Tombol "Koreksi Label ML" untuk master_admin
  - Modal: tampilkan prediksi awal + dropdown pilih label yang benar + tombol simpan
  - Setelah simpan: toast sukses

---

## PHASE 8 — POLISH, TESTING & LAUNCH

---

### B23 — Polish, Optimasi & Keamanan

**Estimasi:** 5 jam  
**Prasyarat:** B19, B21 selesai  
**Output:** Sistem siap production dari sisi performa dan keamanan

#### Loading & Error States

- [ ] Audit semua halaman — pastikan ada:
  - Skeleton loading state saat fetch data
  - Error boundary (buat `components/ui/ErrorBoundary.tsx`)
  - Empty state yang informatif (bukan halaman kosong)
- [ ] Buat `components/ui/LoadingSkeleton.tsx` yang reusable

#### Toast Notifications

- [ ] Pastikan semua aksi user ada feedback toast:
  - Submit tiket → "Laporan berhasil dikirim! Nomor: TKT-2026-XXXX"
  - Update status → "Status berhasil diubah"
  - Kirim pesan chat → tidak perlu toast (sudah ada di UI)
  - Error apapun → toast merah dengan pesan yang jelas
- [ ] Gunakan shadcn/ui `useToast` + `<Toaster>` di root layout

#### Responsive Design Audit

- [ ] Test semua halaman di:
  - Mobile 375px (iPhone SE)
  - Tablet 768px
  - Desktop 1280px
- [ ] Fix: tabel yang overflow horizontal (gunakan `overflow-x-auto` wrapper)
- [ ] Fix: sidebar collapse di mobile (hamburger menu)
- [ ] Fix: split-view chat yang stack di mobile

#### Keamanan — Rate Limiting di API Routes

- [ ] Implementasi IP-based rate limit untuk POST /api/tickets:
  ```typescript
  // Simpan di Supabase atau in-memory (simple)
  // 2 request per menit per IP
  import { headers } from 'next/headers'

  const ipCounts = new Map<string, { count: number, resetAt: number }>()

  export function checkIpRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = ipCounts.get(ip)
    if (!record || now > record.resetAt) {
      ipCounts.set(ip, { count: 1, resetAt: now + 60000 })
      return true
    }
    if (record.count >= 2) return false
    record.count++
    return true
  }
  ```

#### Keamanan — Validasi Server-side

- [ ] Audit semua API Routes — pastikan setiap route:
  - `[ ]` Cek autentikasi dengan `requireAuth()` atau `requireRole()`
  - `[ ]` Validasi input dengan Zod schema sebelum operasi DB
  - `[ ]` Tidak pernah trust data dari client tanpa validasi
  - `[ ]` Tidak expose `SUPABASE_SERVICE_ROLE_KEY` di response

#### Keamanan — File Upload

- [ ] Verifikasi upload handler:
  - `[ ]` Validasi mime type (bukan hanya ekstensi)
  - `[ ]` Validasi ukuran maksimal 2MB
  - `[ ]` Nama file di-randomize dengan UUID
  - `[ ]` Path file: `attachments/{ticketId}/{uuid}.{ext}`

#### Performance — Caching

- [ ] Tambah `revalidate` ke route analytics:
  ```typescript
  export const revalidate = 300  // cache 5 menit
  ```
- [ ] Tambah `revalidate` ke route FAQ list:
  ```typescript
  export const revalidate = 3600  // cache 1 jam
  ```

#### Performance — Database Indexes

- [ ] Tambah ke `supabase/migrations/00008_indexes.sql`:
  ```sql
  CREATE INDEX idx_tickets_reporter_id ON public.tickets(reporter_id);
  CREATE INDEX idx_tickets_status ON public.tickets(status);
  CREATE INDEX idx_tickets_priority ON public.tickets(priority);
  CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);
  CREATE INDEX idx_messages_ticket_id ON public.messages(ticket_id);
  CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
  CREATE INDEX idx_ticket_rate_limits_user_date ON public.ticket_rate_limits(user_id, date);
  ```
- [ ] Push migration: `supabase db push`

#### SEO & Meta Tags

- [ ] Update `app/layout.tsx` dengan metadata:
  ```typescript
  export const metadata: Metadata = {
    title: 'UNSAP Helpdesk — Smart Campus',
    description: 'Platform pelaporan keluhan mahasiswa Universitas Sebelas April',
  }
  ```

#### Unsubscribe Realtime saat Navigasi

- [ ] Audit semua hook yang subscribe Realtime (useChat, useNotifications, useAdminTickets)
- [ ] Pastikan semua punya cleanup di `useEffect` return:
  ```typescript
  return () => { supabase.removeChannel(channel) }
  ```

---

### B24 — Testing, Migrasi Data & Deploy

**Estimasi:** 6 jam  
**Prasyarat:** B23 selesai  
**Output:** Sistem live di production

#### Testing Manual — Checklist Acceptance Criteria

Jalankan semua scenario dari PRD Section 17:

**Auth:**
- [ ] Register mahasiswa baru → redirect ke dashboard mahasiswa
- [ ] Login admin → redirect ke dashboard admin
- [ ] Akses `/admin` tanpa login → redirect ke `/login`
- [ ] Akses `/mahasiswa` tanpa login → redirect ke `/login`
- [ ] Refresh halaman → session tetap ada

**Tiket:**
- [ ] Submit tiket dengan lampiran → cek file tersimpan di Supabase Storage
- [ ] Submit tiket anonim → cek kode anonim muncul, bukan nama asli
- [ ] Login sebagai master_admin → cek identitas asli tiket anonim terlihat
- [ ] Submit tiket ke-4 di hari sama → cek error rate limit muncul
- [ ] Upload file > 2MB → cek error muncul di client
- [ ] Cek nomor tiket format `TKT-2026-XXXX`

**ML:**
- [ ] Submit tiket biasa → tunggu 5–10 detik → cek priority ter-update
- [ ] Submit tiket dengan kata "KRS" → cek priority = urgent dan `priority_overridden = true`
- [ ] Matikan ML Service → submit tiket → cek tiket masuk dengan priority normal (tidak error)
- [ ] Ketik di form → cek FAQ suggestion muncul

**Realtime:**
- [ ] Buka dua browser (mahasiswa + admin) → kirim pesan → muncul di keduanya
- [ ] Admin submit notifikasi tiket baru → notif muncul tanpa refresh

**Analytics:**
- [ ] Dashboard admin menampilkan KPI yang akurat
- [ ] Chart sentimen hanya terlihat oleh master_admin

#### Migrasi Data dari Sistem v1

- [ ] Export data dari sistem lama (jika ada):
  ```bash
  pg_dump -h [OLD_HOST] -U postgres helpdesk_db \
    --table=users --table=tickets --table=chat_messages \
    --table=faqs --table=ml_training_data \
    -f old_data_export.sql
  ```
- [ ] Buat `scripts/migrate.py` — transformasi field:
  - `users.id` → `profiles.id` (UUID harus sama)
  - `users.name` → `profiles.full_name`
  - `tickets.message` → `tickets.description`
  - `chat_messages` → `messages`
- [ ] Test migrasi ke database staging dulu
- [ ] Validasi: `SELECT COUNT(*) FROM tickets` harus sama di source dan target

#### Setup Vercel

- [ ] Login ke vercel.com → Import project dari GitHub
- [ ] Set environment variables di Vercel Dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ML_SERVICE_URL`
  - `ML_SERVICE_API_KEY`
- [ ] Set root directory ke `/` (bukan `frontend/`)
- [ ] Deploy → catat production URL

#### Update Supabase Auth Settings

- [ ] Di Supabase Dashboard → Auth → URL Configuration:
  - Site URL: `https://[vercel-url]`
  - Redirect URLs: tambah `https://[vercel-url]/auth/callback`
- [ ] Enable "Confirm email" untuk production
- [ ] Enable "Secure email change"

#### Update CI/CD Workflows

- [ ] Update `.github/workflows/deploy-nextjs.yml`:
  ```yaml
  - name: Deploy to Vercel
    uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
      vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      vercel-args: '--prod'
  ```
- [ ] Tambah secrets di GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

- [ ] Update `.github/workflows/deploy-ml.yml`:
  ```yaml
  - name: Deploy to Railway
    run: railway up --detach
    env:
      RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  ```
- [ ] Tambah secret di GitHub: `RAILWAY_TOKEN`

#### Final Deployment Check

- [ ] Buka production URL → halaman landing muncul
- [ ] Register akun mahasiswa baru di production
- [ ] Submit tiket test → cek ML classification berjalan
- [ ] Login sebagai admin → cek dashboard
- [ ] Cek semua chart analytics terisi
- [ ] Cek Supabase Realtime berfungsi di production (bukan hanya localhost)

#### Update README

- [ ] Update `README.md` dengan:
  - Deskripsi sistem
  - Tech stack
  - Link production: `https://[vercel-url]`
  - Panduan setup lokal (< 10 langkah)
  - Link ke `PRD.md` dan `PLAN.md`
  - Akun demo (jika ada)
  - Screenshot dashboard (dari assets/)

---

## Quick Reference

### Urutan Pengerjaan Minimum (Solo Developer)

```
B01 → B02 → B03 → B04 → B05 → B06 → B07
 ↓
B08 (paralel boleh setelah B01)
 ↓
B09 → B10 → B11 → B12 → B13 → B14
 ↓
B15 → B16 → B17
 ↓
B18 → B19 → B20
 ↓
B21 → B22
 ↓
B23 → B24
```

### Urutan Pengerjaan (2 Developer)

```
Dev A: B01 → B02 → B03 → B06 → B07 → B09 → B12 → B18 → B20
Dev B: B04 → B05 → B08 → B10 → B11 → B13 → B14 → B19

Setelah selesai:
Dev A: B15 → B16 → B17 → B22
Dev B: B21 → B23

Bersama: B24
```

### Environment Variables Checklist

| Variable | Digunakan di | Darimana |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js (client + server) | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js (client + server) | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Next.js API Routes only | Supabase Dashboard |
| `ML_SERVICE_URL` | Next.js API Routes + Edge Function | Railway Dashboard |
| `ML_SERVICE_API_KEY` | Next.js API Routes + Edge Function | Buat sendiri (random string) |

### Commands Penting

```bash
# Development
npm run dev                          # Next.js dev server
supabase start                       # Supabase local (opsional)
cd ml-service && uvicorn main:app --reload --port 5000  # ML Service

# Database
supabase db push                     # Push semua migrasi ke Supabase
supabase gen types typescript --linked > types/database.ts  # Regenerate types

# ML Service
python train.py                      # Training ulang model
python sync_faqs.py                  # Sync FAQ dari DB ke ML

# Edge Functions
supabase functions deploy process-ticket-ml  # Deploy edge function
supabase functions serve process-ticket-ml   # Test lokal

# Deploy
railway up --detach                  # Deploy ML ke Railway
vercel --prod                        # Deploy Next.js ke Vercel (manual)
```

---

*Dokumen ini adalah living document. Update setiap kali ada perubahan scope atau task baru.*  
*Versi: 1.0 — Juni 2026*

# Smart Campus Helpdesk UNSAP — Improvement Recommendations

> Analisis dan rekomendasi improvement untuk Smart Campus Helpdesk UNSAP v2.0
> Berdasarkan codebase audit per 27 Juni 2026.

---

## Daftar Isi

- [Quick Wins (Low Effort, High Impact)](#quick-wins)
- [Feature Improvements (Medium Effort)](#feature-improvements)
- [Game Changers (High Effort, High Value)](#game-changers)
- [Temuan Teknis & Technical Debt](#temuan-teknis)
- [Prioritas Implementasi](#prioritas-implementasi)

---

## Quick Wins

Improvement dengan effort rendah tapi dampak besar untuk user experience.

### 1. Public FAQ Page

- **Deskripsi:** Halaman publik (tanpa login) untuk browsing dan mencari FAQ.
- **Benefit:** Mengurangi volume ticket masuk karena mahasiswa bisa self-service mencari jawaban.
- **Effort:** Rendah — data FAQ sudah ada, tinggal buat halaman landing `/faq` dengan search.
- **File terkait:** `app/`, `components/`, API `/api/ml/suggest` sudah ada.

### 2. Typing Indicator di Chat

- **Deskripsi:** Tampilkan indikator "sedang mengetik..." saat user/admin mengetik pesan.
- **Benefit:** UX chat jadi lebih interaktif dan real-time.
- **Effort:** Rendah — bisa pakai Supabase Realtime broadcast channel terpisah (`typing:{ticket_id}`).
- **File terkait:** Chat components, Supabase Realtime channel.

### 3. File Preview di Chat

- **Deskripsi:** Preview gambar dan PDF langsung di chat room tanpa harus download.
- **Benefit:** Mempercepat review attachment oleh admin.
- **Effort:** Rendah — tinggal render URL dari Supabase Storage di komponen chat.
- **Catatan:** Attachment dari `react-dropzone` sudah ada, tinggal preview side.

### 4. Push Notifications (Browser)

- **Deskripsi:** Notifikasi via Web Push API meskipun user tidak di tab aktif.
- **Benefit:** User tidak ketinggalan update ticket.
- **Effort:** Rendah-Sedang — perlu service worker + VAPID keys.
- **Integrasi:** Bisa pakai Supabase Realtime + Service Worker.

### 5. Progressive Web App (PWA)

- **Deskripsi:** Tambahkan manifest.json dan service worker agar bisa di-install sebagai aplikasi mobile.
- **Benefit:** User bisa akses helpdesk seperti native app tanpa install dari Play Store.
- **Effort:** Rendah — Next.js punya dukungan PWA via `next-pwa` atau `@serwist/next`.
- **Catatan:** Sangat cocok untuk mahasiswa yang sering akses dari HP.

---

## Feature Improvements

Fitur tambahan dengan effort medium yang meningkatkan fungsionalitas sistem.

### 6. Email Notifications (SMTP)

- **Deskripsi:** Kirim email notifikasi untuk:
  - Ticket status change
  - Ticket assignment
  - New message (ketika user offline)
  - SLA deadline approaching
- **Benefit:** Coverage notifikasi lebih luas — user tetap update meski tidak buka app.
- **Effort:** Sedang — perlu setup SMTP di Supabase, buat email template, integration dengan trigger.
- **Status:** SMTP Supabase belum dikonfigurasi (confirm email & password reset juga tidak akan work).
- **File terkait:** Supabase Auth settings, Edge Functions, notification hooks.

### 7. Bulk Operations Admin

- **Deskripsi:** Admin bisa melakukan operasi massal pada ticket terpilih:
  - Bulk assign ke unit/admin
  - Bulk change status
  - Bulk change priority
  - Bulk export selected tickets
- **Benefit:** Efisiensi admin ketika menangani banyak ticket sekaligus.
- **Effort:** Sedang — perlu update komponen table (TanStack Table) dengan checkbox selection + action bar.
- **File terkait:** `app/admin/tiket/`, komponen `DataTable`.

### 8. Auto-Response Templates

- **Deskripsi:** Admin bisa membuat dan menggunakan template balasan untuk pertanyaan umum.
- **Benefit:** Response time lebih cepat, konsistensi jawaban terjaga.
- **Effort:** Sedang — perlu:
  - Tabel `response_templates` di database
  - CRUD management di admin panel
  - Picker di chat editor
- **Contoh template:** Info UKT, prosedur KRS, jadwal akademik, dll.

### 9. Escalation Matrix

- **Deskripsi:** Jika ticket tidak direspon dalam timeline SLA, auto-escalate ke admin level lebih tinggi (atau master_admin).
- **Benefit:** Mencegah ticket stagnant melewati SLA.
- **Effort:** Sedang — perlu:
  - Cron job atau Supabase pg_cron untuk check SLA periodically
  - Logika escalation bertingkat (admin -> master_admin)
  - Notifikasi auto-escalation
- **File terkait:** Edge Functions, Supabase scheduled functions.

### 10. Audit Log / Riwayat Ticket

- **Deskripsi:** Track semua perubahan pada ticket:
  - Status change (lama -> baru, timestamp, siapa)
  - Priority change
  - Assignment change
  - Category change
- **Benefit:** Akuntabilitas penuh, traceability untuk investigasi.
- **Effort:** Sedang — perlu:
  - Tabel `ticket_audit_logs` baru
  - Trigger/Edge Function untuk insert log
  - UI untuk melihat history di ticket detail
- **Catatan:** Ini penting untuk lingkungan kampus yang butuh transparansi.

### 11. Ticket Templates by Category

- **Deskripsi:** Form submission dengan field yang berbeda-beda tergantung kategori:
  - **Akademik:** Nama matakuliah, dosen, jadwal
  - **Keuangan:** Jenis pembayaran, nominal, bukti bayar
  - **Fasilitas:** Lokasi, jenis kerusakan, foto
  - **Keamanan:** Lokasi, waktu kejadian, saksi
- **Benefit:** Data lebih terstruktur, admin langsung dapat informasi yang relevan.
- **Effort:** Sedang — perlu form builder/dynamic form components.
- **File terkait:** `app/mahasiswa/submit/`, komponen form.

### 12. Dashboard per Unit Kerja

- **Deskripsi:** Setiap unit kerja (admin dari department tertentu) melihat dashboard khusus untuk unit mereka — bukan semua ticket.
- **Benefit:** Admin unit fokus pada KPI dan workload unit mereka sendiri.
- **Effort:** Sedang — query filter by department/unit, reuse existing chart components.
- **File terkait:** `app/admin/`, analytics API, RPC functions.

---

## Game Changers

Fitur besar yang akan mentransformasi cara kampus menggunakan sistem.

### 13. WhatsApp Integration

- **Deskripsi:** Integrasi WhatsApp Business API (atau gateway seperti Twilio) untuk:
  - Notifikasi status ticket via WA
  - Submit ticket via chat WA
  - Cek status ticket via keyword
  - Balas admin via WA
- **Benefit:** **Sangat cocok untuk kampus di Indonesia.** Hampir semua mahasiswa punya WA, tidak perlu install app tambahan.
- **Effort:** Tinggi — perlu:
  - Nomor WhatsApp Business
  - Gateway (Twilio, WA Business API, atau self-hosted)
  - Edge Function untuk handle incoming messages
  - Sistem matching user berdasarkan nomor HP
- **Arsitektur saran:**
  ```
  WA -> Webhook -> Supabase Edge Function -> Parse message -> Cari user by phone -> Create/get ticket -> Response WA
  ```

### 14. Campus Announcement System

- **Deskripsi:** Admin/Master Admin bisa mengirim pengumuman (broadcast) ke:
  - Semua mahasiswa
  - Per jurusan/prodi
  - Per angkatan
- **Benefit:** Sistem helpdesk jadi pusat komunikasi kampus dua arah.
- **Effort:** Sedang-Tinggi — perlu:
  - Tabel `announcements` + `announcement_recipients`
  - Halaman compose announcement
  - Push notification + email blast
  - Mark as read tracking

### 15. SSO / OAuth Integration

- **Deskripsi:** Login dengan Google, atau SSO kampus (jika ada sistem SIAKAD).
- **Benefit:** Mengurangi friction registrasi dan login. No need to remember password.
- **Effort:** Sedang — Supabase Auth sudah support OAuth providers, tinggal config.
- **Catatan:** Supabase sudah punya built-in OAuth — paling mudah integrasi Google.

### 16. Help Center / Knowledge Base

- **Deskripsi:** Halaman self-service dengan artikel panduan yang bisa dicari:
  - Panduan KRS online
  - Cara bayar UKT
  - Prosedur cuti akademik
  - FAQ interaktif
- **Benefit:** Mengurangi ticket volume hingga 30-40% (industry standard untuk knowledge base).
- **Effort:** Tinggi — perlu:
  - Tabel `articles` dengan rich content
  - Editor WYSIWYG untuk admin
  - Search + category filtering
  - View counter + helpful rating
  - Integrasi dengan ML FAQ suggestion

### 17. Multi-Language Support (i18n)

- **Deskripsi:** Dukungan bahasa Indonesia + Inggris, mudah ditambah bahasa lain.
- **Benefit:** Aksesibilitas untuk mahasiswa asing atau program internasional.
- **Effort:** Tinggi — perlu setup `next-intl` atau `i18next`, translasi semua string.
- **Prioritas:** Rendah, kecuali ada kebutuhan khusus.

### 18. Testing Infrastructure

- **Deskripsi:** Implementasi unit test + integration test + E2E test.
- **Komponen:**
  - **Unit Test:** Vitest untuk utility functions, hooks, komponen
  - **API Test:** Supertest + Vitest untuk API routes
  - **E2E:** Playwright untuk flow utama (login -> submit ticket -> chat)
- **Benefit:** Mencegah regression, confidence tinggi untuk deploy.
- **Effort:** Tinggi — perlu setup testing framework, mock Supabase, tulis test cases.
- **Status:** Disebut di PLAN.md (Batch 24) tapi belum diimplementasi.

### 19. CI/CD Pipeline

- **Deskripsi:** GitHub Actions untuk:
  - Lint + typecheck otomatis
  - Jalankan test suite
  - Deploy ke Vercel staging/production
  - Deploy ML Service ke Railway
- **Benefit:** Otomatisasi, quality gate, deployment tanpa manual.
- **Effort:** Sedang — GitHub Actions workflow sudah ada sebagai skeleton, tinggal configuration.
- **File terkait:** `.github/workflows/`

---

## Temuan Teknis

### ❗ Dev Credentials di Codebase

| File | Issue |
|------|-------|
| `.env.local` | `ML_SERVICE_API_KEY=dev-key-123`, `ML_SERVICE_URL=http://127.0.0.1:8000` |
| Supabase Edge Function | Mungkin juga pakai dev values |

**Rekomendasi:**
- Gunakan environment-specific `.env` files (`.env.production`, `.env.staging`)
- Jangan commit production secrets
- Gunakan Vercel Environment Variables atau GitHub Secrets untuk production

### ❗ Tidak Ada Error Tracking / Monitoring

- Tidak ada Sentry, Datadog, atau similar
- Jika terjadi error di production, sulit di-debug
- **Rekomendasi:** Integrasi Sentry (gratis untuk hobby tier) untuk Next.js + React

### ❗ SMTP Email Belum Aktif

- Confirm email dan password reset tidak akan berfungsi di production
- **Rekomendasi:** Setup SMTP di Supabase dashboard (sendgrid, resend, atau mailgun)

### ❗ Tidak Ada Data Migration dari v1

- Migrasi dari sistem lama (Laravel) belum ada
- Data historis ticket, user, dll tidak terpindahkan
- **Rekomendasi:** Buat migration script untuk import data dari v1

---

## Prioritas Implementasi

### Fase 1: Hardening Production (Urgent)
1. Setup SMTP / Email
2. Ganti dev credentials dengan production values
3. Setup error tracking (Sentry)
4. Setup CI/CD pipeline

### Fase 2: UX Quick Wins (Minggu 1-2)
5. Public FAQ page
6. Typing indicator chat
7. File preview chat
8. PWA support

### Fase 3: Feature Enhancement (Minggu 3-6)
9. Email notifications
10. Audit log
11. Dashboard per unit kerja
12. Auto-response templates
13. Bulk operations

### Fase 4: Transformational (Minggu 7-12)
14. WhatsApp integration
15. Knowledge base / Help center
16. Campus announcement system
17. Testing infrastructure

### Fase 5: Nice to Have
18. SSO / OAuth
19. Escalation matrix
20. Ticket templates by category
21. Multi-language support

---

> **Catatan:** Urutan prioritas bisa disesuaikan dengan kebutuhan aktual kampus.
> Untuk diskusi lebih lanjut atau implementasi, silakan buka issue atau hubungi developer.

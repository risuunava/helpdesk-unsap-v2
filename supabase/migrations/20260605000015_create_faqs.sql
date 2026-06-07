-- Migration: Create FAQs table and insert seed data
-- Created at: 2026-06-05

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faqs_select_all" ON public.faqs;
CREATE POLICY "faqs_select_all" ON public.faqs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "faqs_all_admin" ON public.faqs;
CREATE POLICY "faqs_all_admin" ON public.faqs
    FOR ALL USING (public.get_my_role() IN ('admin', 'master_admin'));

-- Trigger updated_at
DROP TRIGGER IF EXISTS handle_faqs_updated_at ON public.faqs;
CREATE TRIGGER handle_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Insert Seed Data
INSERT INTO public.faqs (category, question, answer) VALUES
('akademik', 'Bagaimana cara mengajukan cuti akademik?', 'Untuk mengajukan cuti akademik, Anda harus mengisi form permohonan cuti yang dapat diunduh di portal akademik. Kemudian, minta persetujuan dari Dosen Wali dan serahkan ke BAAK selambat-lambatnya minggu ke-2 awal semester.'),
('akademik', 'Kapan batas waktu pengisian KRS?', 'Pengisian KRS biasanya ditutup 2 minggu sebelum perkuliahan dimulai. Pastikan Anda selalu mengecek kalender akademik terbaru di portal mahasiswa.'),
('keuangan', 'Bagaimana cara membayar UKT jika telat?', 'Jika Anda telat membayar UKT sesuai jadwal, Anda akan dikenakan denda keterlambatan. Silakan hubungi bagian keuangan (Biro Keuangan) untuk mendapatkan rincian denda dan cara pembayarannya. Pembayaran tetap dilakukan melalui Virtual Account.'),
('keuangan', 'Saya sudah transfer biaya kuliah tapi statusnya masih belum lunas', 'Proses verifikasi bank bisa memakan waktu hingga 1x24 jam kerja. Jika lebih dari itu status belum berubah, buat tiket kategori Keuangan dan lampirkan bukti transfer yang sah.'),
('fasilitas', 'Bagaimana cara meminjam proyektor untuk kegiatan kelas?', 'Peminjaman proyektor dapat dilakukan di bagian Perlengkapan kampus dengan menyerahkan Kartu Tanda Mahasiswa (KTM) yang masih aktif. Peminjaman maksimal dilakukan 1 jam sebelum kelas dimulai.'),
('keamanan', 'Saya kehilangan barang di area kampus, apa yang harus saya lakukan?', 'Segera laporkan kehilangan Anda ke Pos Satpam terdekat. Sebutkan secara detail ciri-ciri barang yang hilang, waktu, dan lokasi perkiraan barang tersebut tertinggal.');

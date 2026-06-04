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

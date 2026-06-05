-- Seeder untuk akun Admin & Master Admin
-- PERHATIAN: Pembuatan User (Authentication) di Supabase harus dilakukan secara manual 
-- melalui Supabase Dashboard -> Authentication -> Users (atau via API Supabase Admin).
-- Anda tidak bisa menyisipkan baris langsung ke schema `auth.users` via SQL biasa 
-- karena fungsi hash password dan identitas lainnya ada di level internal GoTrue.

-- SETELAH Anda membuat user melalui Dashboard, dapatkan UUID mereka, lalu jalankan query ini:

/*
-- Update user menjadi Admin (Departemen Akademik misalnya)
UPDATE public.profiles 
SET role = 'admin', department = 'Akademik'
WHERE id = '[UUID_DARI_DASHBOARD_UNTUK_ADMIN]';

-- Update user menjadi Master Admin
UPDATE public.profiles 
SET role = 'master_admin', department = 'Pusat Komputer'
WHERE id = '[UUID_DARI_DASHBOARD_UNTUK_MASTER_ADMIN]';
*/

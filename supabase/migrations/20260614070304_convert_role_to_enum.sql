-- DROP POLICIES THAT DEPEND ON ROLE
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "tickets_select" ON public.tickets;
DROP POLICY IF EXISTS "tickets_update" ON public.tickets;
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "faqs_manage" ON public.faqs;
DROP POLICY IF EXISTS "ml_data_master" ON public.ml_training_data;
DROP POLICY IF EXISTS "Attachments Authenticated Delete" ON storage.objects;

-- DROP TABLE CHECK CONSTRAINTS
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_category_check;
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_priority_check;

-- 1. Buat tipe data ENUM untuk role
CREATE TYPE user_role AS ENUM ('mahasiswa', 'admin', 'master_admin');

-- 2. Ubah kolom role di tabel profiles menjadi tipe ENUM
ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'mahasiswa'::user_role;

-- 3. (Opsional) Mengubah kolom di tabel tickets menjadi dropdown
CREATE TYPE ticket_category AS ENUM ('akademik','keuangan','fasilitas','keamanan','lainnya');
CREATE TYPE ticket_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE ticket_priority AS ENUM ('low','normal','urgent');

ALTER TABLE public.tickets
  ALTER COLUMN category TYPE ticket_category USING category::ticket_category,
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE ticket_status USING status::ticket_status,
  ALTER COLUMN status SET DEFAULT 'open'::ticket_status,
  ALTER COLUMN priority DROP DEFAULT,
  ALTER COLUMN priority TYPE ticket_priority USING priority::ticket_priority,
  ALTER COLUMN priority SET DEFAULT 'normal'::ticket_priority;

-- RECREATE POLICIES WITH ENUM CASTING
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()
            AND role IN ('admin'::user_role,'master_admin'::user_role)));

CREATE POLICY "tickets_select" ON public.tickets FOR SELECT USING (
  auth.uid() = reporter_id
  OR auth.uid() = assigned_to
  OR EXISTS (SELECT 1 FROM public.profiles
             WHERE id = auth.uid() AND role IN ('admin'::user_role,'master_admin'::user_role))
);

CREATE POLICY "tickets_update" ON public.tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin'::user_role,'master_admin'::user_role))
);

CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (
      t.reporter_id = auth.uid()
      OR t.assigned_to = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles
                 WHERE id = auth.uid() AND role IN ('admin'::user_role,'master_admin'::user_role))
    )
  )
);

CREATE POLICY "faqs_manage" ON public.faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'master_admin'::user_role)
);

CREATE POLICY "ml_data_master" ON public.ml_training_data FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'master_admin'::user_role)
);

CREATE POLICY "Attachments Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (
    (select auth.uid())::text = owner::text OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin'::user_role, 'master_admin'::user_role)
    )
  )
);

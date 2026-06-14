-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy for Avatars (Public Read)
CREATE POLICY "Avatar Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy for Avatars (Authenticated Upload)
-- Format: {userId}-{random}.{ext}
CREATE POLICY "Avatar Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE (select auth.uid())::text || '-%'
);

-- Policy for Avatars (Authenticated Update)
CREATE POLICY "Avatar Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE (select auth.uid())::text || '-%'
);

-- Policy for Avatars (Authenticated Delete)
CREATE POLICY "Avatar Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE (select auth.uid())::text || '-%'
);

-- Policy for Attachments (Public Read - agar admin & user bisa lihat)
CREATE POLICY "Attachments Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'attachments' );

-- Policy for Attachments (Authenticated Upload)
-- Format: {ticketId}/{fileName}
CREATE POLICY "Attachments Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
);

-- Policy for Attachments (Authenticated Delete - owner/admin)
CREATE POLICY "Attachments Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (
    (select auth.uid())::text = owner::text OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
    )
  )
);

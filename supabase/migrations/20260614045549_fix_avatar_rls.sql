-- Drop old policies that caused UUID split errors
DROP POLICY IF EXISTS "Avatar Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Authenticated Delete" ON storage.objects;

-- Create updated policies supporting UUIDs
CREATE POLICY "Avatar Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE (select auth.uid())::text || '-%'
);

CREATE POLICY "Avatar Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE (select auth.uid())::text || '-%'
);

CREATE POLICY "Avatar Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE (select auth.uid())::text || '-%'
);

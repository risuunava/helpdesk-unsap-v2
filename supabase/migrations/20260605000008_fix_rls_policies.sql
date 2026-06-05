-- Fix Storage RLS Policy (owner vs owner_id issue in newer Supabase versions)
DROP POLICY IF EXISTS "Users can upload their own attachments" ON storage.objects;
CREATE POLICY "Users can upload their own attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK ( bucket_id = 'attachments' AND (auth.uid() = owner OR auth.uid()::text = owner_id) );

-- Fix ticket_rate_limits RLS Policy (ensure WITH CHECK is explicitly set for UPSERT)
DROP POLICY IF EXISTS "rate_limit_own" ON public.ticket_rate_limits;
CREATE POLICY "rate_limit_own" ON public.ticket_rate_limits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Ensure tickets_insert policy is correct
DROP POLICY IF EXISTS "tickets_insert" ON public.tickets;
CREATE POLICY "tickets_insert" ON public.tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

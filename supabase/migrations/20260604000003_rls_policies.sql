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

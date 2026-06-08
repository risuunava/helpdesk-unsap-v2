-- Migration: Add performance indexes
-- Generated for Batch 23: Polish, Optimasi & Keamanan

CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id ON public.tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON public.messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_rate_limits_user_date ON public.ticket_rate_limits(user_id, date);

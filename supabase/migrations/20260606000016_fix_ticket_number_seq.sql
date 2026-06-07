-- Fix ticket number generation to prevent duplicate key violations
-- We use a sequence instead of COUNT(*) to ensure uniqueness even with deletions or concurrent inserts

CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq;

-- Sync sequence with existing data if any
DO $$
DECLARE
    max_seq INTEGER;
BEGIN
    -- Extract the numeric part from existing ticket_numbers (e.g., TKT-2026-0005 -> 5)
    SELECT MAX(NULLIF(regexp_replace(ticket_number, '^TKT-\d+-', ''), '')::INTEGER)
    INTO max_seq
    FROM public.tickets;
    
    IF max_seq IS NOT NULL THEN
        PERFORM setval('public.ticket_number_seq', max_seq);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  seq_num   BIGINT;
BEGIN
  -- Use sequence instead of COUNT(*)
  seq_num := nextval('public.ticket_number_seq');
  NEW.ticket_number := 'TKT-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

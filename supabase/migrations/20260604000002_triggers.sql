-- Auto-generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  seq_num   INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num FROM public.tickets
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.ticket_number := 'TKT-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Auto-set SLA deadline
CREATE OR REPLACE FUNCTION set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.priority
    WHEN 'urgent' THEN NEW.sla_deadline := NOW() + INTERVAL '4 hours';
    WHEN 'normal' THEN NEW.sla_deadline := NOW() + INTERVAL '24 hours';
    WHEN 'low'    THEN NEW.sla_deadline := NOW() + INTERVAL '72 hours';
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_sla
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION set_sla_deadline();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile saat user register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, nim)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mahasiswa'),
    NEW.raw_user_meta_data->>'nim'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

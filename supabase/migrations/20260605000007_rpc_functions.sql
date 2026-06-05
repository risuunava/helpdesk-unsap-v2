CREATE OR REPLACE FUNCTION increment_rate_limit_count(p_user_id UUID, p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO public.ticket_rate_limits (user_id, date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = ticket_rate_limits.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

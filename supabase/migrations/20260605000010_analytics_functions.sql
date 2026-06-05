-- Analytics RPC Functions

-- 1. KPI Summary
CREATE OR REPLACE FUNCTION get_kpi_summary()
RETURNS json AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'total',       COUNT(*),
    'open',        COUNT(*) FILTER (WHERE status = 'open'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'resolved',    COUNT(*) FILTER (WHERE status IN ('resolved','closed')),
    'overdue',     COUNT(*) FILTER (WHERE sla_deadline < NOW() AND status NOT IN ('resolved','closed')),
    'avg_resolve_hours', COALESCE(
      ROUND(EXTRACT(EPOCH FROM AVG(resolved_at - created_at) FILTER (WHERE resolved_at IS NOT NULL)) / 3600, 1),
      0
    )
  ) INTO result FROM public.tickets;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Weekly Trend (last 8 weeks)
CREATE OR REPLACE FUNCTION get_weekly_trend()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
    FROM (
      SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'DD Mon') as week,
             COUNT(*) as count
      FROM public.tickets
      WHERE created_at >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY DATE_TRUNC('week', created_at)
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Tickets by Category
CREATE OR REPLACE FUNCTION get_tickets_by_category()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
    FROM (
      SELECT category, COUNT(*) as count
      FROM public.tickets
      GROUP BY category
      ORDER BY count DESC
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Tickets by Priority
CREATE OR REPLACE FUNCTION get_tickets_by_priority()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
    FROM (
      SELECT priority, COUNT(*) as count
      FROM public.tickets
      GROUP BY priority
      ORDER BY count DESC
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SLA Compliance (percentage of resolved tickets completed within SLA deadline)
CREATE OR REPLACE FUNCTION get_sla_compliance()
RETURNS json AS $$
DECLARE
  total_resolved bigint;
  within_sla bigint;
BEGIN
  SELECT COUNT(*) INTO total_resolved
  FROM public.tickets
  WHERE status IN ('resolved','closed');

  SELECT COUNT(*) INTO within_sla
  FROM public.tickets
  WHERE status IN ('resolved','closed')
    AND (sla_deadline IS NULL OR resolved_at <= sla_deadline);

  RETURN json_build_object(
    'total_resolved', total_resolved,
    'within_sla', within_sla,
    'compliance', CASE WHEN total_resolved > 0
      THEN ROUND((within_sla::numeric / total_resolved) * 100, 1)
      ELSE 100
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

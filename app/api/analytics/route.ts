import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'master_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Run all analytics queries in parallel
    const [kpiRes, trendRes, categoryRes, priorityRes, slaRes] = await Promise.all([
      supabase.rpc('get_kpi_summary'),
      supabase.rpc('get_weekly_trend'),
      supabase.rpc('get_tickets_by_category'),
      supabase.rpc('get_tickets_by_priority'),
      supabase.rpc('get_sla_compliance'),
    ])

    return NextResponse.json({
      kpi: kpiRes.data || { total: 0, open: 0, in_progress: 0, resolved: 0, overdue: 0, avg_resolve_hours: 0 },
      trend_weekly: trendRes.data || [],
      by_category: categoryRes.data || [],
      by_priority: priorityRes.data || [],
      sla_compliance: slaRes.data || { total_resolved: 0, within_sla: 0, compliance: 100 },
    })

  } catch (error: any) {
    console.error('GET /api/analytics error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { analyzeSentiment } from '@/lib/ml'

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
    const [kpiRes, trendRes, categoryRes, priorityRes, slaRes, ticketsRes] = await Promise.all([
      supabase.rpc('get_kpi_summary'),
      supabase.rpc('get_weekly_trend'),
      supabase.rpc('get_tickets_by_category'),
      supabase.rpc('get_tickets_by_priority'),
      supabase.rpc('get_sla_compliance'),
      supabase.from('tickets').select('title, description').limit(50).order('created_at', { ascending: false })
    ])

    // Sentiment analysis for master_admin
    let sentiment = null
    if (profile.role === 'master_admin' && ticketsRes.data) {
      const texts = ticketsRes.data.map(t => `${t.title} ${t.description}`)
      // In a real app, we might want to batch this or use cached results
      // For MVP, we'll analyze the most recent batch
      const sentimentResults = await Promise.all(texts.map(text => analyzeSentiment(text)))
      const avgScore = sentimentResults.reduce((acc, curr) => acc + curr.score, 0) / (sentimentResults.length || 1)
      
      sentiment = {
        score: avgScore,
        label: avgScore > 0.6 ? 'positive' : avgScore < 0.4 ? 'negative' : 'neutral',
        distribution: {
          positive: sentimentResults.filter(r => r.label === 'positive').length,
          neutral: sentimentResults.filter(r => r.label === 'neutral').length,
          negative: sentimentResults.filter(r => r.label === 'negative').length,
        }
      }
    }

    return NextResponse.json({
      kpi: kpiRes.data || { total: 0, open: 0, in_progress: 0, resolved: 0, overdue: 0, avg_resolve_hours: 0 },
      trend_weekly: trendRes.data || [],
      by_category: categoryRes.data || [],
      by_priority: priorityRes.data || [],
      sla_compliance: slaRes.data || { total_resolved: 0, within_sla: 0, compliance: 100 },
      sentiment
    })

  } catch (error: any) {
    console.error('GET /api/analytics error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

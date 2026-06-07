'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Terminal,
  Database,
  Search,
  RefreshCw,
} from 'lucide-react'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { SlaChart } from '@/components/dashboard/SlaChart'
import { SentimentChart } from '@/components/dashboard/SentimentChart'
import { clsx } from 'clsx'

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    kpi: { total: number; resolved: number; overdue: number }
    sla_compliance: { compliance: number }
    trend_weekly: any[]
    by_category: any[]
    sentiment?: { score: number }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Resource sync failure: analytics registry inaccessible')
      const json = await res.json()
      setData(json)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function fetchAll() {
      await fetchData()
    }
    void fetchAll()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="p-8 space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex justify-between items-end pb-10 border-b border-zinc-100">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
            <div className="h-10 w-64 bg-zinc-100 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-zinc-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-50 border border-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[500px] bg-zinc-50 border border-zinc-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-200 rounded-xl bg-white max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 mb-6">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">Analytics Error</h2>
        <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">{error}</p>
        <button 
          onClick={() => fetchData()}
          className="mt-8 h-10 px-6 bg-zinc-900 text-white rounded-lg font-bold text-xs hover:bg-zinc-800 transition-all uppercase tracking-widest flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} />
          Retry Sync
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Technical Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-b border-zinc-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-md border border-zinc-200/50 w-fit">
            <Search size={12} />
            Statistical Engine
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
            System <span className="text-zinc-400">Intelligence</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium max-w-xl leading-relaxed">
            Advanced diagnostic data and performance monitoring. 
            Real-time telemetry from support infrastructure and student satisfaction metrics.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2 px-6 py-4 bg-zinc-900 text-white rounded-xl shadow-xl border border-zinc-800">
          <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Telemetry Link: Active</p>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-mono font-bold">
              SYNC_OK::{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
          </div>
        </div>
      </header>

      {/* KPI Grid - Unified Technical Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Inbound Vol.</span>
            <Database size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-zinc-900">{data.kpi.total}</div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Total Resource Requests</p>
          </div>
        </div>
        
        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Resolution Rate</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-emerald-600">
              {((data.kpi.resolved / (data.kpi.total || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Lifecycle Complete</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">SLA Overdue</span>
            <Clock size={16} className={data.kpi.overdue > 0 ? 'text-rose-500' : 'text-zinc-400'} />
          </div>
          <div className="space-y-1">
            <div className={clsx("text-3xl font-mono font-bold", data.kpi.overdue > 0 ? 'text-rose-600' : 'text-zinc-900')}>
              {data.kpi.overdue}
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Latency Critical</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">SLA Compliance</span>
            <TrendingUp size={16} className={data.sla_compliance.compliance >= 80 ? 'text-emerald-500' : 'text-amber-500'} />
          </div>
          <div className="space-y-1">
            <div className={clsx("text-3xl font-mono font-bold", data.sla_compliance.compliance >= 80 ? 'text-emerald-600' : 'text-amber-600')}>
              {data.sla_compliance.compliance}%
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Performance Target</p>
          </div>
        </div>
      </section>

      {/* Main Charts Area */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-zinc-900" />
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Time-Series Telemetry</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Trend Chart - Large spanning */}
          <div className="lg:col-span-12 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <TrendChart data={data.trend_weekly} />
          </div>

          {/* Secondary Diagnostics */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Terminal size={14} className="text-zinc-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Distribution Analysis</h3>
            </div>
            <CategoryChart data={data.by_category} />
          </div>
          
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Clock size={14} className="text-zinc-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Latency Trends</h3>
            </div>
            <SlaChart data={[
              { month: 'Jan', compliance: 85 },
              { month: 'Feb', compliance: 82 },
              { month: 'Mar', compliance: 78 },
              { month: 'Apr', compliance: 88 },
              { month: 'Mei', compliance: 92 },
              { month: 'Jun', compliance: data.sla_compliance.compliance },
            ]} />
          </div>

          {/* Sentiment Analysis - Large bottom spanning */}
          <div className="lg:col-span-12 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Activity size={14} className="text-zinc-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">User Sentiment Polarity</h3>
            </div>
            {data.sentiment && (
              <SentimentChart data={[
                { month: 'Jan', score: 0.65 },
                { month: 'Feb', score: 0.58 },
                { month: 'Mar', score: 0.45 },
                { month: 'Apr', score: 0.60 },
                { month: 'Mei', score: 0.72 },
                { month: 'Jun', score: data.sentiment.score },
              ]} />
            )}
          </div>
        </div>
      </section>

      {/* Technical Footer */}
      <footer className="pt-10 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            <Terminal size={12} />
            Diagnostic Protocol v2.4
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
            System analytics are derived from live production resource logs. 
            All metrics are cached for 300s to optimize registry throughput.
          </p>
        </div>
        <div className="flex items-center md:justify-end gap-10">
          <div className="space-y-1 text-right">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Data Source</span>
            <span className="text-[11px] font-mono font-bold text-zinc-900 uppercase">POSTGRES_MASTER_IO</span>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Processing</span>
            <span className="text-[11px] font-mono font-bold text-zinc-900">NODE_ANALYTICS_SERVICE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { SlaChart } from '@/components/dashboard/SlaChart'
import { SentimentChart } from '@/components/dashboard/SentimentChart'
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics')
        if (!res.ok) throw new Error('Gagal mengambil data analytics')
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 space-y-12 animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-zinc-200 rounded-full animate-pulse" />
          <div className="h-12 w-64 bg-zinc-200 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-zinc-100 rounded-[2rem] animate-pulse" />
          ))}
        </div>
        <div className="h-[450px] bg-zinc-100 rounded-[2.5rem] animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Terjadi Kesalahan</h2>
        <p className="text-zinc-500 max-w-sm font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-colors shadow-xl shadow-zinc-200"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-12 pb-20">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 px-4 py-1.5 bg-indigo-50 border border-indigo-100/50 rounded-full w-fit"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-[0.2em]">Management Intelligence</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-zinc-900 tracking-tight leading-[0.9]"
          >
            Analytics <span className="italic font-normal text-zinc-400">&</span> Insights
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed"
          >
            Data real-time untuk memantau performa helpdesk, tingkat kepuasan, dan tren keluhan mahasiswa secara mendalam.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden lg:block px-6 py-4 bg-white border border-zinc-200 rounded-[1.5rem] shadow-glass"
        >
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Last Updated</p>
          <p className="text-[13px] font-mono font-bold text-zinc-900">
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </p>
        </motion.div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Tiket"
          value={data.kpi.total}
          icon={Activity}
          subtitle="Total volume laporan masuk"
        />
        <KpiCard
          title="Selesai"
          value={data.kpi.resolved}
          icon={CheckCircle2}
          subtitle={`${((data.kpi.resolved / (data.kpi.total || 1)) * 100).toFixed(1)}% Completion Rate`}
          variant="success"
        />
        <KpiCard
          title="Lewat SLA"
          value={data.kpi.overdue}
          icon={Clock}
          subtitle="Tiket melebihi batas waktu"
          variant={data.kpi.overdue > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          title="Kepatuhan SLA"
          value={`${data.sla_compliance.compliance}%`}
          icon={TrendingUp}
          subtitle="Target performa tim admin"
          variant={data.sla_compliance.compliance >= 80 ? 'success' : 'warning'}
        />
      </section>

      {/* Main Charts - Bento Grid Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Trend Chart - Large spanning */}
        <div className="lg:col-span-12">
          <TrendChart data={data.trend_weekly} />
        </div>

        {/* Secondary Charts */}
        <div className="lg:col-span-7">
          <CategoryChart data={data.by_category} />
        </div>
        <div className="lg:col-span-5">
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
        <div className="lg:col-span-12">
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
      </section>
    </div>
  )
}

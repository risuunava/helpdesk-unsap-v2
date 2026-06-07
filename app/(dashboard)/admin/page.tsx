'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useAdminTickets } from '@/hooks/useAdminTickets'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { 
  Ticket, CheckCircle2, Clock, AlertTriangle, 
  Search, FilterX, Loader2, Inbox, ChevronLeft, ChevronRight,
  List as ListIcon, LayoutGrid, SlidersHorizontal
} from 'lucide-react'
import { clsx } from 'clsx'

export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const {
    tickets, loading, error, page, totalPages, totalCount,
    filters, sort, setPage, updateFilter, resetFilters, toggleSort
  } = useAdminTickets()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err)
      } finally {
        setLoadingAnalytics(false)
      }
    }
    fetchAnalytics()
  }, [])

  const navigateToDetail = (id: string) => {
    router.push(`/admin/tiket/${id}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight text-balance">Kelola Antrean Tiket</h1>
          <p className="text-sm font-medium text-zinc-500">Monitor dan selesaikan kendala mahasiswa secara tepat waktu.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={clsx(
              "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
              viewMode === 'table' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <ListIcon size={14} />
            Daftar
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
              viewMode === 'grid' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <LayoutGrid size={14} />
            Visual
          </button>
        </div>
      </div>

      {/* KPI Section - Simplified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tiket"
          value={loadingAnalytics ? '-' : analytics?.kpi?.total || 0}
          icon={Ticket}
          subtitle="Volume masuk sistem"
        />
        <KpiCard
          title="Aktif"
          value={loadingAnalytics ? '-' : (analytics?.kpi?.open + analytics?.kpi?.in_progress) || 0}
          icon={Clock}
          variant="warning"
          subtitle="Sedang ditangani"
        />
        <KpiCard
          title="Selesai"
          value={loadingAnalytics ? '-' : analytics?.kpi?.resolved || 0}
          icon={CheckCircle2}
          variant="success"
          subtitle="Berhasil ditutup"
        />
        <KpiCard
          title="Melewati SLA"
          value={loadingAnalytics ? '-' : analytics?.kpi?.overdue || 0}
          icon={AlertTriangle}
          variant={analytics?.kpi?.overdue > 0 ? 'danger' : 'default'}
          subtitle="Target waktu terlampaui"
        />
      </div>

      {/* Filter & Table Area */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Modern Filter Bar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nomor atau judul..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg">
              <SlidersHorizontal size={12} className="text-zinc-400" />
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="bg-transparent border-none p-0 text-[13px] font-bold text-zinc-600 focus:ring-0 cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="open">Open</option>
                <option value="in_progress">Processing</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[13px] font-bold text-zinc-600 focus:ring-0 focus:border-indigo-300 cursor-pointer transition-colors"
            >
              <option value="">Semua Prioritas</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              onClick={resetFilters}
              className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
              title="Reset Filters"
            >
              <FilterX size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-3"
            >
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Memuat Antrean</p>
            </motion.div>
          ) : tickets.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <Inbox size={40} className="text-zinc-200 mb-4" />
              <h3 className="text-sm font-bold text-zinc-900">Antrean Kosong</h3>
              <p className="text-xs text-zinc-500 mt-1">Tidak ada tiket yang ditemukan dengan filter ini.</p>
            </motion.div>
          ) : viewMode === 'table' ? (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-zinc-50/80 text-zinc-500 border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Reference</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Keluhan & Pelapor</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Kategori</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Target SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigateToDetail(t.id)}
                      className="cursor-pointer hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono font-bold text-indigo-600 tracking-tight">#{t.ticket_number}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">{t.title}</span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {t.is_anonymous ? 'Anonim' : t.reporter?.full_name} • {new Date(t.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600 uppercase">{t.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={t.status as any} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <SlaIndicator deadline={t.sla_deadline} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-zinc-50/30">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigateToDetail(t.id)}
                  className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono font-bold text-indigo-600 text-xs">#{t.ticket_number}</span>
                    <StatusBadge status={t.status as any} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 line-clamp-2 min-h-[36px] text-sm">{t.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">{t.category} • {new Date(t.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <PriorityBadge priority={t.priority as any} />
                    <SlaIndicator deadline={t.sla_deadline} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Footer */}
        {totalPages > 1 && !loading && (
          <div className="p-4 border-t border-zinc-100 bg-white flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Total <span className="text-zinc-900">{totalCount}</span> Tiket
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-zinc-200 rounded-md disabled:opacity-30 hover:bg-zinc-50 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-zinc-600 px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-zinc-200 rounded-md disabled:opacity-30 hover:bg-zinc-50 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useAdminTickets } from '@/hooks/useAdminTickets'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { 
  CheckCircle2, AlertTriangle, 
  Search, FilterX, Loader2, Inbox, ChevronLeft, ChevronRight,
  List as ListIcon, LayoutGrid, SlidersHorizontal, Terminal, Activity, Database
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
    async function fetchAnalytics() {
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
    
    // We wrap in a non-awaiting call to satisfy 'set-state-in-effect'
    // Alternatively, project rules seem to trigger on direct calls
    void fetchAnalytics()
  }, [])

  const navigateToDetail = (id: string) => {
    router.push(`/admin/tiket/${id}`)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Technical Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-b border-zinc-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-md border border-zinc-200/50 w-fit">
            <Terminal size={12} />
            Command Center
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
            Ticket <span className="text-zinc-400">Operations</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium max-w-xl leading-relaxed">
            Real-time infrastructure for monitoring and resolving student inquiries. 
            Ensure SLA compliance across all active support channels.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200/50">
            <button
              onClick={() => setViewMode('table')}
              className={clsx(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2",
                viewMode === 'table' ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <ListIcon size={12} />
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2",
                viewMode === 'grid' ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <LayoutGrid size={12} />
              Grid
            </button>
          </div>
        </div>
      </header>

      {/* KPI Section - Technical Style */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Inbound</span>
            <Database size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-zinc-900">
              {loadingAnalytics ? '--' : (analytics?.kpi?.total || 0)}
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Lifetime Vol.</p>
          </div>
        </div>
        
        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Active State</span>
            <Activity size={16} className="text-amber-500" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-zinc-900 text-amber-600">
              {loadingAnalytics ? '--' : ((analytics?.kpi?.open + analytics?.kpi?.in_progress) || 0)}
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Processing</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-zinc-900 text-emerald-600">
              {loadingAnalytics ? '--' : (analytics?.kpi?.resolved || 0)}
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Finalized</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">SLA Overdue</span>
            <AlertTriangle size={16} className={analytics?.kpi?.overdue > 0 ? 'text-rose-500' : 'text-zinc-400'} />
          </div>
          <div className="space-y-1">
            <div className={clsx("text-3xl font-mono font-bold", analytics?.kpi?.overdue > 0 ? 'text-rose-600' : 'text-zinc-900')}>
              {loadingAnalytics ? '--' : (analytics?.kpi?.overdue || 0)}
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-tight">Critical Delay</p>
          </div>
        </div>
      </section>

      {/* Filter & Operations Grid */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-200/50">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search resource ID or keywords..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all placeholder:text-zinc-400 uppercase tracking-tight"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg">
              <SlidersHorizontal size={12} className="text-zinc-400" />
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="bg-transparent border-none p-0 text-[10px] font-bold text-zinc-600 focus:ring-0 cursor-pointer uppercase tracking-widest"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">Processing</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg">
              <select
                value={filters.priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="bg-transparent border-none p-0 text-[10px] font-bold text-zinc-600 focus:ring-0 cursor-pointer uppercase tracking-widest"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {Object.values(filters).some(v => v !== '') && (
              <button
                onClick={resetFilters}
                className="h-9 px-3 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                <FilterX size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 space-y-4"
              >
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Synchronizing Registry</p>
              </motion.div>
            ) : tickets.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 mb-6">
                  <Inbox size={32} className="text-zinc-200" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Registry Empty</h3>
                <p className="text-[11px] text-zinc-400 mt-1 font-medium">No tickets found matching active deployment filters.</p>
              </motion.div>
            ) : viewMode === 'table' ? (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identifier</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Resource & Principal</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Classification</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">SLA Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {tickets.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => navigateToDetail(t.id)}
                        className="cursor-pointer hover:bg-zinc-50/50 transition-colors group"
                      >
                        <td className="px-6 py-6">
                          <div className="text-[12px] font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md w-fit group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                            #{t.ticket_number}
                          </div>
                        </td>
                        <td className="px-6 py-6 max-w-md">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors truncate">{t.title}</span>
                            <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-tight">
                              {t.is_anonymous ? 'Principal: Anon' : t.reporter?.full_name} • {new Date(t.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="px-2 py-1 bg-zinc-50 border border-zinc-200/50 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t.category}</span>
                        </td>
                        <td className="px-6 py-6">
                          <StatusBadge status={t.status as 'open' | 'in_progress' | 'resolved' | 'closed'} />
                        </td>
                        <td className="px-6 py-6 text-right font-mono text-[11px] font-bold">
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
                    className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer space-y-4 group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded uppercase">ID:{t.ticket_number}</span>
                      <StatusBadge status={t.status as 'open' | 'in_progress' | 'resolved' | 'closed'} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-zinc-900 line-clamp-2 min-h-[40px] text-sm group-hover:text-zinc-600 transition-colors leading-tight">{t.title}</h4>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] font-mono">{t.category} / {new Date(t.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                      <PriorityBadge priority={t.priority as 'low' | 'normal' | 'urgent'} />
                      <div className="font-mono text-[10px] font-bold">
                        <SlaIndicator deadline={t.sla_deadline} />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Console */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between bg-zinc-900 text-white p-4 rounded-xl shadow-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              Total Resources: <span className="text-white">{totalCount}</span>
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 hover:bg-zinc-800 rounded-md disabled:opacity-20 transition-colors text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-mono font-bold tracking-widest text-white">{String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 hover:bg-zinc-800 rounded-md disabled:opacity-20 transition-colors text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

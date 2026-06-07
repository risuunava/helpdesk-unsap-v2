'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useTickets, Ticket } from '@/hooks/useTickets'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { 
  Plus, Inbox, Loader2, Sparkles, Ticket as TicketIcon, 
  Clock, CheckCircle2, LayoutGrid, List as ListIcon,
  ChevronRight, ArrowRight, Activity
} from 'lucide-react'
import { clsx } from 'clsx'

export default function MahasiswaDashboard() {
  const { tickets, loading, error } = useTickets()
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('grid')

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  }

  const navigateToDetail = (id: string) => {
    router.push(`/mahasiswa/tiket/${id}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Clean Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Laporan Saya</h1>
          <p className="text-sm font-medium text-zinc-500">Pantau perkembangan keluhan Anda secara transparan.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={clsx(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                viewMode === 'table' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              )}
            >
              <ListIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                viewMode === 'grid' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              )}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
          <Link
            href="/mahasiswa/submit"
            className="flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white rounded-lg font-bold text-sm hover:bg-zinc-800 transition-all shadow-sm"
          >
            <Plus size={16} />
            Buat Laporan
          </Link>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total" value={loading ? '-' : stats.total} icon={TicketIcon} />
        <KpiCard title="Menunggu" value={loading ? '-' : stats.open} icon={Clock} variant="warning" />
        <KpiCard title="Diproses" value={loading ? '-' : stats.in_progress} icon={Activity} />
        <KpiCard title="Selesai" value={loading ? '-' : stats.resolved} icon={CheckCircle2} variant="success" />
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sinkronisasi Data</p>
          </motion.div>
        ) : tickets.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center bg-white border border-dashed border-zinc-200 rounded-xl">
            <Inbox size={40} className="text-zinc-200 mb-4" />
            <h3 className="text-sm font-bold text-zinc-900">Belum Ada Laporan</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Anda belum pernah mengirimkan keluhan ke sistem.</p>
            <Link href="/mahasiswa/submit" className="mt-6 text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              Buat laporan pertama Anda <ArrowRight size={12} />
            </Link>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => navigateToDetail(t.id)}
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono font-bold text-emerald-600 text-xs">#{t.ticket_number}</span>
                  <StatusBadge status={t.status as any} />
                </div>
                <h4 className="font-bold text-zinc-900 line-clamp-2 min-h-[40px] text-sm group-hover:text-emerald-700 transition-colors">{t.title}</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">{t.category} • {new Date(t.created_at).toLocaleDateString('id-ID')}</p>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-50 mt-4">
                  <PriorityBadge priority={t.priority as any} />
                  {t.status !== 'resolved' && t.status !== 'closed' && <SlaIndicator deadline={t.sla_deadline} />}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">No. Tiket</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Judul Laporan</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {tickets.map((t) => (
                  <tr key={t.id} onClick={() => navigateToDetail(t.id)} className="cursor-pointer hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-5 font-mono font-bold text-emerald-600">#{t.ticket_number}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">{t.title}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{t.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={t.status as any} /></td>
                    <td className="px-6 py-5 text-right text-zinc-500 font-medium">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


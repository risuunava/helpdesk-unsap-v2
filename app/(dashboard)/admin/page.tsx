'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTickets } from '@/hooks/useAdminTickets'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { 
  Ticket, CheckCircle2, Clock, AlertTriangle, 
  Search, FilterX, Loader2, Inbox, ChevronLeft, ChevronRight 
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard Admin" 
        subtitle="Pantau performa layanan dan kelola semua tiket yang masuk"
      />

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard
          title="Total Tiket"
          value={loadingAnalytics ? '-' : analytics?.kpi?.total || 0}
          icon={Ticket}
          variant="default"
        />
        <KpiCard
          title="Tiket Aktif"
          value={loadingAnalytics ? '-' : (analytics?.kpi?.open + analytics?.kpi?.in_progress) || 0}
          subtitle={`${analytics?.kpi?.open || 0} Open, ${analytics?.kpi?.in_progress || 0} In Progress`}
          icon={Clock}
          variant="warning"
        />
        <KpiCard
          title="Terselesaikan"
          value={loadingAnalytics ? '-' : analytics?.kpi?.resolved || 0}
          subtitle={`SLA Compliance: ${analytics?.sla_compliance?.compliance || 100}%`}
          icon={CheckCircle2}
          variant="success"
        />
        <KpiCard
          title="Melewati SLA"
          value={loadingAnalytics ? '-' : analytics?.kpi?.overdue || 0}
          subtitle="Membutuhkan perhatian segera"
          icon={AlertTriangle}
          variant={analytics?.kpi?.overdue > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Table Section */}
      <div className="bg-bg-surface rounded-2xl border border-border shadow-capsule overflow-hidden flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b border-border bg-bg-elevated/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Cari judul atau nomor tiket..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              className="px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Semua Prioritas</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Semua Kategori</option>
              <option value="akademik">Akademik</option>
              <option value="keuangan">Keuangan</option>
              <option value="fasilitas">Fasilitas</option>
              <option value="keamanan">Keamanan</option>
              <option value="lainnya">Lainnya</option>
            </select>

            <button
              onClick={resetFilters}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-xl border border-transparent hover:border-border transition-all"
              title="Reset Filter"
            >
              <FilterX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-text-muted">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
            <p className="text-sm font-medium">Memuat data tiket...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-error bg-error/5">
            <p>{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4 border border-border">
              <Inbox className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Tiket tidak ditemukan</h3>
            <p className="text-sm text-text-secondary">
              Tidak ada tiket yang cocok dengan filter pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-elevated text-text-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold font-serif">Nomor</th>
                  <th className="px-6 py-4 font-semibold font-serif cursor-pointer hover:text-text-primary" onClick={() => toggleSort('created_at')}>
                    Tanggal {sort.column === 'created_at' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 font-semibold font-serif">Judul & Reporter</th>
                  <th className="px-6 py-4 font-semibold font-serif">Kategori</th>
                  <th className="px-6 py-4 font-semibold font-serif cursor-pointer hover:text-text-primary" onClick={() => toggleSort('status')}>
                    Status {sort.column === 'status' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 font-semibold font-serif cursor-pointer hover:text-text-primary" onClick={() => toggleSort('priority')}>
                    Prioritas {sort.column === 'priority' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 font-semibold font-serif text-right">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {tickets.map((t) => {
                  const isOverdue = t.sla_deadline && new Date(t.sla_deadline) < new Date() && t.status !== 'resolved' && t.status !== 'closed'
                  const isUrgent = t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed'
                  
                  let rowStyle = "hover:bg-bg-overlay"
                  if (isOverdue) rowStyle = "bg-[#FEF2F2]/30 hover:bg-[#FEF2F2]/60" // Subtle red for overdue
                  else if (isUrgent) rowStyle = "bg-[#FFFbeb]/40 hover:bg-[#FFFbeb]/70" // Subtle orange for urgent

                  return (
                    <tr
                      key={t.id}
                      onClick={() => navigateToDetail(t.id)}
                      className={`cursor-pointer transition-colors group ${rowStyle}`}
                    >
                      <td className="px-6 py-4 font-mono text-accent font-medium">
                        {t.ticket_number}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {formatDate(t.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-text-primary group-hover:text-accent transition-colors max-w-[250px] truncate">
                            {t.title}
                          </span>
                          <span className="text-xs text-text-muted">
                            {t.is_anonymous ? `Anonim (${t.anonymous_code})` : t.reporter?.full_name || 'Tidak diketahui'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary capitalize">
                        {t.category}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={t.status as any} />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={t.priority as any} overridden={t.priority_overridden} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <SlaIndicator deadline={t.sla_deadline} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && !loading && (
          <div className="p-4 border-t border-border bg-bg-surface flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Menampilkan {tickets.length} dari {totalCount} tiket
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-bg-elevated transition-colors text-text-primary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-bg-elevated transition-colors text-text-primary"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

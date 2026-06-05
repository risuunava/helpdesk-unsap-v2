'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTickets, Ticket } from '@/hooks/useTickets'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { PageHeader } from '@/components/ui/PageHeader'
import { Plus, Inbox, Loader2 } from 'lucide-react'

export default function MahasiswaDashboard() {
  const { tickets, loading, error } = useTickets()
  const router = useRouter()

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  }

  const navigateToDetail = (id: string) => {
    router.push(`/mahasiswa/tiket/${id}`)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-primary">Laporan Saya</h1>
          <p className="text-sm text-text-secondary mt-1">Kelola dan pantau status laporan Anda</p>
        </div>
        <Link
          href="/mahasiswa/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-text-inverse rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-capsule"
        >
          <Plus className="w-4 h-4" />
          Buat Laporan Baru
        </Link>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-text-primary' },
          { label: 'Menunggu', value: stats.open, color: 'text-warning' },
          { label: 'Diproses', value: stats.in_progress, color: 'text-info' },
          { label: 'Selesai', value: stats.resolved, color: 'text-success' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-bg-surface shadow-capsule flex flex-col gap-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{s.label}</span>
            <span className={`text-2xl font-bold font-mono ${s.color}`}>
              {loading ? '-' : s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Tabel Tiket */}
      <div className="bg-bg-surface rounded-2xl border border-border shadow-capsule overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-accent" />
            <p className="text-sm">Memuat daftar laporan...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-error bg-error/5">
            <p>{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4 border border-border">
              <Inbox className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Belum ada laporan</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-sm">
              Anda belum membuat laporan apapun. Klik tombol di bawah untuk mulai membuat laporan pertama Anda.
            </p>
            <Link
              href="/mahasiswa/submit"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-text-primary rounded-xl font-semibold text-sm hover:bg-bg-elevated transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Laporan Baru
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-elevated text-text-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold font-serif">Nomor</th>
                  <th className="px-6 py-4 font-semibold font-serif">Judul</th>
                  <th className="px-6 py-4 font-semibold font-serif">Kategori</th>
                  <th className="px-6 py-4 font-semibold font-serif">Status</th>
                  <th className="px-6 py-4 font-semibold font-serif">Prioritas</th>
                  <th className="px-6 py-4 font-semibold font-serif">SLA</th>
                  <th className="px-6 py-4 font-semibold font-serif text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigateToDetail(t.id)}
                    className="hover:bg-bg-overlay cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-accent">
                      {t.ticket_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate text-text-primary group-hover:text-accent font-medium transition-colors">
                        {t.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary capitalize">
                      {t.category}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status as any} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={t.priority as any} />
                    </td>
                    <td className="px-6 py-4">
                      {t.status === 'resolved' || t.status === 'closed' ? (
                        <span className="text-text-muted text-xs">Selesai</span>
                      ) : (
                        <SlaIndicator deadline={t.sla_deadline} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-right">
                      {formatDate(t.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

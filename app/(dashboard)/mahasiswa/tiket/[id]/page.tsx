'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Ticket } from '@/hooks/useTickets'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { ArrowLeft, Paperclip, Clock, MessageSquare, Loader2, Calendar } from 'lucide-react'

export default function TicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/tickets/${id}`)
        if (!res.ok) throw new Error('Gagal memuat tiket')
        const json = await res.json()
        setTicket(json.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTicket()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-6 text-center text-error bg-error/5 rounded-2xl border border-error/20">
        <p>{error || 'Tiket tidak ditemukan'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 border border-border rounded-lg hover:bg-bg-elevated transition-colors text-text-primary text-sm font-semibold"
        >
          Kembali
        </button>
      </div>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header / Back */}
      <div>
        <button
          onClick={() => router.push('/mahasiswa')}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-text-primary">
              {ticket.ticket_number}
            </h1>
            <StatusBadge status={ticket.status as any} />
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary bg-bg-elevated px-4 py-2 rounded-lg border border-border">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(ticket.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Kolom Kiri: Info Tiket (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-bg-surface rounded-2xl border border-border p-6 shadow-capsule">
            
            <h2 className="text-xl font-bold text-text-primary mb-4">{ticket.title}</h2>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted uppercase">Kategori</span>
                <span className="text-sm text-text-primary capitalize">{ticket.category}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted uppercase">Departemen</span>
                <span className="text-sm text-text-primary">{ticket.department}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted uppercase">Prioritas</span>
                <PriorityBadge priority={ticket.priority as any} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted uppercase">SLA Batas Waktu</span>
                {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                  <span className="text-sm text-text-muted">Selesai</span>
                ) : (
                  <SlaIndicator deadline={ticket.sla_deadline} />
                )}
              </div>
            </div>

            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Deskripsi</h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </div>

            {ticket.attachment_url && (
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Lampiran</h3>
                <a
                  href={ticket.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 p-3 rounded-xl border border-border bg-bg-elevated hover:bg-bg-overlay hover:border-border-strong transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center border border-border">
                    <Paperclip className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                      Lihat File Terlampir
                    </p>
                    <p className="text-xs text-text-muted">Buka di tab baru</p>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Timeline Status */}
          <div className="bg-bg-surface rounded-2xl border border-border p-6 shadow-capsule">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              Riwayat Status
            </h3>
            <div className="relative pl-4 border-l-2 border-border space-y-6">
              
              <div className="relative">
                <div className="absolute -left-[21px] w-3 h-3 bg-border rounded-full ring-4 ring-bg-surface"></div>
                <div className="text-sm font-medium text-text-primary">Tiket Dibuat (Open)</div>
                <div className="text-xs text-text-muted mt-0.5">{formatDate(ticket.created_at)}</div>
              </div>

              {(ticket.status === 'in_progress' || ticket.status === 'resolved' || ticket.status === 'closed') && (
                <div className="relative">
                  <div className="absolute -left-[21px] w-3 h-3 bg-info rounded-full ring-4 ring-bg-surface"></div>
                  <div className="text-sm font-medium text-info">Sedang Diproses (In Progress)</div>
                </div>
              )}

              {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                <div className="relative">
                  <div className="absolute -left-[21px] w-3 h-3 bg-success rounded-full ring-4 ring-bg-surface"></div>
                  <div className="text-sm font-medium text-success">Selesai (Resolved)</div>
                  <div className="text-xs text-text-muted mt-0.5">{formatDate(ticket.resolved_at)}</div>
                </div>
              )}

              {ticket.status === 'closed' && (
                <div className="relative">
                  <div className="absolute -left-[21px] w-3 h-3 bg-text-muted rounded-full ring-4 ring-bg-surface"></div>
                  <div className="text-sm font-medium text-text-secondary">Ditutup (Closed)</div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Kolom Kanan: Chat Room Placeholder (40%) */}
        <div className="lg:col-span-2">
          <div className="bg-bg-surface rounded-2xl border border-border flex flex-col h-[600px] shadow-capsule">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-text-primary">Diskusi Tiket</h3>
            </div>
            
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4 border border-border">
                <MessageSquare className="w-8 h-8 text-text-muted" />
              </div>
              <h4 className="text-text-primary font-medium mb-1">Live Chat Belum Tersedia</h4>
              <p className="text-sm text-text-muted max-w-[250px]">
                Fitur diskusi interaktif antara Anda dan admin akan hadir segera.
              </p>
            </div>

            <div className="p-4 border-t border-border bg-bg-elevated">
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-border bg-bg-base cursor-not-allowed"
                />
                <button disabled className="px-4 py-2 bg-text-muted text-text-inverse rounded-xl text-sm font-semibold cursor-not-allowed">
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

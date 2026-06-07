'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { TicketActions } from '@/components/ticket/TicketActions'
import { ChatRoom } from '@/components/chat/ChatRoom'
import { 
  ArrowLeft, Paperclip, Clock, Loader2, Calendar, 
  User, Building2, BrainCircuit
} from 'lucide-react'

export default function AdminTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // React 19 / Next.js 15 requires unwrapping params with React.use()
  const { id } = use(params)
  
  const [ticket, setTicket] = useState<any>(null)
  const [admins, setAdmins] = useState<{ id: string; full_name: string; role: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTicketAndAdmins = async () => {
    try {
      // Fetch Ticket
      const res = await fetch(`/api/tickets/${id}`)
      if (!res.ok) throw new Error('Gagal memuat tiket')
      const json = await res.json()
      setTicket(json.data)

      // Fetch Admins for assignee dropdown
      const { data: adminList } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['admin', 'master_admin'])

      if (adminList) setAdmins(adminList)

      // Fetch current user role and ID
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const currentUserProfile = adminList?.find(a => a.id === user.id)
        if (currentUserProfile) {
          setCurrentUserRole(currentUserProfile.role)
          // If not in the adminList, fetch specifically (though they should be if they are admin)
          const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
          if (myProfile) setCurrentUserRole(myProfile.role)
        }
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicketAndAdmins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          onClick={() => router.push('/admin')}
          className="mt-4 px-4 py-2 border border-border rounded-lg hover:bg-bg-elevated transition-colors text-text-primary text-sm font-semibold"
        >
          Kembali ke Dashboard
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header / Back */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Tiket
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-text-primary">
              {ticket.ticket_number}
            </h1>
            <StatusBadge status={ticket.status as any} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Info Tiket & Actions (7 kolom) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-capsule">
            
            <h2 className="text-2xl font-bold text-text-primary mb-6 leading-tight">{ticket.title}</h2>
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 p-4 bg-bg-elevated/50 rounded-xl border border-border">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Pelapor</span>
                <span className="text-sm font-medium text-text-primary truncate">
                  {ticket.is_anonymous ? `Anonim (${ticket.anonymous_code})` : ticket.reporter?.full_name}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Departemen</span>
                <span className="text-sm font-medium text-text-primary">{ticket.department}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Tanggal Dibuat</span>
                <span className="text-sm font-medium text-text-primary">{new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Kategori</span>
                <span className="text-sm font-medium text-text-primary capitalize">{ticket.category}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Prioritas</span>
                <div className="flex items-center"><PriorityBadge priority={ticket.priority as any} overridden={ticket.priority_overridden} /></div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">SLA</span>
                {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                  <span className="text-sm font-medium text-text-muted">Selesai</span>
                ) : (
                  <SlaIndicator deadline={ticket.sla_deadline} />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-border pt-6 mb-8">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Deskripsi Keluhan</h3>
              <p className="text-[15px] text-text-secondary whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </div>

            {/* Attachments */}
            {ticket.attachment_url && (
              <div className="border-t border-border pt-6 mb-8">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Lampiran</h3>
                <a
                  href={ticket.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-3 rounded-xl border border-border bg-bg-elevated hover:bg-bg-overlay hover:border-border-strong transition-all group max-w-sm w-full"
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center border border-border shrink-0">
                    <Paperclip className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                      File Lampiran
                    </p>
                    <p className="text-xs text-text-muted">Buka di tab baru</p>
                  </div>
                </a>
              </div>
            )}

            {/* ML Insights */}
            {(ticket.ml_confidence !== null || ticket.ml_model_version !== null) && (
              <div className="border border-info/20 bg-info/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-8">
                <div className="flex gap-3 items-start">
                  <BrainCircuit className="w-5 h-5 text-info mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1">Analisis Machine Learning</h4>
                    <p className="text-xs text-text-secondary">
                      Prioritas otomatis ditentukan oleh model AI.
                      {ticket.ml_confidence && ` Confidence Score: ${Math.round(ticket.ml_confidence * 100)}%.`}
                    </p>
                  </div>
                </div>
                
                {currentUserRole === 'master_admin' && (
                  <button 
                    onClick={() => alert('Fitur Koreksi Label ML akan diimplementasikan pada B17')}
                    className="shrink-0 px-3 py-1.5 bg-bg-surface border border-info/30 text-info text-xs font-semibold rounded-lg hover:bg-info hover:text-white transition-colors"
                  >
                    Koreksi Label ML
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Timeline */}
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

        {/* Kolom Kanan: Actions & Chat Room (5 kolom) */}
        <div className="lg:col-span-5 space-y-6">
          <TicketActions 
            ticketId={ticket.id}
            initialStatus={ticket.status}
            initialPriority={ticket.priority}
            initialAssignedTo={ticket.assigned_to}
            admins={admins}
            onSuccess={fetchTicketAndAdmins}
          />

          {currentUserId && (
            <ChatRoom ticketId={id} currentUserId={currentUserId} />
          )}
        </div>

      </div>
    </div>
  )
}

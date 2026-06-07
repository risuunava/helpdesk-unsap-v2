'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { ChatRoom } from '@/components/chat/ChatRoom'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, Paperclip, Clock, Loader2, Calendar, 
  User, Building2, MessageSquare, History, Info, ChevronRight,
  FileText
} from 'lucide-react'
import { clsx } from 'clsx'

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id } = use(params)
  
  const activeTab = searchParams.get('tab') || 'info'
  
  const [ticket, setTicket] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketRes, userRes] = await Promise.all([
          fetch(`/api/tickets/${id}`),
          supabase.auth.getUser()
        ])

        if (!ticketRes.ok) throw new Error('Gagal memuat tiket')
        const json = await ticketRes.json()
        setTicket(json.data)
        
        if (userRes.data.user) {
          setCurrentUserId(userRes.data.user.id)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, supabase])

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab)
    router.replace(`?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center border border-zinc-200 rounded-xl bg-white">
        <Info className="h-10 w-10 text-zinc-300 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-900">Laporan tidak ditemukan</h2>
        <button onClick={() => router.push('/mahasiswa')} className="mt-6 text-sm font-bold text-emerald-600 hover:underline">Kembali ke Dashboard</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/mahasiswa')}
            className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900">{ticket.ticket_number}</h1>
            <StatusBadge status={ticket.status as any} />
          </div>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setTab('info')}
            className={clsx(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
              activeTab === 'info' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <FileText size={14} />
            Informasi Laporan
          </button>
          <button
            onClick={() => setTab('chat')}
            className={clsx(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
              activeTab === 'chat' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <MessageSquare size={14} />
            Diskusi Admin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6">{ticket.title}</h2>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-b border-zinc-100 pb-8 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kategori</p>
                      <p className="text-sm font-semibold text-zinc-700 capitalize">{ticket.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Departemen</p>
                      <p className="text-sm font-semibold text-zinc-700 capitalize">{ticket.department || 'Lainnya'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Prioritas</p>
                      <div><PriorityBadge priority={ticket.priority as any} /></div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Batas SLA</p>
                      {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                        <p className="text-sm font-semibold text-zinc-400 italic">Laporan Selesai</p>
                      ) : (
                        <SlaIndicator deadline={ticket.sla_deadline} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Isi Laporan</p>
                    <div className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-lg border border-zinc-100 whitespace-pre-wrap">
                      {ticket.description}
                    </div>
                  </div>

                  {ticket.attachment_url && (
                    <div className="mt-8 pt-8 border-t border-zinc-100 space-y-4">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lampiran File</p>
                      <a
                        href={ticket.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-4 py-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all text-sm font-semibold text-zinc-700 shadow-sm"
                      >
                        <Paperclip size={16} className="text-zinc-400" />
                        Buka Lampiran
                        <ChevronRight size={14} className="text-zinc-300" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <History size={14} className="text-zinc-400" />
                    Timeline Penanganan
                  </h3>
                  <div className="space-y-6 relative pl-4 border-l border-zinc-100 ml-1">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 bg-zinc-900 rounded-full"></div>
                      <p className="text-xs font-bold text-zinc-800">Laporan Dikirim</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{new Date(ticket.created_at).toLocaleString('id-ID')}</p>
                    </div>
                    {ticket.status !== 'open' && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2 h-2 bg-amber-500 rounded-full"></div>
                        <p className="text-xs font-bold text-zinc-800">Sedang Diproses Admin</p>
                        <p className="text-[10px] text-zinc-400 mt-1">Tim admin sedang meninjau laporan Anda</p>
                      </div>
                    )}
                    {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <p className="text-xs font-bold text-zinc-800">Solusi Diberikan</p>
                        <p className="text-[10px] text-zinc-400 mt-1">{ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString('id-ID') : '-'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]"
              >
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={14} className="text-emerald-600" />
                    Obrolan dengan Tim Support
                  </h3>
                </div>
                {currentUserId && (
                  <div className="flex-1 overflow-hidden">
                    <ChatRoom ticketId={id} currentUserId={currentUserId} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 rounded-xl p-6 text-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Informasi Penting</h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              Gunakan fitur diskusi untuk bertanya langsung kepada admin. Tim kami akan merespon sesuai urutan antrean.
            </p>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tanggal Laporan</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
              <Calendar size={14} className="text-zinc-400" />
              {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

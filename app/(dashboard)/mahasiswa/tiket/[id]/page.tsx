'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { ChatRoom } from '@/components/chat/ChatRoom'
import { createClient } from '@/lib/supabase/client'
import PageContainer from '@/components/layout/page-container'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, Paperclip, Clock, Loader2, Calendar, 
  User, Building2, MessageSquare, History, Info, ChevronRight,
  FileText, ShieldCheck, Layout
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

        if (!ticketRes.ok) throw new Error('Gagal memuat data laporan.')
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

  if (error || (!loading && !ticket)) {
    return (
      <PageContainer pageTitle="Laporan Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center py-40 text-center border border-border/40 rounded-[2rem] bg-card/50 backdrop-blur-sm max-w-2xl mx-auto shadow-glass">
          <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6 border border-border/20 shadow-sm">
            <Info className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Laporan Tidak Ditemukan</h2>
          <p className="text-muted-foreground text-base mt-2 max-w-sm mx-auto font-medium">Laporan yang Anda cari tidak tersedia atau Anda tidak memiliki akses.</p>
          <Button 
            onClick={() => router.push('/mahasiswa')} 
            variant="outline"
            className="mt-10 h-12 px-8 font-bold"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </PageContainer>
    )
  }

  const infoContent = {
    title: "Panduan Detail Laporan",
    sections: [
      {
        title: "Pemantauan Progres",
        description: "Status laporan Anda diperbarui secara real-time oleh tim admin. Cek timeline untuk melihat riwayat aktivitas penanganan."
      },
      {
        title: "Komunikasi Admin",
        description: "Gunakan tab Diskusi untuk memberikan informasi tambahan atau bertanya langsung kepada petugas yang menangani laporan Anda."
      }
    ]
  }

  return (
    <PageContainer
      pageTitle={loading ? "Memuat Laporan..." : ticket?.ticket_number}
      pageDescription="Pantau status penanganan, detail informasi, dan berdiskusi dengan tim bantuan."
      isLoading={loading}
      infoContent={infoContent}
      pageHeaderAction={
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border/60">
          <Button
            variant={activeTab === 'info' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTab('info')}
            className={cn(
              "rounded-lg font-bold text-xs flex items-center gap-2",
              activeTab === 'info' && "bg-card shadow-sm border border-border/40"
            )}
          >
            <FileText size={14} />
            Informasi
          </Button>
          <Button
            variant={activeTab === 'chat' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTab('chat')}
            className={cn(
              "rounded-lg font-bold text-xs flex items-center gap-2",
              activeTab === 'chat' && "bg-card shadow-sm border border-border/40"
            )}
          >
            <MessageSquare size={14} />
            Diskusi
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        
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
                className="space-y-6"
              >
                <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                    <CardTitle className="text-base font-bold">{ticket?.title}</CardTitle>
                    <StatusBadge status={ticket?.status as any} />
                  </CardHeader>
                  
                  <CardContent className="pt-8">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-b border-border/50 pb-8 mb-8">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kategori</p>
                        <p className="text-sm font-bold text-foreground capitalize">{ticket?.category}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit/Tujuan</p>
                        <p className="text-sm font-bold text-foreground capitalize">{ticket?.department || 'Lainnya'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prioritas</p>
                        <div><PriorityBadge priority={ticket?.priority as any} /></div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Batas Waktu (SLA)</p>
                        {ticket?.status === 'resolved' || ticket?.status === 'closed' ? (
                          <p className="text-sm font-bold text-muted-foreground italic">Laporan Selesai</p>
                        ) : (
                          <SlaIndicator deadline={ticket?.sla_deadline} />
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Isi Laporan</p>
                      <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-5 rounded-2xl border border-border/40 whitespace-pre-wrap font-medium shadow-inner">
                        {ticket?.description}
                      </div>
                    </div>

                    {ticket?.attachment_url && (
                      <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Lampiran Pendukung</p>
                        <Button 
                          asChild
                          variant="outline"
                          className="rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-sm"
                        >
                          <a href={ticket?.attachment_url} target="_blank" rel="noopener noreferrer">
                            <Paperclip size={16} className="text-muted-foreground" />
                            Buka Lampiran
                            <ChevronRight size={14} className="ml-2 opacity-50" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 bg-muted/20">
                    <History size={16} className="text-primary" />
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Timeline Penanganan</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 px-10 pb-10">
                    <div className="space-y-8 relative pl-6 border-l-2 border-border/60 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-primary border-2 border-background rounded-full ring-2 ring-primary/20"></div>
                        <p className="text-xs font-bold text-foreground">Laporan Dikirim</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1">{ticket?.created_at ? new Date(ticket.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                      </div>
                      {ticket?.status !== 'open' && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-amber-500 border-2 border-background rounded-full ring-2 ring-amber-500/20"></div>
                          <p className="text-xs font-bold text-foreground">Sedang Diproses Admin</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1">Petugas sedang meninjau detail laporan Anda</p>
                        </div>
                      )}
                      {(ticket?.status === 'resolved' || ticket?.status === 'closed') && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full ring-2 ring-emerald-500/20"></div>
                          <p className="text-xs font-bold text-foreground">Solusi Diberikan</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1">{ticket?.resolved_at ? new Date(ticket.resolved_at).toLocaleString('id-ID') : '-'}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border/40 rounded-[2rem] shadow-glass overflow-hidden flex flex-col h-[700px]"
              >
                <div className="p-5 border-b border-border/60 bg-muted/40 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-primary" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Diskusi Petugas</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Live Connect</span>
                  </div>
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
          <Card className="border-border/40 shadow-glass overflow-hidden bg-primary">
            <CardContent className="pt-6 space-y-4 text-primary-foreground">
              <div className="flex items-center gap-2 opacity-70">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Informasi Support</span>
              </div>
              <p className="text-sm font-bold leading-relaxed">
                Gunakan fitur diskusi untuk bertanya langsung kepada petugas. Tim kami akan merespon sesuai urutan antrean.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-primary" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Laporan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tanggal Dibuat</p>
                <p className="text-xs font-bold text-foreground">
                  {ticket?.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div className="pt-3 border-t border-border/40 space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ID Referensi</p>
                <p className="text-xs font-mono font-bold text-foreground">{ticket?.ticket_number}</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </PageContainer>
  )
}

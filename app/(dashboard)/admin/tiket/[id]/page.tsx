'use client'

import React, { useEffect, useState, use, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { SlaIndicator } from '@/components/ui/SlaIndicator'
import { TicketActions } from '@/components/ticket/TicketActions'
import { ChatRoom } from '@/components/chat/ChatRoom'
import PageContainer from '@/components/layout/page-container'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { 
  ArrowLeft, Paperclip, Clock, Loader2, 
  Cpu, MessageSquare,
  ChevronRight, FileText, AlertTriangle, Activity, Database, ArrowRight, SlidersHorizontal,
  History
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id } = use(params)
  
  const activeTab = searchParams.get('tab') || 'info'

  const [ticket, setTicket] = useState<any>(null)
  const [admins, setAdmins] = useState<{ id: string; full_name: string; role: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTicketAndAdmins = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (!res.ok) throw new Error('Gagal memuat data tiket dari server.')
      const json = await res.json()
      setTicket(json.data)

      const { data: adminList } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['admin', 'master_admin'])

      if (adminList) setAdmins(adminList)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    void fetchTicketAndAdmins()
  }, [fetchTicketAndAdmins])

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab)
    router.replace(`?${params.toString()}`)
  }

  if (error || (!loading && !ticket)) {
    return (
      <PageContainer pageTitle="Laporan Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center py-40 text-center border border-border/40 rounded-[2rem] bg-card/50 backdrop-blur-sm max-w-2xl mx-auto shadow-glass">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center border border-destructive/20 mb-8 shadow-xl">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Resource Not Found</h2>
          <p className="text-muted-foreground text-base mt-2 max-w-sm mx-auto font-medium">Laporan yang Anda cari tidak tersedia atau telah dihapus dari sistem.</p>
          <Button 
            onClick={() => router.push('/admin')} 
            className="mt-10 h-12 px-8 font-bold"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </PageContainer>
    )
  }

  const infoContent = {
    title: "Panduan Inspeksi Tiket",
    sections: [
      {
        title: "Pembaruan Status",
        description: "Gunakan panel Kontrol di sisi kanan untuk memperbarui status penanganan atau menugaskan petugas lain."
      },
      {
        title: "Interaksi Pengguna",
        description: "Tab Diskusi memungkinkan komunikasi dua arah dengan pelapor untuk klarifikasi lebih lanjut."
      }
    ]
  }

  return (
    <PageContainer
      pageTitle={loading ? "Memuat Laporan..." : `ID: ${ticket?.ticket_number}`}
      pageDescription="Inspeksi detail laporan, riwayat aktivitas, dan interaksi langsung dengan pelapor."
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
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Core Registry Info */}
                <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Database size={16} className="text-primary" />
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Detail Laporan</CardTitle>
                    </div>
                    <StatusBadge status={ticket?.status as any} />
                  </CardHeader>
                  
                  <CardContent className="pt-8 space-y-8">
                    <h3 className="text-2xl font-bold text-foreground leading-tight">{ticket?.title}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pelapor</p>
                        <p className="text-xs font-bold text-foreground">
                          {ticket?.is_anonymous ? 'Anonim' : ticket?.reporter?.full_name}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tujuan</p>
                        <p className="text-xs font-bold text-foreground truncate">{ticket?.department || 'Umum'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kategori</p>
                        <p className="text-xs font-bold text-foreground">{ticket?.category}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prioritas</p>
                        <PriorityBadge priority={ticket?.priority as any} overridden={ticket?.priority_overridden} />
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deskripsi Masalah</p>
                      <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-5 rounded-2xl border border-border/40 whitespace-pre-wrap font-medium shadow-inner">
                        {ticket?.description}
                      </div>
                    </div>

                    {ticket?.attachment_url && (
                      <div className="pt-6 border-t border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Lampiran File</p>
                        <Button 
                          asChild
                          variant="outline"
                          className="rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-sm"
                        >
                          <a href={ticket?.attachment_url} target="_blank" rel="noopener noreferrer">
                            <Paperclip size={14} />
                            Buka Lampiran
                            <ArrowRight size={14} className="ml-2 opacity-50" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline History */}
                <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 bg-muted/20">
                    <History size={16} className="text-primary" />
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Riwayat Aktivitas</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 px-10 pb-10">
                    <div className="space-y-8 relative pl-6 border-l-2 border-border/60 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-primary border-2 border-background rounded-full ring-2 ring-primary/20"></div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-tight">Laporan Diterima</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1">{ticket?.created_at ? new Date(ticket.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                      </div>
                      
                      {ticket?.status !== 'open' && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-amber-500 border-2 border-background rounded-full ring-2 ring-amber-500/20"></div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-tight">Dalam Penanganan</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1">Status tiket diubah menjadi sedang diproses</p>
                        </div>
                      )}
                      
                      {(ticket?.status === 'resolved' || ticket?.status === 'closed') && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full ring-2 ring-emerald-500/20"></div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-tight">Laporan Selesai</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1">
                            {ticket?.resolved_at ? new Date(ticket.resolved_at).toLocaleString('id-ID') : '-'}
                          </p>
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
                exit={{ opacity: 0, x: 10 }}
                className="bg-card border border-border/40 rounded-[2rem] shadow-glass overflow-hidden flex flex-col h-[700px]"
              >
                <div className="p-5 border-b border-border/60 bg-muted/40 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-primary" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Diskusi Aktif</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Live Sync</span>
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

        {/* Action Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            <Card className="border-border/40 shadow-glass overflow-hidden bg-muted/50">
              <CardHeader className="border-b border-border/50 py-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-primary" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Kontrol Penanganan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {ticket && (
                  <TicketActions 
                    ticketId={ticket.id}
                    initialStatus={ticket.status}
                    initialPriority={ticket.priority}
                    initialAssignedTo={ticket.assigned_to}
                    admins={admins}
                    onSuccess={fetchTicketAndAdmins}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 py-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Target Resolusi</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status SLA</span>
                    <SlaIndicator deadline={ticket?.sla_deadline} />
                  </div>
                  <div className="pt-3 border-t border-border/40">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Dibuat Pada</p>
                    <p className="text-xs font-bold text-foreground">
                      {ticket?.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {ticket?.ml_confidence !== null && ticket?.ml_confidence !== undefined && (
              <Card className="border-border/40 shadow-glass overflow-hidden bg-primary/5">
                <CardHeader className="border-b border-border/20 py-4">
                  <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-primary" />
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Analisis AI</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-bold tabular-nums text-primary">{ticket?.ml_confidence ? Math.round(ticket.ml_confidence * 100) : 0}%</span>
                      <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Tingkat Kepercayaan</span>
                    </div>
                    <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(ticket?.ml_confidence || 0) * 100}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[9px] font-bold text-primary/50 uppercase tracking-widest">Model Klasifikasi</p>
                    <p className="text-[10px] font-bold text-primary italic">LR_TFIDF_V2 Deployment</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  )
}

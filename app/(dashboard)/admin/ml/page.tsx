'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
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
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface UncertainTicket {
  id: string
  ticket_number: string
  title: string
  description: string
  priority: string
  ml_confidence: number
  ml_model_version: string
  created_at: string
}

interface MlStats {
  totalSamples: number
  uncertainCount: number
  modelVersion: string
}

export default function MlActiveLearningPage() {
  const [stats, setStats] = useState<MlStats | null>(null)
  const [tickets, setTickets] = useState<UncertainTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRetraining, setIsRetraining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch('/api/admin/ml/stats'),
        fetch('/api/admin/ml/uncertain')
      ])

      if (!statsRes.ok || !ticketsRes.ok) throw new Error('Gagal mengambil data ML')

      const statsJson = await statsRes.json()
      const ticketsJson = await ticketsRes.json()

      setStats(statsJson)
      setTickets(ticketsJson.tickets)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLabel = async (ticketId: string, correctedLabel: string) => {
    try {
      const res = await fetch('/api/admin/ml/label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, correctedLabel })
      })

      if (!res.ok) throw new Error('Gagal menyimpan label')

      setTickets(prev => prev.filter(t => t.id !== ticketId))
      
      if (stats) {
        setStats({
          ...stats,
          totalSamples: stats.totalSamples + 1,
          uncertainCount: Math.max(0, stats.uncertainCount - 1)
        })
      }

      toast({
        title: "Berhasil",
        description: "Data training telah diperbarui.",
      })
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: err instanceof Error ? err.message : "Gagal menyimpan label",
      })
    }
  }

  const handleRetrain = async () => {
    setIsRetraining(true)
    try {
      const res = await fetch('/api/admin/ml/retrain', { method: 'POST' })
      if (!res.ok) throw new Error('Gagal memicu retraining')
      
      toast({
        title: "Proses Dimulai",
        description: "Retraining model sedang berjalan di latar belakang.",
      })
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: err instanceof Error ? err.message : "Gagal memicu retraining",
      })
    } finally {
      setIsRetraining(false)
    }
  }

  const infoContent = {
    title: "Panduan ML Management",
    sections: [
      {
        title: "Active Learning",
        description: "Gunakan antrean ini untuk meninjau prediksi tiket yang memiliki tingkat kepercayaan rendah (< 70%). Masukan Anda akan meningkatkan akurasi model di masa mendatang."
      },
      {
        title: "Retraining Model",
        description: "Proses ini akan melatih ulang model menggunakan data terbaru yang telah diverifikasi. Versi model baru akan otomatis menggantikan model aktif."
      }
    ]
  }

  return (
    <PageContainer
      pageTitle="Manajemen Model ML"
      pageDescription="Pantau performa model cerdas dan berikan umpan balik untuk meningkatkan akurasi."
      isLoading={isLoading}
      infoContent={infoContent}
      pageHeaderAction={
        <Button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={16} className={isRetraining ? 'animate-spin' : ''} />
          {isRetraining ? 'Memproses...' : 'Latih Ulang Model'}
        </Button>
      }
    >
      <div className="flex flex-1 flex-col gap-4 pb-12">
        {/* KPI Grid - Matches Main Dashboard Style */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          <Card className="@container/card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
            <CardHeader>
              <CardDescription>Data Pelatihan</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                {stats?.totalSamples || 0}
              </CardTitle>
              <CardAction>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Sampel terverifikasi dalam database
            </CardFooter>
          </Card>

          <Card className="@container/card border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardDescription className="text-amber-600 dark:text-amber-400 font-medium">Prediksi Ragu</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-amber-500 @[250px]/card:text-3xl">
                {stats?.uncertainCount || 0}
              </CardTitle>
              <CardAction>
                <Activity className="h-4 w-4 text-amber-500" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Kepercayaan prediksi di bawah 70%
            </CardFooter>
          </Card>

          <Card className="@container/card border-primary/20 bg-primary/5">
            <CardHeader>
              <CardDescription className="text-primary font-medium">Versi Model</CardDescription>
              <CardTitle className="text-xl font-bold truncate @[250px]/card:text-2xl" title={stats?.modelVersion}>
                {stats?.modelVersion || 'v0.0.0'}
              </CardTitle>
              <CardAction>
                <Cpu className="h-4 w-4 text-primary" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Versi yang sedang aktif saat ini
            </CardFooter>
          </Card>
        </div>

        {/* Data Table Section */}
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.list className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Antrean Peninjauan Prediksi</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sinkronisasi Aktif</span>
            </div>
          </div>

          <Card className="border-border/40 overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identitas</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Analisis Input</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Prediksi ML</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Kepercayaan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence mode="popLayout">
                    {tickets.length === 0 ? (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={5} className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-2xl border border-border flex items-center justify-center">
                              <CheckCircle2 size={24} className="text-muted-foreground/30" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-foreground font-bold text-sm">Antrean Kosong</p>
                              <p className="text-muted-foreground text-xs font-medium">Semua prediksi telah diverifikasi.</p>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ) : (
                      tickets.map((ticket) => (
                        <motion.tr 
                          key={ticket.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <div className="text-[12px] font-bold text-foreground">
                                #{ticket.ticket_number}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <div className="space-y-0.5">
                              <div className="text-sm font-bold text-foreground truncate">
                                {ticket.title}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                                {ticket.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <PriorityBadge priority={ticket.priority as 'low' | 'normal' | 'urgent'} />
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-[11px] font-bold text-foreground tabular-nums">
                                {Math.round((ticket.ml_confidence || 0) * 100)}%
                              </div>
                              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(ticket.ml_confidence || 0) * 100}%` }}
                                  className={cn(
                                    "h-full",
                                    (ticket.ml_confidence || 0) < 0.4 ? 'bg-rose-500' : 'bg-amber-500'
                                  )}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="default"
                                size="sm"
                                onClick={() => handleLabel(ticket.id, ticket.priority)}
                                className="h-7 px-3 text-[10px] font-bold rounded-md"
                              >
                                KONFIRMASI
                              </Button>
                              
                              <div className="relative group/menu">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] font-bold rounded-md flex items-center gap-1"
                                >
                                  KOREKSI
                                  <ChevronDown size={12} />
                                </Button>
                                
                                <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-lg shadow-xl py-1 z-20 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                                  {['low', 'normal', 'urgent'].map((p) => (
                                    p !== ticket.priority && (
                                      <button
                                        key={p}
                                        onClick={() => handleLabel(ticket.id, p)}
                                        className="w-full px-3 py-1.5 text-left text-[10px] font-bold text-muted-foreground hover:bg-muted uppercase tracking-tight flex items-center justify-between"
                                      >
                                        {p}
                                        <ArrowRight size={10} className="text-muted-foreground/30" />
                                      </button>
                                    )
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Footer Protocol Info */}
        <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              <Info size={14} className="text-primary" />
              Protokol Integritas Data
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              Koreksi yang diverifikasi diproses secara batch untuk melatih ulang model. 
              Arsitektur saat ini menggunakan Logistic Regression dengan vektorisasi TF-IDF N-grams (1,2).
            </p>
          </div>
          <div className="flex items-center md:justify-end gap-8">
            <div className="space-y-1 text-right">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Model Engine</span>
              <span className="text-[10px] font-bold text-foreground px-2 py-0.5 bg-muted rounded">LOGISTIC_REGRESSION</span>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Vektorisasi</span>
              <span className="text-[10px] font-bold text-foreground px-2 py-0.5 bg-muted rounded">TFIDF_V2</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

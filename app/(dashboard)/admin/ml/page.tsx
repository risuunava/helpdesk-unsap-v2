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
  Terminal,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
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
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
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

      setSuccessMessage('Data training diperbarui')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }

  const handleRetrain = async () => {
    if (!confirm('Mulai retraining model? Versi baru akan dibuat setelah proses selesai.')) return

    setIsRetraining(true)
    try {
      const res = await fetch('/api/admin/ml/retrain', { method: 'POST' })
      if (!res.ok) throw new Error('Gagal memicu retraining')
      
      setSuccessMessage('Proses retraining berjalan di background')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsRetraining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end pb-8 border-b border-border">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted border border-border rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted border border-border rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Technical Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-b border-border pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-md border border-border w-fit">
            <Terminal size={12} />
            Machine Learning Operations
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Active Learning <span className="text-muted-foreground">Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-xl leading-relaxed">
            Infrastructure for monitoring model performance and providing corrective feedback. 
            All manual labeling directly impacts the next training iteration.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2.5 disabled:opacity-50 active:scale-[0.98] shadow-sm"
          >
            <RefreshCw size={14} className={isRetraining ? 'animate-spin' : ''} />
            {isRetraining ? 'RETRAINING...' : 'RETRAIN MODEL'}
          </button>
        </div>
      </header>

      {/* Notifications - Technical Toasts */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card text-foreground px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 pointer-events-auto border border-border"
            >
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="font-mono text-[11px] font-bold tracking-tight">{successMessage.toUpperCase()}</span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-destructive text-destructive-foreground px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 pointer-events-auto"
            >
              <AlertCircle size={16} />
              <span className="font-mono text-[11px] font-bold tracking-tight">{error.toUpperCase()}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* KPI Grid - Clean Technical Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-widest">Training Data</span>
            <Database size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-foreground">{stats?.totalSamples || 0}</div>
            <p className="text-[11px] text-muted-foreground font-medium">Verified training samples in database</p>
          </div>
        </div>
        
        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-widest">Uncertainty</span>
            <Activity size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-foreground">{stats?.uncertainCount || 0}</div>
            <p className="text-[11px] text-muted-foreground font-medium">Predictions with confidence &lt; 0.70</p>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-widest">Model Stack</span>
            <Cpu size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-mono font-bold text-foreground truncate" title={stats?.modelVersion}>
              {stats?.modelVersion || 'v0.0.0-null'}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Current active deployment version</p>
          </div>
        </div>
      </section>

      {/* Data Table - Professional Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers size={18} className="text-foreground" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Prediction Review Queue</h2>
          </div>
          <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Sync Active
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identifier</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Input Analysis</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">ML Inference</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Confidence Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Verification</th>
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
                        <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-foreground font-bold text-sm">Queue Clear</p>
                          <p className="text-muted-foreground text-xs font-medium">No uncertain predictions found in the current pool.</p>
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
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-6 align-top">
                        <div className="space-y-1.5">
                          <div className="text-[12px] font-mono font-bold text-foreground">
                            #{ticket.ticket_number}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top max-w-md">
                        <div className="space-y-1.5">
                          <div className="text-sm font-bold text-foreground truncate">
                            {ticket.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                            {ticket.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top text-center">
                        <div className="flex justify-center">
                          <PriorityBadge priority={ticket.priority as 'low' | 'normal' | 'urgent'} />
                        </div>
                      </td>

                      <td className="px-6 py-6 align-top">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-[13px] font-mono font-bold text-foreground tabular-nums">
                            {Math.round(ticket.ml_confidence * 100)}%
                          </div>
                          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${ticket.ml_confidence * 100}%` }}
                              className={`h-full ${
                                ticket.ml_confidence < 0.4 ? 'bg-rose-500' : 'bg-amber-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleLabel(ticket.id, ticket.priority)}
                            className="h-8 px-4 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:bg-primary/90 transition-all active:scale-95"
                          >
                            CONFIRM
                          </button>
                          
                          <div className="relative group/menu">
                            <button className="h-8 px-3 bg-card border border-border text-foreground rounded-md text-[10px] font-bold hover:bg-muted transition-all flex items-center gap-1.5">
                              CORRECT
                              <ChevronDown size={12} />
                            </button>
                            
                            <div className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-lg shadow-xl py-1 z-20 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                              {['low', 'normal', 'urgent'].map((p) => (
                                p !== ticket.priority && (
                                  <button
                                    key={p}
                                    onClick={() => handleLabel(ticket.id, p)}
                                    className="w-full px-4 py-2 text-left text-[10px] font-bold text-muted-foreground hover:bg-muted uppercase tracking-tight flex items-center justify-between"
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
      </section>

      {/* Technical Footer */}
      <footer className="pt-10 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <Info size={12} />
            Data Integrity Protocol
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            Verified corrections are batch-processed for model retraining. 
            The current architecture utilizes Logistic Regression with TF-IDF N-grams (1,2) vectorization.
          </p>
        </div>
        <div className="flex items-center md:justify-end gap-10">
          <div className="space-y-1 text-right">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Model Engine</span>
            <span className="text-[11px] font-mono font-bold text-foreground">SKLEARN::LOGISTIC_REGRESSION</span>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Vectorization</span>
            <span className="text-[11px] font-mono font-bold text-foreground">TFIDF_VECTORIZER_V2</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

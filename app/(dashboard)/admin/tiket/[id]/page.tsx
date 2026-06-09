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
import { 
  ArrowLeft, Paperclip, Clock, Loader2, 
  Cpu, MessageSquare,
  ChevronRight, FileText, AlertTriangle, Terminal, Activity, Database, ArrowRight, SlidersHorizontal
} from 'lucide-react'
import { clsx } from 'clsx'

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
      if (!res.ok) throw new Error('Failed to fetch ticket resources')
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
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    async function fetchAll() {
      await fetchTicketAndAdmins()
    }
    void fetchAll()
  }, [fetchTicketAndAdmins])

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab)
    router.replace(`?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Accessing Resource Registry</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-border rounded-xl bg-card max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 mb-6">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">Resource Not Found</h2>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">The requested ticket could not be located in the production database.</p>
        <button 
          onClick={() => router.push('/admin')} 
          className="mt-8 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all uppercase tracking-widest"
        >
          Return to Registry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Technical Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-b border-border pb-10">
        <div className="space-y-3">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em] mb-4 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-foreground tracking-tight tabular-nums">
              ID:<span className="text-muted-foreground">{ticket.ticket_number}</span>
            </h1>
            <StatusBadge status={ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed'} />
          </div>
          <p className="text-muted-foreground text-sm font-medium max-w-xl leading-relaxed">
            Detailed resource inspection and interaction terminal. 
            All modifications are logged to the production audit trail.
          </p>
        </div>

        <div className="flex bg-muted p-1 rounded-lg border border-border">
          <button
            onClick={() => setTab('info')}
            className={clsx(
              "px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2",
              activeTab === 'info' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText size={12} />
            Diagnostics
          </button>
          <button
            onClick={() => setTab('chat')}
            className={clsx(
              "px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2",
              activeTab === 'chat' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare size={12} />
            Terminal
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-10"
              >
                {/* Core Registry Info */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                    <Database size={16} className="text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Resource Descriptor</h2>
                  </div>
                  
                  <div className="p-8 space-y-10">
                    <h3 className="text-2xl font-bold text-foreground leading-tight">{ticket.title}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Principal</p>
                        <p className="text-xs font-bold text-foreground uppercase">
                          {ticket.is_anonymous ? 'Principal: Anon' : ticket.reporter?.full_name}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Division</p>
                        <p className="text-xs font-bold text-foreground uppercase">{ticket.department || 'General'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Classification</p>
                        <p className="text-xs font-bold text-foreground uppercase">{ticket.category}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Priority</p>
                        <PriorityBadge priority={ticket.priority as 'low' | 'normal' | 'urgent'} overridden={ticket.priority_overridden} />
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-border">
                      <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Input Analysis</p>
                      <div className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-6 rounded-xl border border-border whitespace-pre-wrap font-medium">
                        {ticket.description}
                      </div>
                    </div>

                    {ticket.attachment_url && (
                      <div className="pt-8 border-t border-border">
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">Object Attachment</p>
                        <a
                          href={ticket.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95"
                        >
                          <Paperclip size={14} />
                          Open Resource File
                          <ArrowRight size={14} className="ml-2" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Trail - Timeline */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                    <Activity size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Deployment Lifecycle</h3>
                  </div>
                  <div className="p-8">
                    <div className="space-y-10 relative pl-6 border-l-2 border-border ml-2">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-foreground border-4 bg-card rounded-full ring-1 ring-foreground"></div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-tight">Deployment: Initialized</p>
                        <p className="text-[10px] font-mono font-bold text-muted-foreground mt-1">{new Date(ticket.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      
                      {ticket.status !== 'open' && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-muted-foreground border-4 bg-card rounded-full ring-1 ring-muted-foreground"></div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-tight">State: Processing</p>
                          <p className="text-[10px] font-mono font-bold text-muted-foreground mt-1">Resource transition to active monitoring</p>
                        </div>
                      )}
                      
                      {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-emerald-500 border-4 bg-card rounded-full ring-1 ring-emerald-500"></div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-tight">Lifecycle: Finalized</p>
                          <p className="text-[10px] font-mono font-bold text-muted-foreground mt-1">
                            {ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString('en-US') : 'Completion timestamp missing'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]"
              >
                <div className="p-6 border-b border-border bg-secondary/50 backdrop-blur-md text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-emerald-500" />
                    <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em]">Secure Session // Interactive</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Live</span>
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

        {/* Technical Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="sticky top-10 space-y-8">
            <div className="bg-muted border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={14} className="text-foreground" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Control Interface</h3>
              </div>
              <TicketActions 
                ticketId={ticket.id}
                initialStatus={ticket.status}
                initialPriority={ticket.priority}
                initialAssignedTo={ticket.assigned_to}
                admins={admins}
                onSuccess={fetchTicketAndAdmins}
              />
            </div>

            {/* SLA Target Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SLA Protocol</span>
                <Clock size={14} className="text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="font-mono text-sm font-bold text-foreground tabular-nums">
                  <SlaIndicator deadline={ticket.sla_deadline} />
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Deadline</div>
              </div>
            </div>

            {/* AI Inference Insight */}
            {ticket.ml_confidence !== null && (
              <div className="bg-secondary/50 backdrop-blur-md rounded-xl p-6 text-foreground border border-border shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-muted-foreground" />
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">ML Inference</p>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Static Analysis</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-mono font-bold leading-none tabular-nums text-foreground">{Math.round(ticket.ml_confidence * 100)}%</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-1">Confidence</span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${ticket.ml_confidence * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Inference Model</span>
                  <p className="text-[10px] font-mono font-bold text-foreground">LR_TFIDF_V2.DEPLOYED</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

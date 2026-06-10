'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ShieldCheck } from 'lucide-react'

interface TicketActionsProps {
  ticketId: string
  initialStatus: string
  initialPriority: string
  initialAssignedTo: string | null
  admins: { id: string; full_name: string }[]
  onSuccess: () => void
}

export function TicketActions({
  ticketId,
  initialStatus,
  initialPriority,
  initialAssignedTo,
  admins,
  onSuccess
}: TicketActionsProps) {
  const [status, setStatus] = useState(initialStatus)
  const [priority, setPriority] = useState(initialPriority)
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo || '')
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Sync state with props
  useEffect(() => {
    setStatus(initialStatus)
    setPriority(initialPriority)
    setAssignedTo(initialAssignedTo || '')
  }, [initialStatus, initialPriority, initialAssignedTo])

  const handleUpdate = async (field: 'status' | 'priority' | 'assigned_to', value: string) => {
    setLoading(true)
    setMessage(null)

    const oldValue = field === 'status' ? status : field === 'priority' ? priority : assignedTo;
    
    if (field === 'status') setStatus(value)
    if (field === 'priority') setPriority(value)
    if (field === 'assigned_to') setAssignedTo(value)

    try {
      const payload: any = {}
      if (field === 'assigned_to') {
        payload[field] = value === '' ? null : value
      } else {
        payload[field] = value
      }

      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Gagal menyimpan perubahan')
      }

      setMessage({ type: 'success', text: 'Perubahan berhasil diterapkan' })
      onSuccess()
      
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      if (field === 'status') setStatus(oldValue)
      if (field === 'priority') setPriority(oldValue)
      if (field === 'assigned_to') setAssignedTo(oldValue)
      
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Select Status */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Workflow Status</label>
        <div className="relative group">
          <select
            value={status}
            onChange={(e) => handleUpdate('status', e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-10 py-3.5 bg-muted border border-border/40 rounded-2xl text-[14px] font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-card transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="open">Open</option>
            <option value="in_progress">Processing</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Archived</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Select Priority */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Criticality Level</label>
        <div className="relative group">
          <select
            value={priority}
            onChange={(e) => handleUpdate('priority', e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-10 py-3.5 bg-muted border border-border/40 rounded-2xl text-[14px] font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-card transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="low">Low Priority</option>
            <option value="normal">Standard Priority</option>
            <option value="urgent">Urgent Escalation</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Select Assignee */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Responsible Officer</label>
        <div className="relative group">
          <select
            value={assignedTo}
            onChange={(e) => handleUpdate('assigned_to', e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-10 py-3.5 bg-muted border border-border/40 rounded-2xl text-[14px] font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-card transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Belum Ditugaskan</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.full_name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Messaging Area */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4"
          >
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            Sinkronisasi...
          </motion.div>
        )}
        
        {message && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`flex items-center gap-2 text-xs font-bold mt-4 p-3 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

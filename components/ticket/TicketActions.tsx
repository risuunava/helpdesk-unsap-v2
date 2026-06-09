'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, CheckCircle2, AlertCircle, UserCircle2, ShieldCheck, Zap } from 'lucide-react'

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

  const handleUpdate = async (field: 'status' | 'priority' | 'assigned_to', value: string) => {
    setLoading(true)
    setMessage(null)

    if (field === 'status') setStatus(value)
    if (field === 'priority') setPriority(value)
    if (field === 'assigned_to') setAssignedTo(value)

    try {
      const payload: any = {}
      if (value !== '') {
        payload[field] = value
      } else if (field === 'assigned_to') {
        return
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
      if (field === 'status') setStatus(initialStatus)
      if (field === 'priority') setPriority(initialPriority)
      if (field === 'assigned_to') setAssignedTo(initialAssignedTo || '')
      
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-[2.5rem] border border-border/60 p-8 shadow-glass space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-muted blur-3xl rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2.5 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Management Actions
        </h3>

        <div className="space-y-6">
          {/* Select Status */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Workflow Status</label>
            <div className="relative group">
              <select
                value={status}
                onChange={(e) => handleUpdate('status', e.target.value)}
                disabled={loading}
                className="w-full pl-4 pr-10 py-3.5 bg-muted border border-border/40 rounded-2xl text-[14px] font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 focus:bg-card transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="open">Open</option>
                <option value="in_progress">Processing</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Archived</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-indigo-500 transition-colors">
                <Zap size={16} />
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
                className="w-full pl-4 pr-10 py-3.5 bg-muted border border-border/40 rounded-2xl text-[14px] font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 focus:bg-card transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Standard Priority</option>
                <option value="urgent">Urgent Escalation</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-indigo-500 transition-colors">
                <AlertCircle size={16} />
              </div>
            </div>
            {priority !== initialPriority && !loading && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-bold text-amber-600 flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg w-fit"
              >
                Manual Override Active
              </motion.p>
            )}
          </div>

          {/* Select Assignee */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Responsible Officer</label>
            <div className="relative group">
              <select
                value={assignedTo}
                onChange={(e) => handleUpdate('assigned_to', e.target.value)}
                disabled={loading}
                className="w-full pl-4 pr-10 py-3.5 bg-muted border border-border/40 rounded-2xl text-[14px] font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 focus:bg-card transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>Select Assignee</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-indigo-500 transition-colors">
                <UserCircle2 size={16} />
              </div>
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
              className="flex items-center justify-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-8"
            >
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              Updating Metadata...
            </motion.div>
          )}
          
          {message && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-3 text-sm font-bold mt-8 p-4 rounded-[1.2rem] border ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

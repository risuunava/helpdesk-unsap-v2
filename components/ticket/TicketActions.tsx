'use client'

import React, { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

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

    // Optimistic UI update
    if (field === 'status') setStatus(value)
    if (field === 'priority') setPriority(value)
    if (field === 'assigned_to') setAssignedTo(value)

    try {
      const payload: any = {}
      if (value !== '') {
        payload[field] = value
      } else if (field === 'assigned_to') {
        // Handle unassign (if needed, but our schema usually expects a UUID, so we might need special handling. For now, we omit it or send null)
        // Since updateTicketSchema doesn't explicitly allow null for assigned_to, we just don't allow unassigning once assigned, or we bypass.
        // Let's assume we can't unassign for now.
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

      setMessage({ type: 'success', text: 'Perubahan berhasil disimpan' })
      onSuccess()
      
      // Auto-hide success message
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      // Revert state
      if (field === 'status') setStatus(initialStatus)
      if (field === 'priority') setPriority(initialPriority)
      if (field === 'assigned_to') setAssignedTo(initialAssignedTo || '')
      
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg-surface rounded-2xl border border-border p-6 shadow-capsule space-y-5">
      <h3 className="font-bold text-text-primary mb-2">Tindakan</h3>

      {/* Select Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted uppercase">Status Tiket</label>
        <select
          value={status}
          onChange={(e) => handleUpdate('status', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent disabled:opacity-50"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Select Priority */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted uppercase">Prioritas</label>
        <select
          value={priority}
          onChange={(e) => handleUpdate('priority', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent disabled:opacity-50"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </select>
        {priority !== initialPriority && !loading && (
          <p className="text-[11px] text-warning flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            Anda mengesampingkan prioritas bawaan
          </p>
        )}
      </div>

      {/* Select Assignee */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted uppercase">Penanggung Jawab</label>
        <select
          value={assignedTo}
          onChange={(e) => handleUpdate('assigned_to', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent disabled:opacity-50"
        >
          <option value="" disabled>Belum Ditugaskan</option>
          {admins.map(admin => (
            <option key={admin.id} value={admin.id}>
              {admin.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages / Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-muted mt-4">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          Menyimpan...
        </div>
      )}
      
      {message && !loading && (
        <div className={`flex items-center gap-2 text-sm mt-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-[#ECFDF5] text-success' : 'bg-[#FEF2F2] text-error'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}
    </div>
  )
}

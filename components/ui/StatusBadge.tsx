import React from 'react'

export function StatusBadge({ status }: { status: 'open' | 'in_progress' | 'resolved' | 'closed' }) {
  const config = {
    open: { bg: 'bg-[#FEF3C7]', text: 'text-warning', border: 'border-[#FDE68A]', label: 'OPEN' },
    in_progress: { bg: 'bg-[#EFF6FF]', text: 'text-info', border: 'border-[#BFDBFE]', label: 'IN PROGRESS' },
    resolved: { bg: 'bg-[#ECFDF5]', text: 'text-success', border: 'border-[#A7F3D0]', label: 'RESOLVED' },
    closed: { bg: 'bg-bg-overlay', text: 'text-text-muted', border: 'border-border', label: 'CLOSED' },
  }
  const c = config[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-body font-semibold uppercase tracking-wider ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  )
}

import React from 'react'

export function PriorityBadge({ priority, overridden }: { priority: 'low' | 'normal' | 'urgent', overridden?: boolean }) {
  const config = {
    low: { dot: 'bg-text-muted', label: 'LOW', chipBg: 'bg-bg-overlay', chipText: 'text-text-secondary', chipBorder: 'border-border' },
    normal: { dot: 'bg-info', label: 'NORMAL', chipBg: 'bg-[#EFF6FF]', chipText: 'text-info', chipBorder: 'border-[#BFDBFE]' },
    urgent: { dot: 'bg-error shadow-[0_0_6px_rgba(192,57,43,0.5)]', label: 'URGENT', chipBg: 'bg-[#FEF2F2]', chipText: 'text-error', chipBorder: 'border-[#FECACA]' },
  }
  const c = config[priority]

  return (
    <span className={`inline-flex items-center gap-1.5 ${c.chipBg} border ${c.chipBorder} rounded-full px-2.5 py-1 text-[11px] font-body font-semibold uppercase tracking-wider ${c.chipText} shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
      {overridden && <span className="ml-0.5 normal-case tracking-normal" title="Prioritas dioverride">⚠️</span>}
    </span>
  )
}

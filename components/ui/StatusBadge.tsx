import React from 'react'

export function StatusBadge({ status }: { status: 'open' | 'in_progress' | 'resolved' | 'closed' }) {
  const config = {
    open: { 
      chipClass: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400', 
      label: 'OPEN' 
    },
    in_progress: { 
      chipClass: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400', 
      label: 'IN PROGRESS' 
    },
    resolved: { 
      chipClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400', 
      label: 'RESOLVED' 
    },
    closed: { 
      chipClass: 'bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-400', 
      label: 'CLOSED' 
    },
  }
  const c = config[status]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${c.chipClass}`}>
      {c.label}
    </span>
  )
}

import React from 'react'

export function PriorityBadge({ priority, overridden }: { priority: 'low' | 'normal' | 'urgent', overridden?: boolean }) {
  const config = {
    low: { 
      dot: 'bg-slate-500', 
      label: 'LOW', 
      chipClass: 'bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-400' 
    },
    normal: { 
      dot: 'bg-blue-500', 
      label: 'NORMAL', 
      chipClass: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400' 
    },
    urgent: { 
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]', 
      label: 'URGENT', 
      chipClass: 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400' 
    },
  }
  const c = config[priority]

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.chipClass} shrink-0`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {c.label}
      {overridden && <span className="ml-1 text-[8px]" title="Prioritas dioverride">⚠️</span>}
    </span>
  )
}

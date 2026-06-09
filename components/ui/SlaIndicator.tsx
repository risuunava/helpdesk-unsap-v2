import React from 'react'
import { Clock } from 'lucide-react'

export function SlaIndicator({ deadline }: { deadline: Date | string | null }) {
  if (!deadline) return null

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  let dotClass = 'bg-emerald-500'
  let bgClass = 'bg-emerald-500/10 border-emerald-500/20'
  let textClass = 'text-emerald-700 dark:text-emerald-400'
  
  if (diffHours <= 0) {
    dotClass = 'bg-rose-500 animate-pulse'
    bgClass = 'bg-rose-500/10 border-rose-500/20'
    textClass = 'text-rose-700 dark:text-rose-400'
  } else if (diffHours < 4) {
    dotClass = 'bg-rose-500'
    bgClass = 'bg-rose-500/10 border-rose-500/20'
    textClass = 'text-rose-700 dark:text-rose-400'
  } else if (diffHours < 12) {
    dotClass = 'bg-amber-500'
    bgClass = 'bg-amber-500/10 border-amber-500/20'
    textClass = 'text-amber-700 dark:text-amber-400'
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${bgClass}`}>
      <div className={`w-1 h-1 rounded-full ${dotClass}`} />
      <span className={`text-[10px] font-bold uppercase tracking-tight ${textClass}`}>
        {diffHours <= 0 ? 'Overdue' : deadlineDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
      </span>
    </div>
  )
}

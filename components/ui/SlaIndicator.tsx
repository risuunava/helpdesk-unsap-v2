import React from 'react'
import { Clock } from 'lucide-react'

export function SlaIndicator({ deadline }: { deadline: Date | string | null }) {
  if (!deadline) return null

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  let dotClass = 'bg-success'
  let bgClass = 'bg-[#ECFDF5]'
  
  if (diffHours <= 0 || diffHours < 4) {
    dotClass = 'bg-error animate-[sla-pulse_1.5s_ease-in-out_infinite]'
    bgClass = 'bg-[#FEF2F2]'
  } else if (diffHours < 12) {
    dotClass = 'bg-warning'
    bgClass = 'bg-[#FEF3C7]'
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bgClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <Clock size={12} className="text-text-muted" />
      <span className="text-[12px] text-text-secondary font-body font-medium">
        {deadlineDate.toLocaleString('id-ID')}
      </span>
    </div>
  )
}

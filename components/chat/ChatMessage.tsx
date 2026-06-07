import React from 'react'
import { Message } from '@/hooks/useChat'
import { User, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'

interface ChatMessageProps {
  message: Message
  isSelf: boolean
}

export function ChatMessage({ message, isSelf }: ChatMessageProps) {
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      ...(!isToday && { weekday: 'short' })
    })
  }

  const isAdmin = message.sender?.role === 'admin' || message.sender?.role === 'master_admin'

  return (
    <div className={clsx(
      'flex w-full gap-3 group animate-in fade-in slide-in-from-bottom-1 duration-300',
      isSelf ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      {!isSelf && (
        <div className={clsx(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110",
          isAdmin ? "bg-indigo-900 border-indigo-800 text-white" : "bg-zinc-100 border-zinc-200 text-zinc-400"
        )}>
          {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
        </div>
      )}

      {/* Bubble */}
      <div className={clsx(
        'flex flex-col max-w-[85%]',
        isSelf ? 'items-end' : 'items-start'
      )}>
        {!isSelf && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
              {message.sender?.full_name || 'Anonymous User'}
            </span>
            {isAdmin && <span className="text-[8px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">Staff</span>}
          </div>
        )}

        <div className={clsx(
          'px-5 py-3 rounded-[1.5rem] text-[14px] font-medium leading-relaxed break-words shadow-sm',
          isSelf 
            ? 'bg-zinc-900 text-white rounded-tr-none' 
            : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-100'
        )}>
          {message.content}
        </div>

        <span className="text-[9px] font-bold text-zinc-400 mt-1.5 px-2 uppercase tracking-tighter">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}

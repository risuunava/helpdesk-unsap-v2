import React from 'react'
import { Message } from '@/hooks/useChat'
import { User } from 'lucide-react'
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
    
    if (isToday) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
    
    return date.toLocaleTimeString('id-ID', { 
      weekday: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={clsx(
      'flex w-full mb-4 gap-3',
      isSelf ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      {!isSelf && (
        <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-text-muted" />
        </div>
      )}

      {/* Bubble */}
      <div className={clsx(
        'flex flex-col max-w-[80%]',
        isSelf ? 'items-end' : 'items-start'
      )}>
        {/* Name (for others) */}
        {!isSelf && (
          <span className="text-[11px] font-semibold text-text-muted mb-1 px-1">
            {message.sender?.full_name || 'Anonim'}
          </span>
        )}

        <div className={clsx(
          'px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words',
          isSelf 
            ? 'bg-emerald-800 text-white rounded-tr-none' 
            : 'bg-bg-elevated text-text-primary rounded-tl-none border border-border'
        )}>
          {message.content}
        </div>

        <span className="text-[10px] text-text-muted mt-1 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}

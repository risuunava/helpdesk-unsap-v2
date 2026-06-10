'use client'

import React from 'react'
import { Message } from '@/hooks/useChat'
import { User, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className={cn(
      'flex w-full gap-3 group animate-in fade-in slide-in-from-bottom-1 duration-300',
      isSelf ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      {!isSelf && (
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 shadow-sm",
          isAdmin ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
        )}>
          {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
        </div>
      )}

      {/* Bubble */}
      <div className={cn(
        'flex flex-col max-w-[80%]',
        isSelf ? 'items-end' : 'items-start'
      )}>
        {!isSelf && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
              {message.sender?.full_name || 'User'}
            </span>
            {isAdmin && (
              <span className="text-[8px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                Petugas
              </span>
            )}
          </div>
        )}

        <div className={cn(
          'px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed break-words shadow-sm',
          isSelf 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : 'bg-card text-foreground rounded-tl-none border border-border/50 shadow-glass'
        )}>
          {message.content}
        </div>

        <span className="text-[9px] font-bold text-muted-foreground mt-1.5 px-2 uppercase tracking-widest opacity-60">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}

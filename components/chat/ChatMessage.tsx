'use client'

import React from 'react'
import { Message } from '@/hooks/useChat'
import { ShieldCheck, User } from 'lucide-react'
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
      ...(!isToday && { day: '2-digit', month: 'short' }),
    })
  }

  const isAdmin = message.sender?.role === 'admin' || message.sender?.role === 'master_admin'

  return (
    <div className={cn(
      'flex w-full gap-2.5',
      isSelf ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      {!isSelf && (
        <div className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center shrink-0 border",
          isAdmin
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-muted border-border text-muted-foreground"
        )}>
          {isAdmin ? <ShieldCheck size={13} /> : <User size={13} />}
        </div>
      )}

      <div className={cn(
        'flex flex-col max-w-[78%]',
        isSelf ? 'items-end' : 'items-start'
      )}>
        {!isSelf && (
          <div className="flex items-center gap-1.5 mb-1 px-0.5">
            <span className="text-[10px] font-semibold text-foreground">
              {message.sender?.full_name || 'User'}
            </span>
            {isAdmin && (
              <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tight border border-primary/15">
                Petugas
              </span>
            )}
          </div>
        )}

        <div className={cn(
          'px-3 py-2 rounded-md text-sm leading-relaxed break-words',
          isSelf
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted text-foreground rounded-tl-none border border-border/60'
        )}>
          {message.content}
        </div>

        <span className="text-[10px] text-muted-foreground mt-1 px-0.5 opacity-70">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}

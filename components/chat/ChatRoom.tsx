'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatRoomProps {
  ticketId: string
  currentUserId: string
}

export function ChatRoom({ ticketId, currentUserId }: ChatRoomProps) {
  const { messages, isLoading, error, sendMessage } = useChat(ticketId)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      await sendMessage(input)
      setInput('')
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs text-muted-foreground">Memuat pesan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center border border-border">
              <MessageSquare className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Belum ada pesan</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                Mulai diskusi dengan tim bantuan terkait laporan ini.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isSelf={msg.sender_id === currentUserId}
            />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-card border-t border-border/60">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              rows={1}
              className="min-h-[40px] max-h-28 rounded-md border-border/60 bg-muted/40 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all resize-none text-sm py-2.5 pr-2"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${target.scrollHeight}px`
              }}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-md shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}

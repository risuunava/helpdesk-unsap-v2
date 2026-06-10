'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { MessageSquare, Send, Loader2, Wifi, WifiOff, Layout } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChatRoomProps {
  ticketId: string
  currentUserId: string
}

export function ChatRoom({ ticketId, currentUserId }: ChatRoomProps) {
  const { messages, isLoading, isConnected, sendMessage, error } = useChat(ticketId)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
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
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-muted/20 scroll-smooth custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Menghubungkan...</span>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-8"
            >
              <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center mb-4 border border-border shadow-sm">
                <MessageSquare className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Ruang Diskusi</h4>
              <p className="text-[11px] text-muted-foreground mt-2 max-w-[200px] leading-relaxed font-medium">
                Mulai diskusi formal dengan tim bantuan terkait laporan Anda.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatMessage 
                  message={msg} 
                  isSelf={msg.sender_id === currentUserId} 
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border/60">
        <form 
          onSubmit={handleSend}
          className="relative flex items-end gap-2"
        >
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan balasan..."
              rows={1}
              className="min-h-[50px] max-h-32 rounded-2xl border-border/60 bg-muted/50 focus-visible:ring-primary/10 transition-all resize-none font-medium pr-12 text-sm py-3"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${target.scrollHeight}px`
              }}
            />
            <div className="absolute right-2 bottom-1.5 flex items-center h-[38px]">
              <Button 
                type="submit"
                size="icon"
                disabled={!input.trim() || sending}
                className="w-9 h-9 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
        
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 animate-pulse'
            )} />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              {isConnected ? 'Sinyal Aktif' : 'Terputus'}
            </span>
          </div>
          {error && <p className="text-[9px] font-bold text-destructive uppercase tracking-tighter">{error}</p>}
        </div>
      </div>
    </div>
  )
}

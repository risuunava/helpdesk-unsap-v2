'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { MessageSquare, Send, Loader2, Wifi, WifiOff, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

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
    <div className="flex flex-col h-[600px] bg-card">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/30 scroll-smooth custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Securing Connection</span>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-8"
            >
              <div className="w-16 h-16 bg-card rounded-3xl flex items-center justify-center mb-4 border border-border shadow-sm">
                <Sparkles className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Channel Established</h4>
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px] leading-relaxed font-medium">
                Mulai diskusi aman dengan tim admin terkait laporan ini.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
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
      <div className="p-6 bg-card border-t border-border">
        <form 
          onSubmit={handleSend}
          className="relative group"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan balasan..."
            rows={1}
            className="w-full pl-6 pr-16 py-4 text-[14px] font-medium rounded-2xl border-none bg-muted focus:ring-4 focus:ring-primary/5 focus:bg-card transition-all resize-none max-h-32 placeholder:text-muted-foreground/50 text-foreground"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${target.scrollHeight}px`
            }}
          />
          <div className="absolute right-2 bottom-2">
            <button 
              type="submit"
              disabled={!input.trim() || sending}
              className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 ml-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 animate-pulse'}`} />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              {isConnected ? 'Signal Active' : 'Disconnected'}
            </span>
          </div>
          {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{error}</p>}
        </div>
      </div>
    </div>
  )
}

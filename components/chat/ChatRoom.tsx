'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { MessageSquare, Send, Loader2, Wifi, WifiOff } from 'lucide-react'

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
    <div className="bg-bg-surface rounded-2xl border border-border flex flex-col h-[500px] lg:h-[600px] shadow-capsule overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-bg-surface">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-text-primary">Diskusi Tiket</h3>
        </div>
        
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-wider">
              <Wifi className="w-3 h-3" />
              Terhubung
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider animate-pulse">
              <WifiOff className="w-3 h-3" />
              Menyambungkan...
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-bg-base/30 scroll-smooth"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-text-muted">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs">Memuat pesan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 bg-bg-elevated rounded-full flex items-center justify-center mb-3 border border-border">
              <MessageSquare className="w-6 h-6 text-text-muted opacity-50" />
            </div>
            <h4 className="text-sm font-medium text-text-primary">Belum ada pesan</h4>
            <p className="text-xs text-text-muted mt-1">
              Mulai percakapan dengan admin di sini.
            </p>
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

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="p-4 border-t border-border bg-bg-surface"
      >
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              rows={1}
              className="w-full px-4 py-2.5 text-[14px] rounded-xl border border-border bg-bg-base focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none max-h-32"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${target.scrollHeight}px`
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        {error && <p className="text-[10px] text-error mt-1 px-1">{error}</p>}
      </form>
    </div>
  )
}

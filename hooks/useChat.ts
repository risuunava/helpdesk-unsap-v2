'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: { 
    id: string; 
    full_name: string; 
    role: string;
  } | null
}

export function useChat(ticketId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?ticket_id=${ticketId}`)
      if (!res.ok) {
        throw new Error('Gagal mengambil pesan')
      }
      const data = await res.json()
      setMessages(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    if (ticketId) {
      fetchMessages()
    }
  }, [fetchMessages, ticketId])

  useEffect(() => {
    if (!ticketId) return

    const channel = supabase
      .channel(`ticket-chat-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          // Fetch the full message with sender details
          const { data: newMessage, error: fetchError } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, role)')
            .eq('id', payload.new.id)
            .single()
          
          if (!fetchError && newMessage) {
            setMessages((prev) => {
              if (prev.find(m => m.id === newMessage.id)) return prev
              return [...prev, newMessage]
            })
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, supabase])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, content }),
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal mengirim pesan')
      }

      const newMessage = await res.json()
      setMessages((prev) => {
        if (prev.find(m => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return { messages, isLoading, isConnected, error, sendMessage }
}

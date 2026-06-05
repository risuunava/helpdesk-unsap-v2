'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  reporter?: { full_name: string; avatar_url: string | null } | null
  assignee?: { full_name: string; avatar_url: string | null } | null
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tickets')
      if (!res.ok) {
        throw new Error('Gagal mengambil data tiket')
      }
      const data = await res.json()
      setTickets(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()

    // Realtime subscription
    const channel = supabase
      .channel('tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, (payload) => {
        // Simple strategy: refetch all to ensure relations are fetched
        fetchTickets()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTickets, supabase])

  return { tickets, loading, error, refetch: fetchTickets }
}

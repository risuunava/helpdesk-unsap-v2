'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AdminTicketFilters {
  search: string
  status: string
  priority: string
  category: string
}

interface AdminTicketSort {
  column: 'created_at' | 'priority' | 'status'
  direction: 'asc' | 'desc'
}

export function useAdminTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AdminTicketFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
  })
  const [sort, setSort] = useState<AdminTicketSort>({
    column: 'created_at',
    direction: 'desc',
  })

  const limit = 20
  const supabase = createClient()

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.category) params.set('category', filters.category)

      const res = await fetch(`/api/tickets?${params.toString()}`)
      if (!res.ok) throw new Error('Gagal mengambil data tiket')
      const json = await res.json()

      let data = json.data || []

      // Client-side search filter (title and ticket_number)
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter((t: any) =>
          t.title?.toLowerCase().includes(q) ||
          t.ticket_number?.toLowerCase().includes(q)
        )
      }

      // Client-side sort
      data.sort((a: any, b: any) => {
        const dir = sort.direction === 'asc' ? 1 : -1
        if (sort.column === 'created_at') {
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        }
        if (sort.column === 'priority') {
          const order: Record<string, number> = { urgent: 3, normal: 2, low: 1 }
          return dir * ((order[a.priority] || 0) - (order[b.priority] || 0))
        }
        if (sort.column === 'status') {
          const order: Record<string, number> = { open: 1, in_progress: 2, resolved: 3, closed: 4 }
          return dir * ((order[a.status] || 0) - (order[b.status] || 0))
        }
        return 0
      })

      setTickets(data)
      setTotalCount(json.meta?.total || data.length)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [page, filters, sort])

  useEffect(() => {
    fetchTickets()

    const channel = supabase
      .channel('admin_tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTickets, supabase])

  const updateFilter = (key: keyof AdminTicketFilters, value: string) => {
    setPage(1)
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setPage(1)
    setFilters({ search: '', status: '', priority: '', category: '' })
  }

  const toggleSort = (column: AdminTicketSort['column']) => {
    setSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  const totalPages = Math.ceil(totalCount / limit)

  return {
    tickets, loading, error, page, totalPages, totalCount,
    filters, sort,
    setPage, updateFilter, resetFilters, toggleSort,
    refetch: fetchTickets,
  }
}

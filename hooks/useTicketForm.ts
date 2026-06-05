'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createTicketSchema } from '@/lib/validations/ticket.schema'
import { z } from 'zod'

type TicketFormData = z.infer<typeof createTicketSchema>

interface UseTicketFormReturn {
  loading: boolean
  error: string | null
  fieldErrors: Record<string, string>
  success: boolean
  ticketNumber: string | null
  ticketId: string | null
  submitTicket: (data: TicketFormData, file?: File | null) => Promise<void>
  reset: () => void
}

export function useTicketForm(): UseTicketFormReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const reset = () => {
    setLoading(false)
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    setTicketNumber(null)
    setTicketId(null)
  }

  const submitTicket = async (data: TicketFormData, file?: File | null) => {
    setLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      // Client-side validation
      const validated = createTicketSchema.parse(data)

      const formData = new FormData()
      formData.append('title', validated.title)
      formData.append('description', validated.description)
      formData.append('category', validated.category)
      formData.append('department', validated.department)
      formData.append('is_anonymous', String(validated.is_anonymous))

      if (file) {
        formData.append('attachment', file)
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError('Anda sudah membuat 3 laporan hari ini. Silakan coba lagi besok.')
          return
        }
        if (Array.isArray(result.error)) {
          // Zod validation errors
          const errors: Record<string, string> = {}
          result.error.forEach((e: any) => {
            const field = e.path?.[0]
            if (field) errors[field] = e.message
          })
          setFieldErrors(errors)
          return
        }
        setError(result.error || 'Gagal membuat laporan.')
        return
      }

      setSuccess(true)
      setTicketNumber(result.data.ticket_number)
      setTicketId(result.data.id)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.issues.forEach((e: any) => {
          const field = e.path?.[0]
          if (field) errors[field] = e.message
        })
        setFieldErrors(errors)
      } else {
        setError(err.message || 'Terjadi kesalahan.')
      }
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, fieldErrors, success, ticketNumber, ticketId, submitTicket, reset }
}

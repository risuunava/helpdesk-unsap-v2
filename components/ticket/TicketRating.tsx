'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Star, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TicketRatingProps {
  ticketId: string
  initialRating: number | null
  onRatingSubmitted?: (rating: number) => void
  readonly?: boolean
}

export function TicketRating({
  ticketId,
  initialRating,
  onRatingSubmitted,
  readonly = false
}: TicketRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isReadOnly = readonly || initialRating != null || success

  const handleRate = async (selectedRating: number) => {
    if (isReadOnly || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/tickets/${ticketId}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: selectedRating })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim rating')
      }

      setRating(selectedRating)
      setSuccess(true)
      if (onRatingSubmitted) {
        onRatingSubmitted(selectedRating)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const displayRating = hoveredRating !== null ? hoveredRating : rating

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {isReadOnly ? 'Rating Pelayanan' : 'Berikan Rating Pelayanan'}
        </label>
        
        <div className="flex items-center gap-1.5" onMouseLeave={() => !isReadOnly && setHoveredRating(null)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isReadOnly || loading}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !isReadOnly && setHoveredRating(star)}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
                !isReadOnly && "hover:scale-110",
                isReadOnly && "cursor-default"
              )}
            >
              <Star
                size={28}
                className={cn(
                  "transition-all duration-300",
                  displayRating !== null && star <= displayRating
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "fill-muted text-muted-foreground/30",
                  loading && "opacity-50"
                )}
              />
            </button>
          ))}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-bold text-destructive"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs font-bold text-emerald-600"
          >
            <CheckCircle2 size={14} />
            Terima kasih atas penilaian Anda!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

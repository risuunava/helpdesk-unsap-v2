'use client'

import React, { useEffect, useState } from 'react'
import { Lightbulb, Loader2, X } from 'lucide-react'

interface FaqItem {
  faq_id: string
  score: number
  question: string
  answer?: string
}

interface FaqSuggestionProps {
  query: string
  onSelect?: (faq: FaqItem) => void
}

export function FaqSuggestion({ query, onSelect }: FaqSuggestionProps) {
  const [suggestions, setSuggestions] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)

    if (!query || query.length < 15) {
      setSuggestions([])
      return
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true)
      try {
        // Placeholder: dummy FAQ data for now (ML integration in B15)
        const dummyFaqs: FaqItem[] = [
          {
            faq_id: '1',
            score: 0.92,
            question: 'Bagaimana cara mengajukan cuti akademik?',
            answer: 'Cuti akademik dapat diajukan melalui SIAKAD paling lambat 2 minggu sebelum semester dimulai.'
          },
          {
            faq_id: '2',
            score: 0.85,
            question: 'Kapan batas pembayaran UKT semester ini?',
            answer: 'Batas pembayaran UKT dapat dilihat di portal mahasiswa UNSAP pada menu Keuangan > Tagihan.'
          },
          {
            faq_id: '3',
            score: 0.78,
            question: 'Bagaimana prosedur peminjaman ruang kelas?',
            answer: 'Peminjaman ruang kelas diajukan ke Bagian Sarana dan Prasarana minimal 3 hari sebelum penggunaan.'
          },
        ]

        // Simulate filtering based on query keywords
        const queryLower = query.toLowerCase()
        const filtered = dummyFaqs.filter(f =>
          queryLower.split(' ').some(word =>
            word.length > 3 && f.question.toLowerCase().includes(word)
          )
        )

        setSuggestions(filtered.length > 0 ? filtered : dummyFaqs.slice(0, 2))
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 600)

    return () => clearTimeout(debounceTimer)
  }, [query])

  if (dismissed || (!loading && suggestions.length === 0 && query.length < 15)) {
    return null
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-bg-surface p-4 transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Lightbulb className="w-4 h-4 text-warning" />
          <span>Mungkin sudah ada jawaban:</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-bg-overlay transition-colors text-text-muted hover:text-text-secondary"
          aria-label="Tutup saran"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-3 text-sm text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          Mencari FAQ terkait...
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-text-muted py-2">Tidak ada saran FAQ yang cocok.</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((faq) => (
            <button
              key={faq.faq_id}
              type="button"
              onClick={() => onSelect?.(faq)}
              className="w-full text-left p-3 rounded-lg border border-border hover:border-accent-subtle hover:bg-bg-elevated transition-all duration-200 group"
            >
              <p className="text-sm font-medium text-text-primary group-hover:text-accent">
                {faq.question}
              </p>
              {faq.answer && (
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {faq.answer}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-text-muted font-mono bg-bg-overlay px-1.5 py-0.5 rounded">
                  {Math.round(faq.score * 100)}% relevan
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

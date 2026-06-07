import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { suggestFaq } from '@/lib/ml'

export async function POST(request: NextRequest) {
  try {
    // Pastikan user sudah login
    await requireAuth()

    const body = await request.json()
    const { text } = body

    if (!text || text.length < 5) {
      return NextResponse.json({ suggestions: [] })
    }

    // Gunakan fungsi shared dari lib/ml.ts agar API Key konsisten
    const suggestions = await suggestFaq(text)

    return NextResponse.json({ suggestions })

  } catch (error: any) {
    console.error('Error in FAQ suggest route:', error)
    return NextResponse.json({ suggestions: [] })
  }
}

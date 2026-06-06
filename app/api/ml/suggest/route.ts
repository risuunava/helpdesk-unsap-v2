import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Ensure only logged-in users can request suggestions
    await requireAuth()

    const body = await request.json()
    const { text } = body

    if (!text || text.length < 5) {
      return NextResponse.json({ suggestions: [] })
    }

    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000'
    const mlKey = process.env.ML_API_KEY || 'dev-key-insecure'

    const res = await fetch(`${mlUrl}/faq-suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mlKey
      },
      body: JSON.stringify({ text, top_k: 3 })
    })

    if (!res.ok) {
      console.error('ML Service returned an error:', await res.text())
      return NextResponse.json({ suggestions: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error proxying to ML service:', error)
    return NextResponse.json({ suggestions: [] })
  }
}

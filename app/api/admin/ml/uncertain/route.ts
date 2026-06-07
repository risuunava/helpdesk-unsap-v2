import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    await requireRole(['admin', 'master_admin'])
    const supabase = await createClient()

    // 1. Get IDs of tickets already in training data
    const { data: trainedTickets } = await supabase
      .from('ml_training_data')
      .select('ticket_id')
      .not('ticket_id', 'is', null)

    const trainedIds = trainedTickets?.map(t => t.ticket_id) || []

    // 2. Get tickets with low confidence not in training data
    let query = supabase
      .from('tickets')
      .select('id, ticket_number, title, description, priority, ml_confidence, ml_model_version, created_at')
      .lt('ml_confidence', 0.7)
      .order('created_at', { ascending: false })
      .limit(20)

    if (trainedIds.length > 0) {
      query = query.not('id', 'in', `(${trainedIds.join(',')})`)
    }

    const { data: tickets, error } = await query

    if (error) throw error

    return NextResponse.json({ tickets })

  } catch (error: unknown) {
    console.error('Error in ML uncertain route:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

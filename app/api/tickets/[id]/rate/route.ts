import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    const { id } = await params

    const body = await request.json()
    const { rating } = body

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be a number between 1 and 5' }, { status: 400 })
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('reporter_id, status, rating')
      .eq('id', id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Only reporter can rate
    if (ticket.reporter_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. Only the reporter can rate this ticket.' }, { status: 403 })
    }

    // Must be resolved or closed
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return NextResponse.json({ error: 'Ticket must be resolved or closed to be rated.' }, { status: 400 })
    }

    // Prevent re-rating
    if (ticket.rating !== null) {
      return NextResponse.json({ error: 'Ticket has already been rated.' }, { status: 400 })
    }

    const { error: updateError } = await adminClient
      .from('tickets')
      .update({ rating })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, rating })

  } catch (error: any) {
    console.error('PATCH /api/tickets/[id]/rate error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

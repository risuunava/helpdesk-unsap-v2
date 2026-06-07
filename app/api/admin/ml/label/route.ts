import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole(['admin', 'master_admin'])
    const supabase = await createClient()

    const body = await request.json()
    const { ticketId, correctedLabel } = body

    if (!ticketId || !correctedLabel) {
      return NextResponse.json({ error: 'Missing ticketId or correctedLabel' }, { status: 400 })
    }

    // 1. Fetch ticket details
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('title, description, priority, ml_model_version')
      .eq('id', ticketId)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // 2. Insert into ml_training_data
    const { error: insertError } = await supabase
      .from('ml_training_data')
      .insert({
        ticket_id: ticketId,
        text_input: `${ticket.title} ${ticket.description}`,
        ml_prediction: ticket.priority, // Current priority is what ML predicted (or was manually set)
        corrected_label: correctedLabel,
        corrected_by: profile.id,
        model_version: ticket.ml_model_version
      })

    if (insertError) throw insertError

    // 3. Update ticket priority if it's different
    if (ticket.priority !== correctedLabel) {
      await supabase
        .from('tickets')
        .update({ 
          priority: correctedLabel,
          priority_overridden: true 
        })
        .eq('id', ticketId)
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    console.error('Error in ML label route:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

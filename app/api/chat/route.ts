import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const sendMessageSchema = z.object({
  ticket_id: z.string().uuid('ticket_id harus berformat UUID'),
  content: z.string().min(1, 'Pesan tidak boleh kosong').max(1000, 'Pesan maksimal 1000 karakter'),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticket_id')

    if (!ticketId) {
      return NextResponse.json({ error: 'ticket_id diperlukan' }, { status: 400 })
    }

    // Verify access to this ticket
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: ticket } = await supabase
      .from('tickets')
      .select('reporter_id, assigned_to')
      .eq('id', ticketId)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })
    }

    const isAdmin = profile?.role === 'admin' || profile?.role === 'master_admin'
    const isOwner = ticket.reporter_id === user.id
    const isAssignee = ticket.assigned_to === user.id

    if (!isAdmin && !isOwner && !isAssignee) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, role, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: messages })

  } catch (error: any) {
    console.error('GET /api/chat error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const rawData = await request.json()
    const validated = sendMessageSchema.parse(rawData)

    // Verify access to this ticket
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: ticket } = await supabase
      .from('tickets')
      .select('reporter_id, assigned_to')
      .eq('id', validated.ticket_id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })
    }

    const isAdmin = profile?.role === 'admin' || profile?.role === 'master_admin'
    const isOwner = ticket.reporter_id === user.id
    const isAssignee = ticket.assigned_to === user.id

    if (!isAdmin && !isOwner && !isAssignee) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        ticket_id: validated.ticket_id,
        sender_id: user.id,
        content: validated.content,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, role, avatar_url)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data: message }, { status: 201 })

  } catch (error: any) {
    console.error('POST /api/chat error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

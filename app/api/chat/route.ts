import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, profile } = await requireRole(['mahasiswa', 'admin', 'master_admin'])
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticket_id')

    if (!ticketId) {
      return NextResponse.json({ error: 'ticket_id diperlukan' }, { status: 400 })
    }

    const supabase = await createClient()

    // Cek akses ke tiket dan ambil info anonim
    const { data: ticket } = await supabase
      .from('tickets')
      .select('reporter_id, assigned_to, is_anonymous, anonymous_code')
      .eq('id', ticketId)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })
    }

    const hasAccess = ticket.reporter_id === user.id ||
                      ticket.assigned_to === user.id ||
                      ['admin', 'master_admin'].includes(profile.role)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, role)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Masking if anonymous
    const isMasterAdmin = profile.role === 'master_admin'
    const processedMessages = messages.map(msg => {
      const isReporter = msg.sender_id === ticket.reporter_id
      if (ticket.is_anonymous && isReporter && !isMasterAdmin && msg.sender_id !== user.id) {
        return {
          ...msg,
          sender: {
            ...msg.sender,
            full_name: ticket.anonymous_code || 'Anonim',
            id: 'hidden'
          }
        }
      }
      return msg
    })

    return NextResponse.json(processedMessages)

  } catch (error: any) {
    console.error('GET /api/chat error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireRole(['mahasiswa', 'admin', 'master_admin'])
    const { ticket_id, content } = await request.json()

    // Validasi
    if (!content?.trim() || content.length > 1000)
      return Response.json({ error: 'Pesan tidak valid' }, { status: 400 })

    // Cek akses ke tiket
    const supabase = await createClient()
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id, reporter_id, assigned_to, is_anonymous, anonymous_code')
      .eq('id', ticket_id)
      .single()

    if (!ticket) return Response.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })

    const hasAccess = ticket.reporter_id === user.id ||
                      ticket.assigned_to === user.id ||
                      ['admin', 'master_admin'].includes(profile.role)

    if (!hasAccess) return Response.json({ error: 'Akses ditolak' }, { status: 403 })

    const { data: message, error } = await supabase
      .from('messages')
      .insert({ ticket_id, sender_id: user.id, content: content.trim() })
      .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, role)')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Masking logic for POST response (though usually sender is the current user)
    const isMasterAdmin = profile.role === 'master_admin'
    const isReporter = message.sender_id === ticket.reporter_id
    if (ticket.is_anonymous && isReporter && !isMasterAdmin && message.sender_id !== user.id) {
      return Response.json({
        ...message,
        sender: {
          ...message.sender,
          full_name: ticket.anonymous_code || 'Anonim',
          id: 'hidden'
        }
      })
    }

    return Response.json(message)
  } catch (error: any) {
    console.error('POST /api/chat error:', error)
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

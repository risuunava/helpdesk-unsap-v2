import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { updateTicketSchema } from '@/lib/validations/ticket.schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()
    const { id } = await params

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        reporter:profiles!tickets_reporter_id_fkey(id, full_name, nim, role, department, avatar_url),
        assignee:profiles!tickets_assigned_to_fkey(id, full_name, nim, role, department, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Ownership validation
    const isOwner = ticket.reporter_id === user.id
    const isAdmin = profile.role === 'admin' || profile.role === 'master_admin'

    if (!isOwner && !isAdmin && ticket.assigned_to !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mask anonymous info
    if (ticket.is_anonymous && profile.role !== 'master_admin' && !isOwner) {
      ticket.reporter = {
        id: 'hidden',
        full_name: ticket.anonymous_code || 'Anonim',
        nim: 'hidden',
        role: 'mahasiswa',
        department: null,
        avatar_url: null
      }
    }

    return NextResponse.json({ data: ticket })

  } catch (error: any) {
    console.error('GET /api/tickets/[id] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()
    const { id } = await params

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'master_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rawData = await request.json()
    const validatedData = updateTicketSchema.parse(rawData)

    const updatePayload: any = { ...validatedData }

    if (validatedData.status === 'resolved') {
      updatePayload.resolved_at = new Date().toISOString()
    }
    
    if (validatedData.priority) {
      updatePayload.priority_overridden = true
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // --- NOTIFICATION LOGIC ---
    const adminClient = await createAdminClient()
    const notificationTitle = `Update Tiket ${ticket.ticket_number}`
    let notificationBody = ''

    if (validatedData.status) {
      if (validatedData.status === 'resolved') {
        notificationBody = `Status tiket Anda telah berubah menjadi SELESAI. Silakan berikan rating untuk pelayanan kami.`
      } else {
        notificationBody = `Status tiket Anda telah berubah menjadi ${validatedData.status.toUpperCase()}.`
      }
    } else if (validatedData.priority) {
      notificationBody = `Prioritas tiket Anda telah diubah menjadi ${validatedData.priority.toUpperCase()}.`
    } else if (validatedData.assigned_to) {
      notificationBody = `Tiket Anda telah ditugaskan ke admin baru.`
    }

    if (notificationBody && ticket.reporter_id) {
      await adminClient.from('notifications').insert({
        user_id: ticket.reporter_id,
        type: 'ticket_update',
        title: notificationTitle,
        body: notificationBody,
        ticket_id: ticket.id
      })
    }
    // --- END NOTIFICATION LOGIC ---

    return NextResponse.json({ data: ticket })

  } catch (error: any) {
    console.error('PATCH /api/tickets/[id] error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

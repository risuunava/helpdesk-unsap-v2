import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createTicketSchema } from '@/lib/validations/ticket.schema'
import { checkTicketRateLimit, incrementRateLimit } from '@/lib/rateLimit'
import { generateAnonymousCode } from '@/lib/anonymize'
import { classifyTicket } from '@/lib/ml'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const department = searchParams.get('department')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('tickets')
      .select(`
        *,
        reporter:profiles!tickets_reporter_id_fkey(id, full_name, nim, role, department, avatar_url),
        assignee:profiles!tickets_assigned_to_fkey(id, full_name, nim, role, department, avatar_url)
      `, { count: 'exact' })

    // Apply role-based filtering
    if (profile.role === 'mahasiswa') {
      query = query.eq('reporter_id', user.id)
    } else {
      // Admin/master_admin can see all, apply optional filters
      if (status) query = query.eq('status', status)
      if (priority) query = query.eq('priority', priority)
      if (category) query = query.eq('category', category)
      if (department) query = query.eq('department', department)
    }

    const { data: tickets, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Mask anonymous tickets
    const processedTickets = tickets.map(ticket => {
      if (ticket.is_anonymous && profile.role !== 'master_admin' && ticket.reporter_id !== user.id) {
        return {
          ...ticket,
          reporter: {
            id: 'hidden',
            full_name: ticket.anonymous_code || 'Anonim',
            nim: 'hidden',
            role: 'mahasiswa',
            department: null,
            avatar_url: null
          }
        }
      }
      return ticket
    })

    return NextResponse.json({
      data: processedTickets,
      meta: {
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    })

  } catch (error: any) {
    console.error('GET /api/tickets error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // 1. Check rate limit
    const isAllowed = await checkTicketRateLimit(user.id)
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Anda sudah mencapai batas maksimal pembuatan laporan (3/hari).' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      department: formData.get('department'),
      is_anonymous: formData.get('is_anonymous') === 'true'
    }

    // 2. Validate input
    const validatedData = createTicketSchema.parse(rawData)

    // 3. Upload attachment if present
    const file = formData.get('attachment') as File | null
    let attachment_url: string | null = null
    const ticketId = crypto.randomUUID()

    if (file && file.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Tipe file tidak diizinkan' }, { status: 400 })
      }
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'File maksimal 2MB' }, { status: 400 })
      }

      const ext = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(`${ticketId}/${fileName}`, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(`${ticketId}/${fileName}`)
      
      attachment_url = publicUrl
    }

    // 4. Prepare ticket data
    let anonymous_code = null
    if (validatedData.is_anonymous) {
      anonymous_code = generateAnonymousCode(user.id)
    }

    // 4.5 Classify priority with ML
    const textToClassify = `${validatedData.title}. ${validatedData.description}`
    const classification = await classifyTicket(textToClassify)
    
    const priority = classification?.priority || 'normal'
    const ml_confidence = classification?.confidence || null
    const ml_model_version = classification?.model_version || null

    const newTicket = {
      id: ticketId,
      reporter_id: user.id,
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      department: validatedData.department,
      is_anonymous: validatedData.is_anonymous,
      anonymous_code,
      attachment_url,
      status: 'open',
      priority,
      ml_confidence,
      ml_model_version
    }

    // 5. Insert into DB
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(newTicket)
      .select()
      .single()

    if (error) throw error

    // 6. Increment rate limit
    await incrementRateLimit(user.id)

    return NextResponse.json({ data: ticket }, { status: 201 })

  } catch (error: any) {
    console.error('POST /api/tickets error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

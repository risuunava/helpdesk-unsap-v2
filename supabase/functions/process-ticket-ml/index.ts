import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ML_URL = Deno.env.get('ML_SERVICE_URL') || 'http://host.docker.internal:8000'
const ML_KEY = Deno.env.get('ML_API_KEY') || 'dev-key-insecure'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const ticket = payload.record  // dari DB webhook (INSERT pada tabel tickets)

    if (!ticket?.id || !ticket?.title) {
      return new Response('Invalid payload', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const text = `${ticket.title} ${ticket.description}`

    // Panggil ML Service
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const mlRes = await fetch(`${ML_URL}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ML_KEY
        },
        body: JSON.stringify({ text }),
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (!mlRes.ok) {
        throw new Error(`ML service responded with status: ${mlRes.status}`)
      }

      const result = await mlRes.json()

      // Update tiket dengan hasil ML
      await supabase.from('tickets').update({
        priority: result.priority,
        ml_confidence: result.confidence,
        ml_model_version: result.model_version,
        priority_overridden: result.overridden_by_keyword || false,
      }).eq('id', ticket.id)

      // Kirim notifikasi ke semua admin dan master_admin
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'master_admin'])

      if (admins && admins.length > 0) {
        const notifications = admins.map(a => ({
          user_id: a.id,
          type: 'new_ticket',
          title: 'Laporan Baru Masuk',
          body: `${ticket.ticket_number}: ${ticket.title} (${result.priority.toUpperCase()})`,
          ticket_id: ticket.id
        }))
        await supabase.from('notifications').insert(notifications)
      }

      return new Response(JSON.stringify({ success: true, result }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (err: any) {
      clearTimeout(timeout)
      console.error('ML classification failed:', err.message)
      
      // Fallback: Notify admins anyway with normal priority
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'master_admin'])

      if (admins && admins.length > 0) {
        const notifications = admins.map(a => ({
          user_id: a.id,
          type: 'new_ticket',
          title: 'Laporan Baru Masuk (Tanpa ML)',
          body: `${ticket.ticket_number}: ${ticket.title}`,
          ticket_id: ticket.id
        }))
        await supabase.from('notifications').insert(notifications)
      }

      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 })
    }
  } catch (err: any) {
    console.error('Edge Function Error:', err)
    return new Response(err.message, { status: 500 })
  }
})

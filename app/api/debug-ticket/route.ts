import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase.from('tickets').select('id, ticket_number, rating')
  return NextResponse.json({ data, error })
}

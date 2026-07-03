import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ exists: false }, { status: 400 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/auth/users`)
  url.searchParams.set('email', `eq.${email.toLowerCase()}`)
  url.searchParams.set('select', 'id')

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
  })

  if (!response.ok) {
    return NextResponse.json({ exists: false }, { status: 500 })
  }

  const users = await response.json()
  const exists = Array.isArray(users) && users.length > 0

  return NextResponse.json({ exists })
}

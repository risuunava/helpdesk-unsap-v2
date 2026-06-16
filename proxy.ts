import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session — IMPORTANT: must call getUser() to refresh the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Proteksi route dashboard — redirect ke login jika belum auth
  if ((path.startsWith('/mahasiswa') || path.startsWith('/admin')) && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect jika sudah login tapi buka /login atau /register
  if ((path === '/login' || path === '/register') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (role === 'admin' || role === 'master_admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Default redirect untuk user yang sudah login (misal mahasiswa atau role belum diset)
    return NextResponse.redirect(new URL('/mahasiswa', request.url))
  }

  return response
}

export const config = {
  matcher: ['/mahasiswa/:path*', '/admin/:path*', '/login', '/register'],
}

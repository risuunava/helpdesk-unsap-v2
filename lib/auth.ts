import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Require authentication. Redirects to /login if no user session.
 * Use in Server Components or Server Actions.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require specific role(s). Redirects to /login if unauthorized.
 * Returns both the Supabase user and the profile row.
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/login')
  }

  return { user, profile }
}

/**
 * Get the current user's profile (or null if not authenticated).
 * Safe to call without forcing a redirect.
 */
export async function getCurrentProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

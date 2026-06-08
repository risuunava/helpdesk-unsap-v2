import { createClient } from '@/lib/supabase/server'

const ipCounts = new Map<string, { count: number, resetAt: number }>()

export function checkIpRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipCounts.get(ip)
  
  if (!record || now > record.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  
  if (record.count >= 2) return false
  
  record.count++
  return true
}

export async function checkTicketRateLimit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('ticket_rate_limits')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return !data || data.count < 3
}

export async function incrementRateLimit(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  await supabase.from('ticket_rate_limits')
    .upsert({ user_id: userId, date: today, count: 1 },
             { onConflict: 'user_id,date',
               ignoreDuplicates: false })
    .then(() => supabase.rpc('increment_rate_limit_count',
                             { p_user_id: userId, p_date: today }))
}

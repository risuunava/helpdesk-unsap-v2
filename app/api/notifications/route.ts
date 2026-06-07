import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

import type { Database } from '@/types/database'

export async function PATCH(request: Request) {
  try {
    const { notificationId, markAll } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (markAll) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ message: 'All notifications marked as read' })
    } else if (notificationId) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id) // Ensure user can only mark their own notifications as read

      if (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ message: `Notification ${notificationId} marked as read` })
    } else {
      return NextResponse.json({ error: 'Invalid request. Provide notificationId or set markAll to true.' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error in notifications PATCH route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

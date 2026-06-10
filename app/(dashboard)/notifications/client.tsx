'use client'

import React from 'react'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { Loader2, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

export default function NotificationsClient({ userId, role }: { userId: string; role: string }) {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications(userId)
  const router = useRouter()

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      markAsRead(notif.id)
    }

    if (notif.ticket_id) {
      const baseRoute = (role === 'admin' || role === 'master_admin') ? '/admin' : '/mahasiswa'
      router.push(`${baseRoute}/tiket/${notif.ticket_id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border rounded-xl bg-muted/10 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">Belum ada notifikasi</h3>
        <p className="text-muted-foreground text-sm">Anda akan menerima pemberitahuan ketika ada pembaruan pada tiket Anda.</p>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-border/50">
        <div className="text-sm font-medium text-muted-foreground">
          {unreadCount > 0 ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {unreadCount} pesan belum dibaca
            </span>
          ) : (
            <span>Semua pesan sudah dibaca</span>
          )}
        </div>
        <button 
          onClick={() => markAllAsRead()}
          disabled={unreadCount === 0}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 size={16} /> Tandai semua sudah dibaca
        </button>
      </div>
      
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => handleNotificationClick(notif)}
            className={`p-5 rounded-xl border transition-all cursor-pointer flex gap-4 ${
              notif.is_read 
                ? 'bg-background border-border/50 opacity-60' 
                : 'bg-muted/10 border-border shadow-sm hover:border-foreground/20 hover:bg-muted/30'
            }`}
          >
            <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              notif.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
            }`}>
              {notif.type === 'resolved' || notif.type === 'closed' ? <CheckCircle2 size={20} /> : 
               notif.type === 'alert' || notif.type === 'urgent' ? <AlertCircle size={20} /> : 
               <Info size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4 mb-1">
                <h4 className={`text-[15px] ${notif.is_read ? 'font-medium' : 'font-semibold'}`}>
                  {notif.title}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                  {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id }) : ''}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {notif.body}
              </p>
              {notif.ticket && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs font-mono font-medium text-muted-foreground">
                    Tiket: {notif.ticket.ticket_number}
                  </span>
                </div>
              )}
            </div>
            {!notif.is_read && (
              <div className="flex-shrink-0 self-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

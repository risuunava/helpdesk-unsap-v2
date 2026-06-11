"use client"

import { useState, useRef, useEffect } from 'react';
import { Bell, MailOpen } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale'; // For Indonesian locale

export function NotificationBell() {
  const { user } = useAuth(); // Get authenticated user
  const { profile } = useProfile();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close popover when clicking outside
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notificationId: string, ticketId: string | null) => {
    await markAsRead(notificationId);
    setIsOpen(false);
    
    if (ticketId) {
      const role = profile?.role || 'mahasiswa';
      const baseRoute = (role === 'admin' || role === 'master_admin') ? '/admin' : '/mahasiswa';
      router.push(`${baseRoute}/tiket/${ticketId}`);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" ref={popoverRef}>
        <div className="flex items-center justify-between p-3">
          <h4 className="font-medium text-sm">Notifikasi ({unreadCount})</h4>
          {unreadCount > 0 && (
            <Button variant="link" className="h-auto p-0 text-xs" onClick={markAllAsRead}>
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <Separator />
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">Memuat...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">Tidak ada notifikasi baru.</div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col gap-1 p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id, notification.ticket_id)}
              >
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-gray-600">{notification.body}</p>
                {notification.ticket && notification.ticket.ticket_number && (
                  <p className="text-xs text-gray-500">Tiket: {notification.ticket.ticket_number}</p>
                )}
                <p className="text-xs text-gray-400">
                  {notification.created_at ? (
                    formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: id })
                  ) : (
                    "Waktu tidak tersedia" // Default text for null created_at
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

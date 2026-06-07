import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { RealtimeChannel } from '@supabase/supabase-js'

export type Notification = Database['public']['Tables']['notifications']['Row'] & {
  ticket: {
    ticket_number: string;
  } | null;
};

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const channelRef = useRef<RealtimeChannel | null>(null);
  const uniqueChannelIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      uniqueChannelIdRef.current = null; // Clear unique ID on logout
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          ticket:tickets(ticket_number)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching notifications:', error)
        setNotifications([])
      } else {
        setNotifications(data || [])
      }

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)

      setUnreadCount(count || 0)
      setIsLoading(false)
    }

    fetchNotifications()

    if (!uniqueChannelIdRef.current) {
      uniqueChannelIdRef.current = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    const channelName = `notifications-${userId}-${uniqueChannelIdRef.current}`;

    const setupRealtimeChannel = async () => {
      const existingChannels = supabase.getChannels();
      for (const c of existingChannels) {
        if (c.topic.startsWith(`notifications-${userId}-`)) {
          await supabase.removeChannel(c);
        }
      }

      if (channelRef.current) {
         supabase.removeChannel(channelRef.current);
         channelRef.current = null;
      }

      channelRef.current = supabase.channel(channelName);

      channelRef.current
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${userId}`,
        }, async (payload) => {
          const newNotification = payload.new as Notification;
          if (newNotification.ticket_id) {
            const { data: ticketData, error: ticketError } = await supabase
              .from('tickets')
              .select('ticket_number')
              .eq('id', newNotification.ticket_id)
              .single();
            if (!ticketError && ticketData) {
              newNotification.ticket = ticketData;
            }
          }
          setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
        })
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
          if (updatedNotification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          } else {
            supabase
              .from('notifications')
              .select('*', { count: 'exact' })
              .eq('user_id', userId)
              .eq('is_read', false)
              .then(({ count }) => setUnreadCount(count || 0));
          }
        });

      channelRef.current.subscribe((status) => {
        // console.log(`Channel ${channelName} status:`, status);
      });
    };

    setupRealtimeChannel();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      // Do NOT clear uniqueChannelIdRef.current here, as useEffect might re-run with same userId
    };
  }, [userId, supabase]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);
    setUnreadCount(0);
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
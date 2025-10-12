import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!session) return;

    try {
      const [notificationsRes, updatesRes] = await Promise.all([
        fetch('/api/notifications/list'),
        fetch('/api/notifications/updates')
      ]);

      let totalUnread = 0;

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        totalUnread += notificationsData.notifications?.filter((n: any) => !n.isRead).length || 0;
      }

      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        totalUnread += updatesData.updates?.filter((u: any) => !u.isRead).length || 0;
      }

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

import { create } from 'zustand';
import { NotificationLog, INITIAL_NOTIFICATIONS } from '../data/initialNotifications';

const STORAGE_KEY = 'next_olymp_notifications_v2';

interface NotificationStore {
  notifications: NotificationLog[];
  sendNotification: (
    message: string,
    type: NotificationLog['type'],
    regionFilter?: string,
    userAudience?: string
  ) => void;
  addNotification: (notification: any) => void;
  deleteNotification: (id: string) => void;
  resetNotifications: () => void;
}

const loadNotificationsFromStorage = (): NotificationLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading notifications from localStorage:', error);
  }
  return [];
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: loadNotificationsFromStorage(),

  sendNotification: (message, type, regionFilter, userAudience) => {
    const current = get().notifications;
    const nextIdNum = 1001 + current.length;
    const id = `SMS-${nextIdNum}`;
    
    const now = new Date();
    const sentAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const smsCount = Math.ceil(message.length / 160) || 1;

    const newLog: NotificationLog = {
      id,
      phone: userAudience && userAudience !== 'all' ? '+998 90 555 77 88' : 'Ommaviy SMS (Barcha foydalanuvchilar)',
      userName: userAudience && userAudience !== 'all' ? userAudience : 'Ommaviy Qabul qiluvchilar',
      type,
      message,
      region: regionFilter && regionFilter !== 'all' ? regionFilter : 'Barcha viloyatlar',
      status: 'Qabul qilindi',
      sentAt,
      smsCount
    };

    const updated = [newLog, ...current];
    set({ notifications: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  addNotification: (notification) => {
    const message = notification.message || notification.title || 'Bildirishnoma';
    const type = notification.type || 'Bildirishnoma';
    get().sendNotification(message, type);
  },

  deleteNotification: (id) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    set({ notifications: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  resetNotifications: () => {
    set({ notifications: INITIAL_NOTIFICATIONS });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
}));

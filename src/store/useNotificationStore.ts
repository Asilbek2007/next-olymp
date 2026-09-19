import { create } from 'zustand';
import { NotificationLog, INITIAL_NOTIFICATIONS } from '../data/initialNotifications';

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

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,

  sendNotification: (message, type, regionFilter, userAudience) => {
    const current = get().notifications;
    const nextIdNum = 1001 + current.length;
    const id = `SMS-${nextIdNum}`;

    const now = new Date();
    const sentAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

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
      smsCount,
    };

    const updated = [newLog, ...current];
    set({ notifications: updated });
  },

  addNotification: (notification) => {
    const message = notification.message || notification.title || 'Bildirishnoma';
    const type = notification.type || 'Bildirishnoma';
    get().sendNotification(message, type);
  },

  deleteNotification: (id) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    set({ notifications: updated });
  },

  resetNotifications: () => {
    set({ notifications: INITIAL_NOTIFICATIONS });
  },
}));

import { create } from 'zustand';
import { UserItem, INITIAL_USERS } from '../data/initialUsers';
import { useLeaderboardStore } from './useLeaderboardStore';

interface UserState {
  users: UserItem[];
  addUser: (user: Omit<UserItem, 'id' | 'createdAt' | 'participationCount'>) => void;
  updateUser: (id: string, user: Partial<Omit<UserItem, 'id' | 'createdAt'>>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'next_olymp_users_v2';
const DELETED_USERS_KEY = 'next_olymp_deleted_user_ids';

const getDeletedUserIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set<string>();
};

const getInitialUsers = (): UserItem[] => {
  const usersMap = new Map<string, UserItem>();
  const deletedIds = getDeletedUserIds();

  // 1. Saved users in STORAGE_KEY
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach((u: UserItem) => {
          if (u && u.id && !deletedIds.has(u.id)) usersMap.set(u.id, u);
        });
      }
    }
  } catch (e) {
    console.error('Failed to read users from localStorage', e);
  }

  // 2. Read registered users from authService (next_olymp_registered_users)
  try {
    const regSaved = localStorage.getItem('next_olymp_registered_users');
    if (regSaved) {
      const regList = JSON.parse(regSaved);
      if (Array.isArray(regList)) {
        regList.forEach((r: any) => {
          if (
            r &&
            r.id &&
            !deletedIds.has(r.id) &&
            r.role !== 'admin' &&
            !r.id.includes('admin') &&
            !r.fullName?.toLowerCase().includes('admin')
          ) {
            const existing = usersMap.get(r.id);
            usersMap.set(r.id, {
              id: r.id,
              fullName: r.fullName || existing?.fullName || 'Ishtirokchi',
              gender: r.gender || existing?.gender || 'male',
              phone: r.phone || existing?.phone || '+998 90 123 45 67',
              role: r.role === 'teacher' ? 'teacher' : 'student',
              package: existing?.package || 'Bepul',
              status: existing?.status || 'active',
              region: r.region || existing?.region || 'Toshkent shahri',
              district: r.district || existing?.district || 'Yunusobod tumani',
              school: r.school || existing?.school || 'Prezident maktabi',
              grade: r.grade || existing?.grade || 9,
              createdAt: r.createdAt ? r.createdAt.split('T')[0] : (existing?.createdAt || new Date().toISOString().split('T')[0]),
              participationCount: existing?.participationCount || 0,
            });
          }
        });
      }
    }
  } catch {}

  // 3. Read current active user from next_olymp_user (Only if student or teacher)
  try {
    const curUserStr = localStorage.getItem('next_olymp_user');
    if (curUserStr) {
      const cur = JSON.parse(curUserStr);
      if (
        cur &&
        cur.id &&
        !deletedIds.has(cur.id) &&
        cur.role !== 'admin' &&
        !cur.id.includes('admin') &&
        !cur.fullName?.toLowerCase().includes('admin')
      ) {
        const existing = usersMap.get(cur.id);
        usersMap.set(cur.id, {
          id: cur.id,
          fullName: cur.fullName || existing?.fullName || 'Ishtirokchi',
          gender: cur.gender || existing?.gender || 'male',
          phone: cur.phone || existing?.phone || '+998 90 123 45 67',
          role: cur.role === 'teacher' ? 'teacher' : 'student',
          package: existing?.package || 'Bepul',
          status: existing?.status || 'active',
          region: cur.region || existing?.region || 'Toshkent shahri',
          district: cur.district || existing?.district || 'Yunusobod tumani',
          school: cur.school || existing?.school || 'Prezident maktabi',
          grade: cur.grade || existing?.grade || 9,
          createdAt: cur.createdAt ? cur.createdAt.split('T')[0] : (existing?.createdAt || new Date().toISOString().split('T')[0]),
          participationCount: existing?.participationCount || 0,
        });
      }
    }
  } catch {}

  // 4. Update participation counts from completed submissions
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submission_completed_') && !key.includes('_att_')) {
        const val = localStorage.getItem(key);
        if (val) {
          const sub = JSON.parse(val);
          if (sub && sub.userId && !deletedIds.has(sub.userId) && !sub.userId.includes('admin')) {
            if (usersMap.has(sub.userId)) {
              const existing = usersMap.get(sub.userId)!;
              existing.participationCount = (existing.participationCount || 0) + 1;
              if (sub.userName && !sub.userName.toLowerCase().includes('admin')) existing.fullName = sub.userName;
              if (sub.region) existing.region = sub.region;
              if (sub.school) existing.school = sub.school;
              if (sub.grade) existing.grade = sub.grade;
            } else {
              usersMap.set(sub.userId, {
                id: sub.userId,
                fullName: sub.userName || 'Ishtirokchi',
                gender: 'male',
                phone: sub.phone || '+998 90 123 45 67',
                role: 'student',
                package: 'Bepul',
                status: 'active',
                region: sub.region || 'Toshkent shahri',
                district: 'Yunusobod tumani',
                school: sub.school || 'Prezident maktabi',
                grade: sub.grade || 9,
                createdAt: sub.completedAt ? sub.completedAt.split('T')[0] : new Date().toISOString().split('T')[0],
                participationCount: 1,
              });
            }
          }
        }
      }
    }
  } catch {}

  // Filter out any admin accounts and deleted IDs from the platform users list
  const filteredList = Array.from(usersMap.values()).filter(
    (u) => !deletedIds.has(u.id) && u.role !== 'admin' && !u.id.includes('admin') && !u.fullName?.toLowerCase().includes('admin')
  );

  if (filteredList.length === 0 && INITIAL_USERS.length > 0) {
    return INITIAL_USERS.filter((u) => !deletedIds.has(u.id) && u.role !== 'admin' && !u.id.includes('admin'));
  }
  return filteredList;
};

export const useUserStore = create<UserState>((set, get) => {
  const saveState = (users: UserItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  };

  return {
    users: getInitialUsers(),

    addUser: (userData) => {
      const { users } = get();
      const newUser: UserItem = {
        ...userData,
        id: `USR-${1000 + users.length + 1}`,
        createdAt: new Date().toISOString().split('T')[0],
        participationCount: 0,
        status: userData.status || 'active'
      };
      const updated = [newUser, ...users];
      set({ users: updated });
      saveState(updated);
    },

    updateUser: (id, userData) => {
      const { users } = get();
      const updated = users.map((u) => (u.id === id ? { ...u, ...userData } : u));
      set({ users: updated });
      saveState(updated);
    },

    deleteUser: (id) => {
      const { users } = get();
      const updated = users.filter((u) => u.id !== id);
      set({ users: updated });
      saveState(updated);

      // Permanently record in deleted IDs set
      try {
        const deleted = getDeletedUserIds();
        deleted.add(id);
        localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(Array.from(deleted)));
      } catch {}

      // Clean up from next_olymp_registered_users
      try {
        const regStr = localStorage.getItem('next_olymp_registered_users');
        if (regStr) {
          const list = JSON.parse(regStr);
          if (Array.isArray(list)) {
            const cleanList = list.filter((u: any) => u.id !== id);
            localStorage.setItem('next_olymp_registered_users', JSON.stringify(cleanList));
          }
        }
      } catch {}

      // Remove from Leaderboard store
      try {
        useLeaderboardStore.getState().removeUser(id);
      } catch {}

      // Remove any completed submissions of this user
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith(`submission_completed_${id}_`) || key.includes(id))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    },

    toggleUserStatus: (id) => {
      const { users } = get();
      const updated = users.map((u) => {
        if (u.id === id) {
          return { ...u, status: u.status === 'active' ? ('blocked' as const) : ('active' as const) };
        }
        return u;
      });
      set({ users: updated });
      saveState(updated);
    },

    resetToDefaults: () => {
      set({ users: INITIAL_USERS });
      saveState(INITIAL_USERS);
    }
  };
});

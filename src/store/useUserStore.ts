import { create } from 'zustand';
import { UserItem, INITIAL_USERS } from '../data/initialUsers';
import { useLeaderboardStore } from './useLeaderboardStore';

interface UserState {
  users: UserItem[];
  fetchFromApi: () => Promise<void>;
  addUser: (user: Omit<UserItem, 'id' | 'createdAt' | 'participationCount'>) => void;
  updateUser: (id: string, user: Partial<Omit<UserItem, 'id' | 'createdAt'>>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  resetToDefaults: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: INITIAL_USERS,

  fetchFromApi: async () => {
    try {
      const res = await fetch('/api/users.php');
      if (res.ok) {
        const json = await res.json();
        const usersList = Array.isArray(json)
          ? json
          : json.status === 'success' && Array.isArray(json.data)
          ? json.data
          : null;

        if (usersList && usersList.length > 0) {
          const cleanUsers: UserItem[] = usersList
            .filter((u: any) => u && u.id && u.role !== 'admin' && !u.id.includes('admin'))
            .map((u: any) => ({
              id: u.id,
              fullName: u.fullName || u.name || 'Ishtirokchi',
              gender: u.gender || 'male',
              phone: u.phone || '+998 90 123 45 67',
              role: u.role === 'teacher' ? 'teacher' : 'student',
              package: u.package || 'Bepul',
              status: u.status || 'active',
              region: u.region || 'Toshkent shahri',
              district: u.district || 'Yunusobod tumani',
              school: u.school || 'Prezident maktabi',
              grade: u.grade || 9,
              createdAt: u.createdAt ? u.createdAt.split(' ')[0].split('T')[0] : new Date().toISOString().split('T')[0],
              participationCount: u.participationCount || 0,
            }));

          set({ users: cleanUsers });
        }
      }
    } catch (e) {
      console.warn('User API fetch warning:', e);
    }
  },

  addUser: (userData) => {
    const { users } = get();
    const newUser: UserItem = {
      ...userData,
      id: `USR-${1000 + users.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
      participationCount: 0,
      status: userData.status || 'active',
    };
    const updated = [newUser, ...users];
    set({ users: updated });

    // Save directly to MySQL API
    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch((e) => console.warn('User API sync warning:', e));
  },

  updateUser: (id, userData) => {
    const { users } = get();
    const updated = users.map((u) => (u.id === id ? { ...u, ...userData } : u));
    set({ users: updated });

    const target = updated.find((u) => u.id === id);
    if (target) {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      }).catch((e) => console.warn('User API sync warning:', e));
    }
  },

  deleteUser: (id) => {
    const { users } = get();
    const updated = users.filter((u) => u.id !== id);
    set({ users: updated });

    // Delete from MySQL API
    fetch(`/api/users.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('User API delete warning:', e));

    try {
      useLeaderboardStore.getState().removeUser(id);
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

    const target = updated.find((u) => u.id === id);
    if (target) {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      }).catch((e) => console.warn('User API sync warning:', e));
    }
  },

  resetToDefaults: () => {
    set({ users: INITIAL_USERS });
  },
}));

// Auto-fetch users from MySQL API on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useUserStore.getState().fetchFromApi();
  }, 100);
}
